package com.shoe.ecommerce.order.event;

import com.shoe.ecommerce.order.config.RabbitMQConfig;
import com.shoe.ecommerce.order.service.OrderService;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;

@Component
public class OrderProcessingListener {

    private final OrderService orderService;

    public OrderProcessingListener(OrderService orderService) {
        this.orderService = orderService;
    }

    @RabbitListener(queues = RabbitMQConfig.ORDER_QUEUE)
    public void processOrder(OrderPlacedEvent event) {
        System.out.println("Received order created event: " + event.getOrderCode());
        try {
            // Simulate payment processing time
            Thread.sleep(2000);
            
            // Mark order as completed
            orderService.updateOrderStatus(event.getOrderCode(), "COMPLETED");
            System.out.println("Order " + event.getOrderCode() + " successfully processed and COMPLETED.");
            
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt(); // Restore interrupt flag
            System.err.println("Order processing interrupted: " + e.getMessage());
        }
    }
}
