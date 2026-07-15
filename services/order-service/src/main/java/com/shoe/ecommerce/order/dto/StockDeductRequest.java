package com.shoe.ecommerce.order.dto;

import java.util.List;

public class StockDeductRequest {
    private List<StockDeductItem> items;

    public List<StockDeductItem> getItems() {
        return items;
    }

    public void setItems(List<StockDeductItem> items) {
        this.items = items;
    }

    public static class StockDeductItem {
        private Long productId;
        private String gender; // "Men" or "Women"
        private Integer quantity;

        public Long getProductId() { return productId; }
        public void setProductId(Long productId) { this.productId = productId; }

        public String getGender() { return gender; }
        public void setGender(String gender) { this.gender = gender; }

        public Integer getQuantity() { return quantity; }
        public void setQuantity(Integer quantity) { this.quantity = quantity; }
    }
}
