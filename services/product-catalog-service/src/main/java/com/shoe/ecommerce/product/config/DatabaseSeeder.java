package com.shoe.ecommerce.product.config;

import com.shoe.ecommerce.product.entity.Category;
import com.shoe.ecommerce.product.entity.Product;
import com.shoe.ecommerce.product.repository.CategoryRepository;
import com.shoe.ecommerce.product.repository.ProductRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.Arrays;
import java.util.List;

@Component
public class DatabaseSeeder implements CommandLineRunner {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;

    public DatabaseSeeder(ProductRepository productRepository, CategoryRepository categoryRepository) {
        this.productRepository = productRepository;
        this.categoryRepository = categoryRepository;
    }

    @Override
    public void run(String... args) throws Exception {
        // Seed categories
        if (categoryRepository.count() == 0) {
            List<String> defaultCategories = List.of(
                "Giày Thể Thao", "Giày Chạy Bộ", "Giày Bóng Rổ",
                "Sneaker Thời Trang", "Giày Lười", "Giày Đá Bóng"
            );
            for (String name : defaultCategories) {
                Category cat = new Category();
                cat.setName(name);
                categoryRepository.save(cat);
            }
            System.out.println("Đã nạp danh mục mặc định thành công!");
        }

        // Seed products
        if (productRepository.count() == 0) {
            Product product1 = new Product();
            product1.setName("Adidas Ultraboost 22");
            product1.setBasePrice(3200000.0);
            product1.setImageUrl("https://images.unsplash.com/photo-1608231387042-66d1773070a5?q=80&w=1000&auto=format&fit=crop");
            product1.setBrand("Adidas");
            product1.setCategory("Giày Chạy Bộ");
            product1.setDescription("Công nghệ Boost hoàn trả năng lượng tối đa");
            
            Product product2 = new Product();
            product2.setName("Nike Air Max 270");
            product2.setBasePrice(2800000.0);
            product2.setImageUrl("https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=1000&auto=format&fit=crop");
            product2.setBrand("Nike");
            product2.setCategory("Giày Thể Thao");
            product2.setDescription("Mẫu giày chạy bộ êm ái, đệm khí hiện đại");

            productRepository.saveAll(Arrays.asList(product1, product2));
            System.out.println("Đã nạp dữ liệu giày mẫu thành công!");
        }
    }
}

