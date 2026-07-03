package com.shoe.ecommerce.user.controller;

import com.shoe.ecommerce.user.entity.User;
import com.shoe.ecommerce.user.security.JwtTokenProvider;
import com.shoe.ecommerce.user.service.UserService;
import io.jsonwebtoken.Claims;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.Duration;
import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final JwtTokenProvider tokenProvider;
    private final UserService userService;
    private final StringRedisTemplate redisTemplate;

    public AuthController(JwtTokenProvider tokenProvider, UserService userService, StringRedisTemplate redisTemplate) {
        this.tokenProvider = tokenProvider;
        this.userService = userService;
        this.redisTemplate = redisTemplate;
    }

    public static class RegisterRequest {
        public String username;
        public String password;
        public String role;
    }

    public static class LoginRequest {
        public String username;
        public String password;
    }

    public static class TokenRefreshRequest {
        public String refreshToken;
    }

    public static class AuthResponse {
        public String accessToken;
        public String refreshToken;
        public String role;
        public AuthResponse(String accessToken, String refreshToken, String role) {
            this.accessToken = accessToken;
            this.refreshToken = refreshToken;
            this.role = role;
        }
    }

    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@RequestBody RegisterRequest request) {
        try {
            User user = userService.registerUser(request.username, request.password, request.role);
            return ResponseEntity.status(201).body("User registered successfully");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> authenticateUser(@RequestBody LoginRequest loginRequest) {
        Optional<User> userOpt = userService.findByUsername(loginRequest.username);
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            if (userService.verifyPassword(loginRequest.password, user.getPassword())) {
                String accessToken = tokenProvider.generateAccessToken(user.getId(), user.getUsername(), user.getRole());
                String refreshToken = tokenProvider.generateRefreshToken(user.getId(), user.getUsername());
                return ResponseEntity.ok(new AuthResponse(accessToken, refreshToken, user.getRole()));
            }
        }
        return ResponseEntity.status(401).body("Invalid credentials");
    }

    @PostMapping("/refresh")
    public ResponseEntity<?> refreshToken(@RequestBody TokenRefreshRequest request) {
        String requestRefreshToken = request.refreshToken;

        // Check if blacklisted
        if (Boolean.TRUE.equals(redisTemplate.hasKey("blacklist:" + requestRefreshToken))) {
            return ResponseEntity.status(401).body("Refresh token was blacklisted");
        }

        if (tokenProvider.validateToken(requestRefreshToken)) {
            Claims claims = tokenProvider.getClaims(requestRefreshToken);
            String username = claims.getSubject();
            Long userId = claims.get("userId", Long.class);

            Optional<User> userOpt = userService.findByUsername(username);
            if (userOpt.isPresent()) {
                User user = userOpt.get();
                String accessToken = tokenProvider.generateAccessToken(user.getId(), user.getUsername(), user.getRole());
                return ResponseEntity.ok(new AuthResponse(accessToken, requestRefreshToken, user.getRole())); // optionally generate new refresh token
            }
        }
        return ResponseEntity.status(401).body("Invalid refresh token");
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logoutUser(@RequestBody TokenRefreshRequest request) {
        String refreshToken = request.refreshToken;
        if (tokenProvider.validateToken(refreshToken)) {
            // Add to blacklist with TTL of 7 days
            redisTemplate.opsForValue().set("blacklist:" + refreshToken, "true", Duration.ofDays(7));
            return ResponseEntity.ok("Log out successful");
        }
        return ResponseEntity.status(400).body("Invalid token");
    }
}
