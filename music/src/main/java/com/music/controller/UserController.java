package com.music.controller;

import com.music.entity.User;
import com.music.request.SignupRequest;
import com.music.request.LoginRequest;
import com.music.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @PostMapping("/signup")
    public String signup(@RequestBody SignupRequest request) {
        userService.registerUser(request);
        return "회원가입 성공";
    }

    @PostMapping("/login")
    public String login(@RequestBody LoginRequest request) {
        User user = userService.login(request);
        return user.getNickname() + "님 로그인 성공";
    }
}
