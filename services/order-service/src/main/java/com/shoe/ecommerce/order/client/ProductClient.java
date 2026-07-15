package com.shoe.ecommerce.order.client;

import com.shoe.ecommerce.order.dto.ProductDto;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

// Connects to "product-service" via Eureka
@FeignClient(name = "product-catalog-service")
public interface ProductClient {
    
    @GetMapping("/api/products/{id}")
    ProductDto getProductById(@PathVariable("id") Long id);

    @org.springframework.web.bind.annotation.PostMapping("/api/products/deduct-stock")
    void deductStock(@org.springframework.web.bind.annotation.RequestBody com.shoe.ecommerce.order.dto.StockDeductRequest request);
}
