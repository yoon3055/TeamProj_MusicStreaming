package com.music.exception;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ViewControllerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/**
 * 루트(/) 접근 시 React build의 index.html 로 포워드해서
 * 404 대신 SPA 첫 화면을 보여주도록 하는 설정.
 */
@Configuration
public class SpaRedirectConfig implements WebMvcConfigurer {

    @Override
    public void addViewControllers(ViewControllerRegistry registry) {
        // API 경로는 제외하고 루트 경로만 index.html로 포워드
        registry.addViewController("/")
                .setViewName("redirect:/index.html");
        
        // SPA 라우팅을 위한 fallback (API 경로는 제외)
        registry.addViewController("/{path:^(?!api).*$}")
                .setViewName("redirect:/index.html");
    }
}
