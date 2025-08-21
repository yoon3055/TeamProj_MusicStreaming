package com.music.config;

import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.multipart.MaxUploadSizeExceededException;

import java.util.HashMap;
import java.util.Map;

/**
 * 전역 예외 처리기
 * 애플리케이션 전체에서 발생하는 예외를 일관성 있게 처리
 */
@RestControllerAdvice
@Slf4j
public class GlobalExceptionHandler {

    /**
     * 파일 업로드 크기 초과 예외 처리
     */
    @ExceptionHandler(MaxUploadSizeExceededException.class)
    public ResponseEntity<Map<String, Object>> handleMaxUploadSizeExceeded(MaxUploadSizeExceededException e) {
        log.warn("파일 크기 제한 초과: {}", e.getMessage());
        
        Map<String, Object> response = new HashMap<>();
        response.put("success", false);
        response.put("message", "파일 크기가 너무 큽니다. 최대 200MB까지 업로드 가능합니다.");
        response.put("error", "FILE_SIZE_EXCEEDED");
        response.put("maxSize", "200MB");
        
        return ResponseEntity.status(HttpStatus.PAYLOAD_TOO_LARGE).body(response);
    }

    /**
     * 일반적인 런타임 예외 처리
     */
    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<Map<String, Object>> handleRuntimeException(RuntimeException e) {
        log.error("런타임 예외 발생: {}", e.getMessage(), e);
        
        Map<String, Object> response = new HashMap<>();
        response.put("success", false);
        response.put("message", "서버 내부 오류가 발생했습니다.");
        response.put("error", "INTERNAL_SERVER_ERROR");
        
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
    }

    /**
     * 일반적인 예외 처리
     */
    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, Object>> handleException(Exception e) {
        log.error("예상치 못한 예외 발생: {}", e.getMessage(), e);
        
        Map<String, Object> response = new HashMap<>();
        response.put("success", false);
        response.put("message", "예상치 못한 오류가 발생했습니다.");
        response.put("error", "UNEXPECTED_ERROR");
        
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
    }
}
