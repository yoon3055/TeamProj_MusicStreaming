package com.music.config;

import org.springframework.boot.web.servlet.MultipartConfigFactory;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.util.unit.DataSize;

import jakarta.servlet.MultipartConfigElement;

@Configuration
public class FileUploadConfig {

    @Bean
    public MultipartConfigElement multipartConfigElement() {
        MultipartConfigFactory factory = new MultipartConfigFactory();
        
        // 개별 파일 최대 크기 설정 (200MB)
        factory.setMaxFileSize(DataSize.ofMegabytes(200));
        
        // 전체 요청 최대 크기 설정 (200MB)
        factory.setMaxRequestSize(DataSize.ofMegabytes(200));
        
        // 파일이 메모리에 저장되는 임계값 설정 (1MB)
        factory.setFileSizeThreshold(DataSize.ofMegabytes(1));
        
        return factory.createMultipartConfig();
    }
}
