package com.shoe.ecommerce.user;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import com.shoe.ecommerce.user.service.UserService;

@SpringBootApplication
public class UserServiceApplication {
    public static void main(String[] args) {
        SpringApplication.run(UserServiceApplication.class, args);
    }

    @Bean
    public CommandLineRunner initData(UserService userService) {
        return args -> {
            if (userService.findByUsername("admin").isEmpty()) {
                userService.registerUser("admin", "password", "ADMIN");
            }
        };
    }
}
