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

    @Value("${app.frontend.url:http://localhost:5173}")
    private String frontendUrl;

    public void sendPasswordResetEmail(String toEmail, String resetToken) {
        if (mailSender == null || mailFrom == null || mailFrom.isBlank()) {
            // Mail server not configured - log the link for development
            System.out.println("=== [DEV MODE - EMAIL NOT SENT] ===");
            System.out.println("Reset link for " + toEmail + ": " + frontendUrl + "/reset-password?token=" + resetToken);
            System.out.println("=====================================");
            return;
        }

        try {
            String resetLink = frontendUrl + "/reset-password?token=" + resetToken;
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(mailFrom);
            message.setTo(toEmail);
            message.setSubject("Đặt lại mật khẩu - Kicks VN");
            message.setText("Yêu cầu khôi phục mật khẩu của bạn đã được xử lý.\n\nĐể đặt lại mật khẩu, vui lòng nhấp vào liên kết sau:\n" + resetLink + "\n\nLiên kết này sẽ hết hạn sau 1 giờ.");
            mailSender.send(message);
            System.out.println("Password reset email sent to: " + toEmail);
        } catch (Exception e) {
            System.err.println("Failed to send password reset email to " + toEmail + ": " + e.getMessage());
            throw new RuntimeException("Không thể gửi email chứa link đặt lại mật khẩu. Vui lòng thử lại sau.");
        }
    }
}
