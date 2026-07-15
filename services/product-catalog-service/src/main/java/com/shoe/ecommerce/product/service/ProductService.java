package com.shoe.ecommerce.product.service;

import com.shoe.ecommerce.product.entity.Product;
import com.shoe.ecommerce.product.repository.ProductRepository;
import org.springframework.stereotype.Service;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;

import java.util.List;
import java.util.Optional;

@Service
public class ProductService {
    
    private final ProductRepository productRepository;

    public ProductService(ProductRepository productRepository) {
        this.productRepository = productRepository;
    }

    @Cacheable(value = "products")
    public List<Product> getAllProducts(String category) {
        System.out.println("Fetching products from DB (Not from Cache)");
        if (category != null && !category.isEmpty()) {
            return productRepository.findByCategory(category);
        }
        return productRepository.findAll();
    }

    public org.springframework.data.domain.Page<Product> getPagedProducts(String category, String search, org.springframework.data.domain.Pageable pageable) {
        return productRepository.findWithFilters(category, search, pageable);
    }

    public List<Product> getFeaturedProducts() {
        return productRepository.findByIsFeaturedTrue();
    }

    public List<Product> getBestSellingProducts() {
        return productRepository.findTop10ByOrderBySalesCountDesc();
    }

    public Optional<Product> getProductById(Long id) {
        return productRepository.findById(id);
    }

    @CacheEvict(value = "products", allEntries = true)
    public Product createProduct(Product product) {
        return productRepository.save(product);
    }

    @CacheEvict(value = "products", allEntries = true)
    public Product updateProduct(Long id, Product updatedProduct) {
        return productRepository.findById(id).map(existing -> {
            existing.setName(updatedProduct.getName());
            existing.setDescription(updatedProduct.getDescription());
            existing.setBasePrice(updatedProduct.getBasePrice());
            existing.setImageUrl(updatedProduct.getImageUrl());
            existing.setBrand(updatedProduct.getBrand());
            existing.setCategory(updatedProduct.getCategory());
            existing.setSalesCount(updatedProduct.getSalesCount());
            existing.setIsFeatured(updatedProduct.getIsFeatured());
            existing.setStockQuantityMen(updatedProduct.getStockQuantityMen());
            existing.setStockQuantityWomen(updatedProduct.getStockQuantityWomen());
            return productRepository.save(existing);
        }).orElseThrow(() -> new RuntimeException("Product not found with id: " + id));
    }

    @CacheEvict(value = "products", allEntries = true)
    public void deleteProduct(Long id) {
        productRepository.deleteById(id);
    }

    @CacheEvict(value = "products", allEntries = true)
    public void deductStock(com.shoe.ecommerce.product.dto.StockDeductRequest request) {
        for (com.shoe.ecommerce.product.dto.StockDeductRequest.StockDeductItem item : request.getItems()) {
            productRepository.findById(item.getProductId()).ifPresent(product -> {
                if ("Men".equalsIgnoreCase(item.getGender())) {
                    int current = product.getStockQuantityMen() != null ? product.getStockQuantityMen() : 0;
                    product.setStockQuantityMen(Math.max(0, current - item.getQuantity()));
                } else if ("Women".equalsIgnoreCase(item.getGender())) {
                    int current = product.getStockQuantityWomen() != null ? product.getStockQuantityWomen() : 0;
                    product.setStockQuantityWomen(Math.max(0, current - item.getQuantity()));
                }
                productRepository.save(product);
            });
        }
    }
}
