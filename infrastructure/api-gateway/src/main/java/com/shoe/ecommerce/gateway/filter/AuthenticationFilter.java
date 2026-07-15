package com.shoe.ecommerce.gateway.filter;

import com.shoe.ecommerce.gateway.util.JwtUtil;
import io.jsonwebtoken.Claims;
import org.springframework.cloud.gateway.filter.GatewayFilter;
import org.springframework.cloud.gateway.filter.factory.AbstractGatewayFilterFactory;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

@Component
public class AuthenticationFilter extends AbstractGatewayFilterFactory<AuthenticationFilter.Config> {

    private final JwtUtil jwtUtil;

    public AuthenticationFilter(JwtUtil jwtUtil) {
        super(Config.class);
        this.jwtUtil = jwtUtil;
    }

    @Override
    public GatewayFilter apply(Config config) {
        return ((exchange, chain) -> {
            String path = exchange.getRequest().getURI().getPath();

            // Skip auth for login, register, forgot/reset password
            if (path.startsWith("/api/auth")) {
                return chain.filter(exchange);
            }

            // Skip auth for public product listing
            if (path.startsWith("/api/products") && exchange.getRequest().getMethod() == HttpMethod.GET) {
                return chain.filter(exchange);
            }

            // Skip auth for public category listing
            if (path.startsWith("/api/categories") && exchange.getRequest().getMethod() == HttpMethod.GET) {
                return chain.filter(exchange);
            }

            // Skip auth for CORS preflight
            if (exchange.getRequest().getMethod() == HttpMethod.OPTIONS) {
                return chain.filter(exchange);
            }

            // Skip auth for Swagger
            if (path.contains("/v3/api-docs") || path.contains("/swagger-ui") || path.contains("/webjars/swagger-ui")) {
                return chain.filter(exchange);
            }

            if (!exchange.getRequest().getHeaders().containsKey(HttpHeaders.AUTHORIZATION)) {
                return onError(exchange, "Missing authorization header", HttpStatus.UNAUTHORIZED);
            }

            String authHeader = exchange.getRequest().getHeaders().get(HttpHeaders.AUTHORIZATION).get(0);
            if (authHeader != null && authHeader.startsWith("Bearer ")) {
                authHeader = authHeader.substring(7);
            } else {
                return onError(exchange, "Invalid authorization header format", HttpStatus.UNAUTHORIZED);
            }

            try {
                // Validate the token (throws exception if signature invalid)
                jwtUtil.validateToken(authHeader);
                
                Claims claims = jwtUtil.getClaims(authHeader);
                String role = claims.get("role", String.class);
                Long userId = claims.get("userId", Long.class);

                // Only ADMIN can mutate products, categories, and upload files
                if (path.startsWith("/api/products") || path.startsWith("/api/categories") || path.startsWith("/api/upload")) {
                    HttpMethod method = exchange.getRequest().getMethod();
                    if (method == HttpMethod.POST || method == HttpMethod.PUT || method == HttpMethod.DELETE) {
                        if (!"ADMIN".equals(role)) {
                            return onError(exchange, "Forbidden: Admins only", HttpStatus.FORBIDDEN);
                        }
                    }
                }

                // Protect Admin User APIs
                if (path.startsWith("/api/users/admin")) {
                    if (!"ADMIN".equals(role)) {
                        return onError(exchange, "Forbidden: Admins only", HttpStatus.FORBIDDEN);
                    }
                }

                ServerWebExchange mutatedExchange = exchange.mutate()
                        .request(exchange.getRequest().mutate()
                                .header("X-Auth-Username", claims.getSubject())
                                .header("X-Auth-Role", role != null ? role : "")
                                .header("X-User-Id", userId != null ? String.valueOf(userId) : "")
                                .build())
                        .build();

                return chain.filter(mutatedExchange);

            } catch (Exception e) {
                return onError(exchange, "Unauthorized access to application: " + e.getMessage(), HttpStatus.UNAUTHORIZED);
            }
        });
    }

    private Mono<Void> onError(ServerWebExchange exchange, String err, HttpStatus httpStatus) {
        exchange.getResponse().setStatusCode(httpStatus);
        return exchange.getResponse().setComplete();
    }

    public static class Config {
        // Configuration properties for the filter can go here
    }
}
