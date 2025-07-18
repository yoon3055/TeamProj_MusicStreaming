package com.music.user.controller;

import com.music.user.dto.UserDto;
import com.music.user.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @PostMapping("/signup")
    public ResponseEntity<UserDto.Response> signup(@Valid @RequestBody UserDto.SignUpRequest request) {
        System.out.println("넘어오는 값 : " +request.toString());
        return ResponseEntity.ok(userService.registerUser(request));
    }

    @PostMapping("/login")
    public ResponseEntity<UserDto.Response> login(@Valid @RequestBody UserDto.LoginRequest request) {
        return ResponseEntity.ok(userService.login(request));
    }

    @PutMapping("/{userId}")
    public ResponseEntity<UserDto.Response> updateUser(
            @PathVariable Long userId,
            @Valid @RequestBody UserDto.UpdateRequest request) {
        return ResponseEntity.ok(userService.updateUser(userId, request));
    }

    @GetMapping("/{userId}")
    public ResponseEntity<UserDto.Response> getUser(@PathVariable Long userId) {
        return ResponseEntity.ok(userService.getUserById(userId));
    }
}

