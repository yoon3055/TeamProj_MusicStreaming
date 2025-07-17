package com.music.config;


import com.music.user.service.CustomUserDetailsService;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity; // EnableWebSecurity import 추가
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;

@RequiredArgsConstructor
@Configuration
@EnableWebSecurity // 웹 보안 활성화를 위한 어노테이션 추가
public class SecurityConfig {

    private final CustomUserDetailsService userDetailsService;
    private final PasswordEncoder passwordEncoder;

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration authConfig) throws Exception {
        return authConfig.getAuthenticationManager();
    }

    @Bean
    public DaoAuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider authProvider = new DaoAuthenticationProvider();

        authProvider.setUserDetailsService(userDetailsService);
        authProvider.setPasswordEncoder(passwordEncoder);

        return authProvider;
    }





    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                .csrf(csrf -> csrf.disable())
                .sessionManagement(session ->
                        session.sessionCreationPolicy(SessionCreationPolicy.STATELESS)
                )
                .authorizeHttpRequests(auth ->
                        auth
                                .requestMatchers("/api/user/login", "/api/user/signup").permitAll() // 로그인 경로 허용 // 회원가입 경로 추가

                                .anyRequest().authenticated()
                )
                .formLogin(form -> form
                        .loginProcessingUrl("/api/user/login") // 로그인 처리 URL
                        .usernameParameter("email")    // 로그인 폼의 이메일 필드 name
                        .passwordParameter("password") // 로그인 폼의 비밀번호 필드 name
                        .defaultSuccessUrl("/")        // 로그인 성공 시 리다이렉트
                        .failureUrl("/login?error")    // 로그인 실패 시 리다이렉트
                )
                .userDetailsService(userDetailsService)  // UserDetailsService 설정 추가
                .authenticationProvider(authenticationProvider());



        ;

        return http.build();
    }




    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }



}