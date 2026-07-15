package com.shoe.ecommerce.order.controller;

import com.shoe.ecommerce.order.entity.Coupon;
import com.shoe.ecommerce.order.service.CouponService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/orders/coupons")
public class CouponController {

    private final CouponService couponService;

    public CouponController(CouponService couponService) {
        this.couponService = couponService;
    }

    @GetMapping("/{code}")
    public ResponseEntity<?> validateCoupon(@PathVariable String code) {
        try {
            Coupon coupon = couponService.validateCoupon(code);
            return ResponseEntity.ok(coupon);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
