package com.shoe.ecommerce.product.controller;

import com.shoe.ecommerce.product.entity.Review;
import com.shoe.ecommerce.product.service.ReviewService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/products/{productId}/reviews")
public class ReviewController {
    
    private final ReviewService reviewService;
    
    public ReviewController(ReviewService reviewService) {
        this.reviewService = reviewService;
    }
    
    @GetMapping
    public ResponseEntity<List<Review>> getReviews(@PathVariable Long productId) {
        return ResponseEntity.ok(reviewService.getReviewsByProductId(productId));
    }
    
    @PostMapping
    public ResponseEntity<?> addReview(
            @PathVariable Long productId, 
            @RequestHeader(value = "X-User-Id", required = false) String userId,
            @RequestBody Review review) {
        
        if (userId == null || userId.isEmpty()) {
            return ResponseEntity.status(401).body("Unauthorized");
        }
        
        review.setProductId(productId);
        review.setUserId(Long.parseLong(userId));
        
        return ResponseEntity.ok(reviewService.addReview(review));
    }
}
