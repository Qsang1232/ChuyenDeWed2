package com.shoe.ecommerce.order.service;

import com.shoe.ecommerce.order.client.ProductClient;
import com.shoe.ecommerce.order.dto.ProductDto;
import com.shoe.ecommerce.order.entity.Order;
import com.shoe.ecommerce.order.repository.OrderRepository;
import io.github.resilience4j.circuitbreaker.annotation.CircuitBreaker;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.UUID;

import com.shoe.ecommerce.order.config.RabbitMQConfig;
import com.shoe.ecommerce.order.event.OrderPlacedEvent;
import org.springframework.amqp.rabbit.core.RabbitTemplate;

@Service
public class OrderService {
    
    private final OrderRepository orderRepository;
    private final ProductClient productClient;
    private final RabbitTemplate rabbitTemplate;

    public OrderService(OrderRepository orderRepository, ProductClient productClient, RabbitTemplate rabbitTemplate) {
        this.orderRepository = orderRepository;
        this.productClient = productClient;
        this.rabbitTemplate = rabbitTemplate;
    }

    @CircuitBreaker(name = "productService", fallbackMethod = "fallbackCreateOrder")
    public Order createOrder(Long productId, Long userId) {
        // 1. Synchronously call product-service to verify product exists and get price
        ProductDto product = productClient.getProductById(productId);
        
        if (product == null) {
            throw new RuntimeException("Product not found!");
        }

        // 2. Create the order based on fetched product data
        Order order = new Order();
        order.setOrderCode(UUID.randomUUID().toString());
        order.setUserId(userId);
        order.setTotalAmount(BigDecimal.valueOf(product.getBasePrice()));
        order.setStatus("PENDING");
        
        Order savedOrder = orderRepository.save(order);
        
        // 3. Publish Event asynchronously
        OrderPlacedEvent event = new OrderPlacedEvent(savedOrder.getOrderCode(), String.valueOf(productId), userId);
        rabbitTemplate.convertAndSend(RabbitMQConfig.ORDER_EXCHANGE, "order.created", event);
        System.out.println("Published OrderPlacedEvent for Order Code: " + savedOrder.getOrderCode());

        return savedOrder;
    }
    
    // Fallback method executed when ProductService is down or times out
    public Order fallbackCreateOrder(Long productId, Long userId, Throwable t) {
        System.err.println("Fallback activated! Error communicating with Product Service: " + t.getMessage());
        throw new RuntimeException("Dịch vụ kiểm tra kho hàng tạm thời gián đoạn, vui lòng thử lại sau. Lý do: " + t.getMessage());
    }

    public Order fallbackCreateAggregatedOrder(java.util.List<com.shoe.ecommerce.order.controller.OrderController.CartItem> cart, Long userId, double totalAmount, Throwable t) {
        System.err.println("Fallback activated! Error communicating with Product Service during aggregated checkout: " + t.getMessage());
        throw new RuntimeException("Dịch vụ kiểm tra kho hàng (Product Service) tạm thời không phản hồi. Vui lòng thử thanh toán lại sau ít phút.");
    }

    /**
     * Create an order with a pre-calculated total (used for multi-item cart checkout).
     * Skips product-service call since total is already computed from cart items.
     */
    @CircuitBreaker(name = "productService", fallbackMethod = "fallbackCreateAggregatedOrder")
    public Order createAggregatedOrder(java.util.List<com.shoe.ecommerce.order.controller.OrderController.CartItem> cart, Long userId, double totalAmount) {
        // 1. Verify stock for all items synchronously
        for (com.shoe.ecommerce.order.controller.OrderController.CartItem item : cart) {
            ProductDto product = productClient.getProductById(item.productId);
            if (product == null) {
                throw new RuntimeException("Sản phẩm không tồn tại: " + item.name);
            }
            int requestedQuantity = item.quantity != null ? item.quantity : 1;
            int available = 0;
            if ("Men".equalsIgnoreCase(item.gender)) {
                available = product.getStockQuantityMen() != null ? product.getStockQuantityMen() : 0;
            } else if ("Women".equalsIgnoreCase(item.gender)) {
                available = product.getStockQuantityWomen() != null ? product.getStockQuantityWomen() : 0;
            }
            if (available < requestedQuantity) {
                throw new RuntimeException("Sản phẩm " + item.name + " không đủ số lượng tồn kho!");
            }
        }

        // 2. Create the order
        Order order = new Order();
        order.setOrderCode(UUID.randomUUID().toString());
        order.setUserId(userId);
        order.setTotalAmount(java.math.BigDecimal.valueOf(totalAmount));
        order.setStatus("PENDING");

        // 3. Create OrderItems
        for (com.shoe.ecommerce.order.controller.OrderController.CartItem cartItem : cart) {
            com.shoe.ecommerce.order.entity.OrderItem orderItem = new com.shoe.ecommerce.order.entity.OrderItem();
            orderItem.setProductId(cartItem.productId);
            orderItem.setName(cartItem.name);
            orderItem.setPrice(cartItem.price);
            orderItem.setGender(cartItem.gender);
            orderItem.setSize(cartItem.size);
            orderItem.setQuantity(cartItem.quantity != null ? cartItem.quantity : 1);
            order.addOrderItem(orderItem);
        }

        Order savedOrder = orderRepository.save(order);

        // Publish event asynchronously
        OrderPlacedEvent event = new OrderPlacedEvent(savedOrder.getOrderCode(), String.valueOf(cart.get(0).productId), userId);
        rabbitTemplate.convertAndSend(RabbitMQConfig.ORDER_EXCHANGE, "order.created", event);
        System.out.println("Published OrderPlacedEvent for aggregated Order Code: " + savedOrder.getOrderCode());

        return savedOrder;
    }

    @org.springframework.transaction.annotation.Transactional
    public void updateOrderStatus(String orderCode, String status) {
        orderRepository.findByOrderCode(orderCode).ifPresent(order -> {
            boolean wasNotCompleted = !"COMPLETED".equals(order.getStatus());
            order.setStatus(status);
            orderRepository.save(order);
            
            if ("COMPLETED".equals(status) && wasNotCompleted && !order.getOrderItems().isEmpty()) {
                com.shoe.ecommerce.order.dto.StockDeductRequest request = new com.shoe.ecommerce.order.dto.StockDeductRequest();
                java.util.List<com.shoe.ecommerce.order.dto.StockDeductRequest.StockDeductItem> items = new java.util.ArrayList<>();
                for (com.shoe.ecommerce.order.entity.OrderItem oi : order.getOrderItems()) {
                    com.shoe.ecommerce.order.dto.StockDeductRequest.StockDeductItem item = new com.shoe.ecommerce.order.dto.StockDeductRequest.StockDeductItem();
                    item.setProductId(oi.getProductId());
                    item.setGender(oi.getGender());
                    item.setQuantity(oi.getQuantity() != null ? oi.getQuantity() : 1);
                    items.add(item);
                }
                request.setItems(items);
                try {
                    productClient.deductStock(request);
                    System.out.println("Deducted stock for order: " + orderCode);
                } catch (Exception e) {
                    System.err.println("Failed to deduct stock for order " + orderCode + ": " + e.getMessage());
                }
            }
        });
    }

    public Order findById(Long id) {
        return orderRepository.findById(id).orElse(null);
    }

    public java.util.List<Order> findAllOrders() {
        return orderRepository.findAll();
    }

    public java.util.List<Order> findOrdersByUserId(Long userId) {
        return orderRepository.findByUserId(userId);
    }
}
