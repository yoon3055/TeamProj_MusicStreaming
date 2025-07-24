package com.music.config;

import com.music.jwt.JwtAuthenticationFilter;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.annotation.Order;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    // ───────────────────────────────────────────────
    // 1) /api/** 전용 체인  (JWT 필터 적용)
    // ───────────────────────────────────────────────
    @Bean
    @Order(1)   // 우선순위 높음
    public SecurityFilterChain apiChain(HttpSecurity http) throws Exception {

        http.securityMatcher("/api/**")
            .csrf(cs -> cs.disable())
            .sessionManagement(sm -> sm.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/api/auth/**").permitAll()   // 로그인·회원가입 허용
                .anyRequest().authenticated()                  // 나머지는 인증 필요
            )
            .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class)
            .httpBasic(b -> b.disable());

        return http.build();
    }

    // ───────────────────────────────────────────────
    // 2) 나머지(정적·Swagger 등) 전부 허용 체인
    // ───────────────────────────────────────────────
    @Bean
    @Order(2)   // 우선순위 낮음 (fallback)
    public SecurityFilterChain publicChain(HttpSecurity http) throws Exception {

        http.csrf(cs -> cs.disable())
            .authorizeHttpRequests(auth -> auth
                .requestMatchers(
                    "/", "/index.html",
                    "/static/**", "/assets/**",
                    "/favicon.ico", "/manifest.json",

                    // ── Swagger UI & OpenAPI JSON ──
                    "/swagger-ui.html",
                    "/swagger-ui/**",
                    "/v3/api-docs/**"
                ).permitAll()
                .anyRequest().permitAll()
            );

        return http.build();
    }

    // 비밀번호 인코더 (테스트는 Simple, 운영은 BCrypt 스위치 가능)
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}
