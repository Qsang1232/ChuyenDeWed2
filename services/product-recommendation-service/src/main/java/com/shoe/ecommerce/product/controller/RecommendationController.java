package com.shoe.ecommerce.product.controller;

import com.shoe.ecommerce.product.client.ProductCatalogClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Collections;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/recommendations")
public class RecommendationController {

    private final ProductCatalogClient catalogClient;

    public RecommendationController(ProductCatalogClient catalogClient) {
        this.catalogClient = catalogClient;
    }

    @GetMapping
    public List<Map<String, Object>> getRecommendations() {
        List<Map<String, Object>> allProducts = catalogClient.getAllProducts();
        if (allProducts == null || allProducts.isEmpty()) {
            return Collections.emptyList();
        }
        
        // Simple logic: Shuffle and return up to 2 products as recommendations
        Collections.shuffle(allProducts);
        return allProducts.subList(0, Math.min(2, allProducts.size()));
    }
}
