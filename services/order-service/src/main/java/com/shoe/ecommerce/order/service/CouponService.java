package com.shoe.ecommerce.order.service;

import com.shoe.ecommerce.order.entity.Coupon;
import com.shoe.ecommerce.order.repository.CouponRepository;
import org.springframework.stereotype.Service;

import jakarta.annotation.PostConstruct;

@Service
public class CouponService {
    private final CouponRepository couponRepository;

    public CouponService(CouponRepository couponRepository) {
        this.couponRepository = couponRepository;
    }

    @PostConstruct
    public void initCoupons() {
        if (couponRepository.count() == 0) {
            Coupon c1 = new Coupon();
            c1.setCode("WELCOME10");
            c1.setDiscountPercentage(10.0);
            c1.setMaxDiscount(500000.0);
            couponRepository.save(c1);

            Coupon c2 = new Coupon();
            c2.setCode("FREESHIP");
            c2.setDiscountPercentage(100.0);
            c2.setMaxDiscount(30000.0);
            couponRepository.save(c2);
            
            Coupon c3 = new Coupon();
            c3.setCode("SALE20");
            c3.setDiscountPercentage(20.0);
            c3.setMaxDiscount(1000000.0);
            couponRepository.save(c3);
        }
    }

    public Coupon validateCoupon(String code) {
        Coupon coupon = couponRepository.findByCode(code.toUpperCase())
                .orElseThrow(() -> new RuntimeException("Mã giảm giá không tồn tại!"));
        
        if (!coupon.getIsActive()) {
            throw new RuntimeException("Mã giảm giá đã hết hạn hoặc không còn hiệu lực!");
        }
        return coupon;
    }
}
