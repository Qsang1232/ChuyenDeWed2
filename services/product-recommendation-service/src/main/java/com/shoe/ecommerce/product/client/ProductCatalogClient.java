package com.shoe.ecommerce.product.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;

import java.util.List;
import java.util.Map;

@FeignClient(name = "product-catalog-service")
public interface ProductCatalogClient {

    @GetMapping("/api/products")
    List<Map<String, Object>> getAllProducts();
}
