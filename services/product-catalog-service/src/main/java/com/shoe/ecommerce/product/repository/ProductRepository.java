package com.shoe.ecommerce.product.repository;

import com.shoe.ecommerce.product.entity.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {
    List<Product> findByCategory(String category);
    Page<Product> findByCategory(String category, Pageable pageable);
    
    @Query("SELECT p FROM Product p WHERE (:category IS NULL OR :category = '' OR p.category = :category OR LOWER(p.brand) = LOWER(:category)) AND (:search IS NULL OR :search = '' OR LOWER(p.name) LIKE LOWER(CONCAT('%', :search, '%')))")
    Page<Product> findWithFilters(@Param("category") String category, @Param("search") String search, Pageable pageable);
    
    List<Product> findByIsFeaturedTrue();
    List<Product> findTop10ByOrderBySalesCountDesc();
}

