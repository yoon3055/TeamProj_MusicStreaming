package com.example.oauth.member.controller;

import com.example.oauth.member.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/member")
public class UserDeleteController {
    private final UserRepository userRepository;

    public UserDeleteController(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @DeleteMapping("/delete")
    public ResponseEntity<?> deleteUser(Authentication authentication) {
        String email = authentication.getName();
        userRepository.findByEmail(email).ifPresent(userRepository::delete);
        return ResponseEntity.ok("회원 탈퇴가 완료되었습니다.");
    }
}
