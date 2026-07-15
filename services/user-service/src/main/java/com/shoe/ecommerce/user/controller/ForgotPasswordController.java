package com.shoe.ecommerce.user.controller;

import com.shoe.ecommerce.user.entity.User;
import com.shoe.ecommerce.user.repository.UserRepository;
import com.shoe.ecommerce.user.service.EmailService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@RestController
@RequestMapping("/api/auth")
public class ForgotPasswordController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private EmailService emailService;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@RequestBody Map<String, String> payload) {
        String email = payload.get("email");
        if (email == null || email.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Email is required"));
        }

        // We assume username is email or we use email field. Since we added email field:
        Optional<User> userOpt = userRepository.findFirstByEmail(email);
        if (userOpt.isEmpty()) {
            // Also try by username if email is not set but username is an email
            userOpt = userRepository.findByUsername(email);
        }

        if (userOpt.isPresent()) {
            User user = userOpt.get();
            // Generate a random 8-character password
            String newPassword = UUID.randomUUID().toString().substring(0, 8);
            user.setPassword(passwordEncoder.encode(newPassword));
            user.setResetToken(null);
            user.setResetTokenExpiry(null);
            userRepository.save(user);

            try {
                emailService.sendNewPasswordEmail(email, newPassword);
            } catch (Exception e) {
                System.err.println("Failed to send new password email: " + e.getMessage());
                return ResponseEntity.status(500).body(Map.of("message", "Không thể gửi email. Vui lòng thử lại sau."));
            }
        }
        
        // Always return success to prevent email enumeration
        return ResponseEntity.ok(Map.of("message", "If your email exists, a new password has been sent."));
    }

    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@RequestBody Map<String, String> payload) {
        String token = payload.get("token");
        String newPassword = payload.get("newPassword");

        if (token == null || newPassword == null) {
            return ResponseEntity.badRequest().body(Map.of("message", "Token and newPassword are required"));
        }

        Optional<User> userOpt = userRepository.findByResetToken(token);
        if (userOpt.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Invalid or expired token"));
        }

        User user = userOpt.get();
        if (user.getResetTokenExpiry().isBefore(LocalDateTime.now())) {
            return ResponseEntity.badRequest().body(Map.of("message", "Token has expired"));
        }

        user.setPassword(passwordEncoder.encode(newPassword));
        user.setResetToken(null);
        user.setResetTokenExpiry(null);
        userRepository.save(user);

        return ResponseEntity.ok(Map.of("message", "Password has been successfully reset."));
    }
}
