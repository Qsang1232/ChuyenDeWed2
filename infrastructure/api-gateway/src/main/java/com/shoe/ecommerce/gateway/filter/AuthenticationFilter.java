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

            // Skip auth for login and register
            if (path.startsWith("/api/auth/") || path.startsWith("/auth/")) {
                return chain.filter(exchange);
            }

            // Skip auth for public product listing
            if (path.startsWith("/api/products") && exchange.getRequest().getMethod() == HttpMethod.GET) {
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
                // Validate the token (throws exception if signature invalid - TH11)
                jwtUtil.validateToken(authHeader);
                
                Claims claims = jwtUtil.getClaims(authHeader);
                String role = claims.get("role", String.class);
                Long userId = claims.get("userId", Long.class);

                // TH6 & TH7: Only ADMIN can POST to /api/products
                if (path.startsWith("/api/products") && exchange.getRequest().getMethod() == HttpMethod.POST) {
                    if (!"ADMIN".equals(role)) {
                        return onError(exchange, "Forbidden: Admins only", HttpStatus.FORBIDDEN);
                    }
                }

                exchange.getRequest().mutate()
                        .header("X-Auth-Username", claims.getSubject())
                        .header("X-Auth-Role", role != null ? role : "")
                        .header("X-User-Id", userId != null ? String.valueOf(userId) : "")
                        .build();

            } catch (Exception e) {
                return onError(exchange, "Unauthorized access to application: " + e.getMessage(), HttpStatus.UNAUTHORIZED);
            }
            
            return chain.filter(exchange);
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
