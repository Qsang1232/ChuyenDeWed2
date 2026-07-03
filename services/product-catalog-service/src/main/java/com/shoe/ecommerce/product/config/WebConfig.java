package com.shoe.ecommerce.product.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // Serve uploaded files from /app/uploads/ directory
        registry.addResourceHandler("/api/uploads/**")
                .addResourceLocations("file:/app/uploads/");
    }
}
