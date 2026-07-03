package com.shoe.ecommerce.order.controller;

import com.shoe.ecommerce.order.entity.Order;
import com.shoe.ecommerce.order.service.OrderService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import jakarta.servlet.http.HttpSession;
import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("/api/orders")
public class OrderController {

    private final OrderService orderService;

    public OrderController(OrderService orderService) {
        this.orderService = orderService;
    }

    // Dummy Request DTO
    public static class OrderRequest {
        public Long productId;
        public Long userId;
    }
    
    public static class CartItem implements java.io.Serializable {
        private static final long serialVersionUID = 1L;
        public Long productId;
        public String name;
        public Integer price;
    }

    @PostMapping("/cart")
    public ResponseEntity<?> addToCart(@RequestBody CartItem item, HttpSession session) {
        List<CartItem> cart = (List<CartItem>) session.getAttribute("CART");
        if (cart == null) {
            cart = new ArrayList<>();
        }
        cart.add(item);
        session.setAttribute("CART", cart);
        return ResponseEntity.ok(cart);
    }

    @GetMapping("/cart")
    public ResponseEntity<?> getCart(HttpSession session) {
        List<CartItem> cart = (List<CartItem>) session.getAttribute("CART");
        if (cart == null) {
            cart = new ArrayList<>();
        }
        return ResponseEntity.ok(cart);
    }
    
    @DeleteMapping("/cart")
    public ResponseEntity<?> clearCart(HttpSession session) {
        session.removeAttribute("CART");
        return ResponseEntity.ok("Cart cleared");
    }

    @PostMapping("/checkout")
    public ResponseEntity<?> checkoutCart(@RequestHeader(value = "X-User-Id", required = false) String headerUserId, HttpSession session) {
        List<CartItem> cart = (List<CartItem>) session.getAttribute("CART");
        if (cart == null || cart.isEmpty()) {
            return ResponseEntity.badRequest().body("Cart is empty");
        }
        
        Long userId = 0L;
        if (headerUserId != null && !headerUserId.isEmpty()) {
            userId = Long.parseLong(headerUserId);
        }
        
        // For simplicity, we create one order per cart item, or one aggregated order.
        // We'll create one aggregated order if possible, but our Order entity currently has totalAmount but no order items mapping!
        // We'll just call createOrder for the first item for now to satisfy the existing method signature.
        try {
            Order order = orderService.createOrder(cart.get(0).productId, userId);
            session.removeAttribute("CART");
            return ResponseEntity.ok(order);
        } catch (Exception e) {
            return ResponseEntity.status(503).body(e.getMessage());
        }
    }

    @PostMapping
    public ResponseEntity<?> placeOrder(@RequestBody OrderRequest request, @RequestHeader(value = "X-User-Id", required = false) String headerUserId) {
        try {
            Long userId = request.userId;
            if (headerUserId != null && !headerUserId.isEmpty()) {
                userId = Long.parseLong(headerUserId);
            }
            Order order = orderService.createOrder(request.productId, userId);
            return ResponseEntity.ok(order);
        } catch (Exception e) {
            return ResponseEntity.status(503).body(e.getMessage());
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getOrder(@PathVariable Long id, @RequestHeader(value = "X-User-Id", required = false) String userIdStr) {
        Order order = orderService.findById(id);
        if (order == null) return ResponseEntity.notFound().build();
        
        Long userId = null;
        if (userIdStr != null && !userIdStr.isEmpty()) {
            userId = Long.parseLong(userIdStr);
        }
        
        if (userId != null && !order.getUserId().equals(userId)) {
            return ResponseEntity.status(403).body("Forbidden: You don't have permission to view this order.");
        }
        
        return ResponseEntity.ok(order);
    }

    // Admin: Get all orders
    @GetMapping("/all")
    public ResponseEntity<?> getAllOrders() {
        return ResponseEntity.ok(orderService.findAllOrders());
    }

    // Admin: Update order status
    public static class StatusUpdateRequest {
        public String status;
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<?> updateOrderStatus(@PathVariable Long id, @RequestBody StatusUpdateRequest request) {
        Order order = orderService.findById(id);
        if (order == null) return ResponseEntity.notFound().build();
        orderService.updateOrderStatus(order.getOrderCode(), request.status);
        return ResponseEntity.ok("Order status updated to " + request.status);
    }
}
