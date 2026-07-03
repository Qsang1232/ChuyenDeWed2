package com.shoe.ecommerce.order.config;

import org.springframework.amqp.core.TopicExchange;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.amqp.support.converter.MessageConverter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RabbitMQConfig {

    public static final String ORDER_EXCHANGE = "order.exchange";
    public static final String ORDER_QUEUE = "order.queue";

    @Bean
    public TopicExchange orderExchange() {
        return new TopicExchange(ORDER_EXCHANGE);
    }

    @Bean
    public org.springframework.amqp.core.Queue orderQueue() {
        return new org.springframework.amqp.core.Queue(ORDER_QUEUE);
    }

    @Bean
    public org.springframework.amqp.core.Binding binding(org.springframework.amqp.core.Queue orderQueue, TopicExchange orderExchange) {
        return org.springframework.amqp.core.BindingBuilder.bind(orderQueue).to(orderExchange).with("order.created");
    }

    // Convert message to JSON so consumers can parse it easily
    @Bean
    public MessageConverter messageConverter() {
        return new Jackson2JsonMessageConverter();
    }
}
