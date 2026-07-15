package com.shoe.ecommerce.order.dto;

public class ProductDto {
    private Long id;
    private String name;
    private double basePrice;
    private Integer stockQuantityMen;
    private Integer stockQuantityWomen;

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public double getBasePrice() { return basePrice; }
    public void setBasePrice(double basePrice) { this.basePrice = basePrice; }
    public Integer getStockQuantityMen() { return stockQuantityMen; }
    public void setStockQuantityMen(Integer stockQuantityMen) { this.stockQuantityMen = stockQuantityMen; }
    public Integer getStockQuantityWomen() { return stockQuantityWomen; }
    public void setStockQuantityWomen(Integer stockQuantityWomen) { this.stockQuantityWomen = stockQuantityWomen; }
}
