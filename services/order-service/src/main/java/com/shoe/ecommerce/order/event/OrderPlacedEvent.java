package com.shoe.ecommerce.order.event;

public class OrderPlacedEvent {
    private String orderCode;
    private String productId;
    private Long userId;

    public OrderPlacedEvent() {}

    public OrderPlacedEvent(String orderCode, String productId, Long userId) {
        this.orderCode = orderCode;
        this.productId = productId;
        this.userId = userId;
    }

    public String getOrderCode() { return orderCode; }
    public void setOrderCode(String orderCode) { this.orderCode = orderCode; }

    public String getProductId() { return productId; }
    public void setProductId(String productId) { this.productId = productId; }

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }
}
