package com.example.oauth.member.controller;

import java.io.File;
import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/files")
public class FileUploadController {

    private final String uploadDir = "src/main/resources/static/uploads/";

    @PostMapping("/upload")
    public ResponseEntity<Map<String, String>> uploadMusic(@RequestParam("file") MultipartFile file) {
        try {
            // 파일 이름 처리
            String originalFilename = file.getOriginalFilename();
            if (originalFilename == null) {
                return ResponseEntity.badRequest().body(Map.of("error", "Invalid filename"));
            }

            // 저장할 위치 지정
            File dest = new File(uploadDir + originalFilename);
            file.transferTo(dest);

            // URL 생성
            String fileUrl = "http://localhost:8080/uploads/" + URLEncoder.encode(originalFilename, StandardCharsets.UTF_8.toString());

            return ResponseEntity.ok(Map.of(
                "filename", originalFilename,
                "url", fileUrl
            ));
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "파일 업로드 실패: " + e.getMessage()));
        }
    }
}
