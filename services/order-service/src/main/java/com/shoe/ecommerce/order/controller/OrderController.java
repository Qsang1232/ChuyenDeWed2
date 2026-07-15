package com.shoe.ecommerce.order.controller;

import com.shoe.ecommerce.order.entity.Order;
import com.shoe.ecommerce.order.service.OrderService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import jakarta.servlet.http.HttpSession;
import java.util.ArrayList;
import java.util.List;

import com.shoe.ecommerce.order.service.CouponService;
import com.shoe.ecommerce.order.entity.Coupon;

@RestController
@RequestMapping("/api/orders")
public class OrderController {

    private final OrderService orderService;
    private final CouponService couponService;

    public OrderController(OrderService orderService, CouponService couponService) {
        this.orderService = orderService;
        this.couponService = couponService;
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
        public Double price;
        public String gender;
        public Integer size;
        public Integer quantity;
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
    public ResponseEntity<?> checkoutCart(
            @RequestHeader(value = "X-User-Id", required = false) String headerUserId,
            @RequestBody(required = false) java.util.Map<String, Object> body,
            HttpSession session) {
        List<CartItem> cart = (List<CartItem>) session.getAttribute("CART");
        if (cart == null || cart.isEmpty()) {
            return ResponseEntity.badRequest().body("Cart is empty");
        }
        
        Long userId = 0L;
        if (headerUserId != null && !headerUserId.isEmpty()) {
            userId = Long.parseLong(headerUserId);
        }
        
        // Aggregate total from all cart items
        double total = cart.stream()
                .mapToDouble(item -> (item.price != null ? item.price : 0.0) * (item.quantity != null ? item.quantity : 1))
                .sum();
        
        // Apply coupon if present
        if (body != null && body.containsKey("couponCode")) {
            String couponCode = (String) body.get("couponCode");
            if (couponCode != null && !couponCode.isEmpty()) {
                try {
                    Coupon coupon = couponService.validateCoupon(couponCode);
                    double discount = (total * coupon.getDiscountPercentage()) / 100.0;
                    if (coupon.getMaxDiscount() != null && discount > coupon.getMaxDiscount()) {
                        discount = coupon.getMaxDiscount();
                    }
                    total = total - discount;
                    if (total < 0) total = 0;
                } catch (Exception e) {
                    return ResponseEntity.badRequest().body(e.getMessage());
                }
            }
        }
        
        try {
            Order order = orderService.createAggregatedOrder(cart, userId, total);
            session.removeAttribute("CART");
            return ResponseEntity.ok(order);
        } catch (Exception e) {
            return ResponseEntity.status(400).body(e.getMessage());
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

    // Get orders - ADMIN sees all, USER sees own orders
    @GetMapping("/all")
    public ResponseEntity<?> getAllOrders(
            @RequestHeader(value = "X-Auth-Role", required = false) String role,
            @RequestHeader(value = "X-User-Id", required = false) String headerUserId) {
        if ("ADMIN".equals(role)) {
            return ResponseEntity.ok(orderService.findAllOrders());
        }
        // Non-admin users can only see their own orders
        if (headerUserId != null && !headerUserId.isEmpty()) {
            Long userId = Long.parseLong(headerUserId);
            return ResponseEntity.ok(orderService.findOrdersByUserId(userId));
        }
        return ResponseEntity.status(403).body("Forbidden");
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<?> getOrdersByUserId(
            @PathVariable Long userId,
            @RequestHeader(value = "X-Auth-Role", required = false) String role) {
        if ("ADMIN".equals(role)) {
            return ResponseEntity.ok(orderService.findOrdersByUserId(userId));
        }
        return ResponseEntity.status(403).body("Forbidden: Admins only");
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
