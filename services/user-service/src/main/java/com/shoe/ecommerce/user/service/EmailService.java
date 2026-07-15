package com.shoe.ecommerce.user.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    @Autowired(required = false)
    private JavaMailSender mailSender;

    @Value("${spring.mail.username:}")
    private String mailFrom;

    public void sendNewPasswordEmail(String toEmail, String newPassword) {
        if (mailSender == null || mailFrom == null || mailFrom.isBlank()) {
            // Mail server not configured - log the new password for development
            System.out.println("=== [DEV MODE - EMAIL NOT SENT] ===");
            System.out.println("New password for " + toEmail + ": " + newPassword);
            System.out.println("=====================================");
            return;
        }

        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(mailFrom);
            message.setTo(toEmail);
            message.setSubject("Mật khẩu mới - Kicks VN");
            message.setText("Yêu cầu khôi phục mật khẩu của bạn đã được xử lý.\n\nMật khẩu mới của bạn là: " + newPassword + "\n\nVui lòng đăng nhập và đổi lại mật khẩu của bạn để đảm bảo an toàn.");
            mailSender.send(message);
            System.out.println("New password email sent to: " + toEmail);
        } catch (Exception e) {
            System.err.println("Failed to send new password email to " + toEmail + ": " + e.getMessage());
            throw new RuntimeException("Không thể gửi email chứa mật khẩu mới. Vui lòng thử lại sau.");
        }
    }
}
