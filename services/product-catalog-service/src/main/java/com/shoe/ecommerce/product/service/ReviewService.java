package com.shoe.ecommerce.product.service;

import com.shoe.ecommerce.product.entity.Product;
import com.shoe.ecommerce.product.entity.Review;
import com.shoe.ecommerce.product.repository.ProductRepository;
import com.shoe.ecommerce.product.repository.ReviewRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class ReviewService {
    private final ReviewRepository reviewRepository;
    private final ProductRepository productRepository;

    public ReviewService(ReviewRepository reviewRepository, ProductRepository productRepository) {
        this.reviewRepository = reviewRepository;
        this.productRepository = productRepository;
    }

    public List<Review> getReviewsByProductId(Long productId) {
        return reviewRepository.findByProductIdOrderByCreatedAtDesc(productId);
    }

    @Transactional
    public Review addReview(Review review) {
        Product product = productRepository.findById(review.getProductId())
                .orElseThrow(() -> new RuntimeException("Product not found"));

        Review savedReview = reviewRepository.save(review);

        // Update product rating
        int currentCount = product.getReviewCount() != null ? product.getReviewCount() : 0;
        double currentTotal = (product.getAverageRating() != null ? product.getAverageRating() : 0.0) * currentCount;
        
        int newCount = currentCount + 1;
        double newAverage = (currentTotal + review.getRating()) / newCount;

        product.setReviewCount(newCount);
        product.setAverageRating(Math.round(newAverage * 10.0) / 10.0); // 1 decimal place
        productRepository.save(product);

        return savedReview;
    }
}
