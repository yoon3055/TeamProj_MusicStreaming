package com.music.config;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;
import com.music.interceptor.JwtInterceptor;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import java.util.Arrays;
@Configuration
@EnableWebSecurity
public class WebConfig implements WebMvcConfigurer {
    // 사용자가 주는 jwt 토큰이 맞는지 확인하는것
    @Autowired
    private JwtInterceptor jwtInterceptor;
    @Value("${music.upload.path:uploads/music}")
    private String uploadPath;
    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        registry.addInterceptor(jwtInterceptor)
                // 토큰 확인을 하는것
                .addPathPatterns("/**") // 기본 적용 경로
                // 토큰 확인을 안하는것 - 로그인 관련 엔드포인트들을 정확히 제외
                .excludePathPatterns(
                	"/api/users/register",
                    "/user/login/**",
                    "/user/regist/**",
                    "/user/create/**",
                    "/api/users/login",        // 정확한 로그인 엔드포인트
                    "/api/users/login/**",     // 하위 경로도 포함
                    "/user/check/**",
                    "/user/sendPw/**",
                    "/error",               // 에러 페이지 제외
                    "/error/**",            // 에러 관련 하위 경로 제외
                    "/swagger-ui/**",
                    "/api-docs/**",
                    "/v3/api-docs/**",      // Swagger 관련 추가
                    "/swagger-resources/**",
                    "/webjars/**",
                    "/uploads/**",          // 업로드된 파일 접근 제외
                    "/api/admin/music/formats" // 지원 형식 조회는 토큰 없이 접근 가능
                ); // 적용 제외 경로
    }
    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // 업로드된 음악 파일에 대한 정적 리소스 핸들러 추가
        registry.addResourceHandler("/uploads/music/**")
                .addResourceLocations("file:" + uploadPath + "/")
                .setCachePeriod(3600); // 1시간 캐시
    }
    /*
    비밀번호 암호화
     */
    @Bean
    public PasswordEncoder getPasswordEncoder() {
        return new BCryptPasswordEncoder();
    }
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .csrf(csrf -> csrf.disable())
            .formLogin(form -> form.disable())
            .httpBasic(basic -> basic.disable())
            .sessionManagement(session -> session.disable())
            .headers(headers -> headers
                .frameOptions().disable()
                .addHeaderWriter((request, response) -> {
                    response.setHeader("X-Password-Manager", "disabled");
                    response.setHeader("X-Password-Save", "disabled");
                    response.setHeader("Cache-Control", "no-store, no-cache, must-revalidate");
                    response.setHeader("Pragma", "no-cache");
                })
            )
            .authorizeHttpRequests(auth -> auth
                // 로그인 관련 엔드포인트는 인증 없이 접근 허용
                .requestMatchers(
                    "/user/login/**",
                    "/user/regist/**",
                    "/user/create/**",
                    "/user/doLogin",
                    "/user/doLogin/**",
                    "/user/check/**",
                    "/user/sendPw/**",
                    "/error",
                    "/error/**",
                    "/swagger-ui/**",
                    "/api-docs/**",
                    "/v3/api-docs/**",
                    "/swagger-resources/**",
                    "/webjars/**",
                    "/uploads/**",
                    "/admin-upload.html",
                    "/api/admin/music/formats"
                ).permitAll()
                // 나머지 요청은 인증 필요 (JWT 인터셉터에서 처리)
                .anyRequest().permitAll() // 일단 모든 요청 허용하고 JWT 인터셉터에서 처리
            );
        return http.build();
    }
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOriginPatterns(Arrays.asList("http://localhost:3000", "http://127.0.0.1:3000"));
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(Arrays.asList("*"));
        configuration.setAllowCredentials(true);
        configuration.setMaxAge(3600L);
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
    // 오리진 // 리액트가 실행되는 서버 // 스프링부트가 실행되는 서버
    // 오리진 사이에서 리소스 공유하는것을 허용하는것
    // 요청 허용하는것을 물어보는것
    // cors를 설정하는것 // 코스
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**")
                // 모든 출처에서 오는 요청을 허용하는것
                .allowedOriginPatterns("http://localhost:3000", "http://127.0.0.1:3000")
                // 모든 메서드를 허용하는것
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                // 로그인 상태를 유지하는것 // 서버한테 내가 누구인지 말하는것
                // 인증 정보를 허용하는것
                .allowCredentials(true)
                // 캐시 시간을 설정하는것
                .maxAge(3600);
    }
}