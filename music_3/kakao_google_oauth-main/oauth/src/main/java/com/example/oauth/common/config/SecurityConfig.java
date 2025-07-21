package com.example.oauth.common.config;

import com.example.oauth.common.auth.JwtTokenFilter;
import com.example.oauth.member.service.GoogleOauth2LoginSuccess;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.factory.PasswordEncoderFactories;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;

@Configuration
public class SecurityConfig {
    private final JwtTokenFilter jwtTokenFilter;
    private final GoogleOauth2LoginSuccess googleOauth2LoginSuccess;

    public SecurityConfig(JwtTokenFilter jwtTokenFilter, GoogleOauth2LoginSuccess googleOauth2LoginSuccess) {
        this.jwtTokenFilter = jwtTokenFilter;
        this.googleOauth2LoginSuccess = googleOauth2LoginSuccess;
    }

    @Bean
    public PasswordEncoder makePassword(){
        return PasswordEncoderFactories.createDelegatingPasswordEncoder();
    }
    
    @Bean
    public SecurityFilterChain myfilter(HttpSecurity httpSecurity) throws Exception {
        return httpSecurity
                .cors(cors -> cors.configurationSource(configurationSource()))
                .csrf(AbstractHttpConfigurer::disable) //csrf비활성화
//                Basic인증 비활성화
//                Basic인증은 사용자이름과 비밀번호를 Base64로 인코딩하여 인증값으로 활용
                .httpBasic(AbstractHttpConfigurer::disable)
//                세션방식을 비활성화
                .sessionManagement(s->s.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
//                특정 url패턴에 대해서는 인증처리(Authentication객체생성) 제외
                .authorizeHttpRequests(a->a.requestMatchers(
                        "/member/create",
                        "/member/doLogin",
                        "/member/google/doLogin",
                        "/member/kakao/doLogin",
                        "/oauth2/**",
                        "/swagger-ui/**",          // Swagger UI 허용
                        "/swagger-ui.html",        // Swagger UI 허용
                        "/api-docs/**",            // API 문서 허용
                        "/v3/api-docs/**"          // OpenAPI 스펙 허용
                ).permitAll().anyRequest().authenticated())
//                UsernamePasswordAuthenticationFilter 이 클래스에서 폼로그인 인증을 처리
                .addFilterBefore(jwtTokenFilter, UsernamePasswordAuthenticationFilter.class)
//                oauth로그인이 성공했을경우 실행할 클래스 정의
                .oauth2Login(o -> o.successHandler(googleOauth2LoginSuccess))
                .build();
    }
    
    @Bean
    public CorsConfigurationSource configurationSource(){
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(Arrays.asList("http://localhost:3000"));
        configuration.setAllowedMethods(Arrays.asList("*")); //모든 HTTP메서드 허용
        configuration.setAllowedHeaders(Arrays.asList("*")); //모든 헤더값 허용
        configuration.setAllowCredentials(true); //자격증명허용

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
//        모든 url패턴에 대해서 cors 허용 설정
        source.registerCorsConfiguration("/**", configuration);
        return  source;
    }
}
