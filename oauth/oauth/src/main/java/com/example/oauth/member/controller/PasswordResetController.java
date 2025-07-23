package com.example.oauth.member.controller;

import com.example.oauth.member.dto.PasswordResetRequestDto;
import com.example.oauth.member.dto.PasswordResetDto;
import com.example.oauth.member.service.PasswordResetService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/member")
public class PasswordResetController {
    private final PasswordResetService passwordResetService;

    public PasswordResetController(PasswordResetService passwordResetService) {
        this.passwordResetService = passwordResetService;
    }

    // 1) 비밀번호 재설정 요청 (이메일로 토큰 발송 등 처리 - 이메일 발송은 직접 구현 또는 별도 서비스 이용)
    @PostMapping("/request-reset-password")
    public ResponseEntity<?> requestReset(@RequestBody PasswordResetRequestDto dto) {
        String token = passwordResetService.createPasswordResetToken(dto.getEmail());
        // TODO: 이메일로 토큰 포함 링크 보내기 (프론트엔드 URL + token)
        return ResponseEntity.ok("비밀번호 재설정 이메일이 발송되었습니다.");
    }

    // 2) 비밀번호 재설정 처리
    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@RequestBody PasswordResetDto dto) {
        passwordResetService.resetPassword(dto.getToken(), dto.getNewPassword());
        return ResponseEntity.ok("비밀번호가 성공적으로 변경되었습니다.");
    }
}
