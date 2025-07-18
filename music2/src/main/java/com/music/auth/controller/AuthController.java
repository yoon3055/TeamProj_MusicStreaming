package com.music.auth.controller;

import com.music.auth.dto.AuthResponse;
import com.music.auth.dto.LoginRequest;
import com.music.auth.dto.SignUpRequest;
import com.music.jwt.JwtTokenUtil;
import com.music.security.UserDetailsImpl;
import com.music.user.entity.User;
import com.music.user.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final UserService userService;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenUtil jwtTokenUtil;

    @PostMapping("/signup")
    public ResponseEntity<?> registerUser(@RequestBody SignUpRequest signUpRequest) {
        // 이메일 중복 검사
        if (userService.existsByEmail(signUpRequest.getEmail())) {
            return ResponseEntity.badRequest().body("이미 사용중인 이메일입니다.");
        }

        // 새로운 사용자 생성
        User user = new User();
        user.setEmail(signUpRequest.getEmail());
        user.setPassword(passwordEncoder.encode(signUpRequest.getPassword()));
        user.setNickname(signUpRequest.getNickname());
        user.setVerified(false);

        User savedUser = userService.saveUser(user);

        return ResponseEntity.ok("회원가입이 완료되었습니다.");
    }

    @PostMapping("/login")
    public ResponseEntity<?> authenticateUser(@RequestBody LoginRequest loginRequest) {
        User user = userService.getUserByEmail(loginRequest.getEmail())
                .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다."));

        if (!passwordEncoder.matches(loginRequest.getPassword(), user.getPassword())) {
            return ResponseEntity.badRequest().body("비밀번호가 일치하지 않습니다.");
        }

        String token = jwtTokenUtil.generateToken(new UserDetailsImpl(user));

        AuthResponse authResponse = new AuthResponse();
        authResponse.setToken(token);
        authResponse.setEmail(user.getEmail());

        return ResponseEntity.ok(authResponse);
    }
}