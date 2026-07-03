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

    public void updateOrderStatus(String orderCode, String status) {
        // Tìm đơn hàng theo orderCode (Wait, repository có hàm findByOrderCode chưa?)
        // Let's assume orderRepository doesn't have it yet. I need to add it to OrderRepository!
        // But for now, let's just write the method call. I will update OrderRepository next.
        orderRepository.findByOrderCode(orderCode).ifPresent(order -> {
            order.setStatus(status);
            orderRepository.save(order);
        });
    }

    public Order findById(Long id) {
        return orderRepository.findById(id).orElse(null);
    }

    public java.util.List<Order> findAllOrders() {
        return orderRepository.findAll();
    }
}
