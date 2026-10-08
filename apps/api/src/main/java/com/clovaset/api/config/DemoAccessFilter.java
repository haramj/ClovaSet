package com.clovaset.api.config;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;

@Component
public class DemoAccessFilter extends OncePerRequestFilter {
    @Value("${DEMO_ACCESS_CODE:}")
    private String accessCode;

    @Value("${app.web-origin}")
    private String webOrigin;

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        return accessCode.isBlank() || !request.getRequestURI().startsWith("/api/")
            || "OPTIONS".equalsIgnoreCase(request.getMethod());
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {
        String supplied = request.getHeader("X-Demo-Code");
        if (supplied == null || !MessageDigest.isEqual(
            supplied.getBytes(StandardCharsets.UTF_8), accessCode.getBytes(StandardCharsets.UTF_8))) {
            String origin = request.getHeader("Origin");
            if (webOrigin.equals(origin) || "http://127.0.0.1:5173".equals(origin)) {
                response.setHeader("Access-Control-Allow-Origin", origin);
                response.addHeader("Vary", "Origin");
            }
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            response.setContentType("application/json;charset=UTF-8");
            response.getWriter().write("{\"message\":\"시연 접속 코드를 확인해주세요.\"}");
            return;
        }
        filterChain.doFilter(request, response);
    }
}
