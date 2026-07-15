package com.shoe.ecommerce.product.service;

import com.shoe.ecommerce.product.entity.Brand;
import com.shoe.ecommerce.product.repository.BrandRepository;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;

@Service
public class BrandService {
    
    private final BrandRepository brandRepository;

    public BrandService(BrandRepository brandRepository) {
        this.brandRepository = brandRepository;
    }

    public List<Brand> getAllBrands() {
        return brandRepository.findAll();
    }

    public Optional<Brand> getBrandById(Long id) {
        return brandRepository.findById(id);
    }

    public Brand createBrand(Brand brand) {
        if (brandRepository.findByName(brand.getName()).isPresent()) {
            throw new RuntimeException("Brand already exists");
        }
        return brandRepository.save(brand);
    }

    public Brand updateBrand(Long id, Brand updatedBrand) {
        return brandRepository.findById(id).map(brand -> {
            brand.setName(updatedBrand.getName());
            brand.setDescription(updatedBrand.getDescription());
            brand.setLogoUrl(updatedBrand.getLogoUrl());
            return brandRepository.save(brand);
        }).orElseThrow(() -> new RuntimeException("Brand not found"));
    }

    public void deleteBrand(Long id) {
        brandRepository.deleteById(id);
    }
}
