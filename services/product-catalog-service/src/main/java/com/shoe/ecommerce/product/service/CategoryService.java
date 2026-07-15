package com.shoe.ecommerce.product.service;

import com.shoe.ecommerce.product.entity.Category;
import com.shoe.ecommerce.product.repository.CategoryRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class CategoryService {

    private final CategoryRepository categoryRepository;

    public CategoryService(CategoryRepository categoryRepository) {
        this.categoryRepository = categoryRepository;
    }

    public List<Category> findAll() {
        return categoryRepository.findAll();
    }

    public Optional<Category> findById(Long id) {
        return categoryRepository.findById(id);
    }

    public Category create(Category category) {
        if (categoryRepository.existsByName(category.getName())) {
            throw new RuntimeException("Danh mục '" + category.getName() + "' đã tồn tại!");
        }
        return categoryRepository.save(category);
    }

    public Category update(Long id, Category updatedCategory) {
        return categoryRepository.findById(id).map(existing -> {
            // Check if new name conflicts with another category
            if (!existing.getName().equals(updatedCategory.getName()) 
                    && categoryRepository.existsByName(updatedCategory.getName())) {
                throw new RuntimeException("Danh mục '" + updatedCategory.getName() + "' đã tồn tại!");
            }
            existing.setName(updatedCategory.getName());
            existing.setDescription(updatedCategory.getDescription());
            return categoryRepository.save(existing);
        }).orElseThrow(() -> new RuntimeException("Không tìm thấy danh mục với id: " + id));
    }

    public void delete(Long id) {
        if (!categoryRepository.existsById(id)) {
            throw new RuntimeException("Không tìm thấy danh mục với id: " + id);
        }
        categoryRepository.deleteById(id);
    }
}
