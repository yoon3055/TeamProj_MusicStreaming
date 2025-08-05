package com.music.user.admin.controller;

import com.music.user.admin.dto.UserAdminDto;
import com.music.user.admin.service.UserAdminService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/admin/users")
public class UserAdminController {

    private final UserAdminService userAdminService;

    // ✅ 사용자 목록 조회 (검색 + 필터)
    @GetMapping
    public ResponseEntity<List<UserAdminDto.UserResponse>> searchUsers(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false, defaultValue = "ALL") String roleFilter
    ) {
        return ResponseEntity.ok(userAdminService.searchUsers(keyword, roleFilter));
    }

    // ✅ 사용자 정보 수정 (닉네임/권한 변경)
    @PutMapping("/{userId}")
    public ResponseEntity<UserAdminDto.UserResponse> updateUser(
            @PathVariable Long userId,
            @RequestBody UserAdminDto.UpdateRequest request
    ) {
        return ResponseEntity.ok(userAdminService.updateUser(userId, request));
    }

    // ✅ 사용자 삭제
    @DeleteMapping("/{userId}")
    public ResponseEntity<Void> deleteUser(@PathVariable Long userId) {
        userAdminService.deleteUser(userId);
        return ResponseEntity.noContent().build();
    }
}
