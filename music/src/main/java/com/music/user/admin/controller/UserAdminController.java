package com.music.user.admin.controller;

import com.music.user.admin.dto.UserAdminDto;
import com.music.user.admin.service.UserAdminService;
import io.swagger.v3.oas.annotations.Operation;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/admin/users") // ✅ 수정된 경로
public class UserAdminController {

    private final UserAdminService userAdminService;

    @Operation(summary = "사용자 목록 조회", description = "키워드 및 권한 필터를 통한 사용자 목록을 조회합니다.")
    @GetMapping
    public ResponseEntity<List<UserAdminDto.UserResponse>> searchUsers(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false, defaultValue = "ALL") String roleFilter
    ) {
        return ResponseEntity.ok(userAdminService.searchUsers(keyword, roleFilter));
    }

    @Operation(summary = "사용자 정보 수정", description = "사용자의 닉네임과 권한 정보를 수정합니다.")
    @PutMapping("/{userId}")
    public ResponseEntity<UserAdminDto.UserResponse> updateUser(
            @PathVariable Long userId,
            @RequestBody UserAdminDto.UpdateRequest request
    ) {
        return ResponseEntity.ok(userAdminService.updateUser(userId, request));
    }

    @Operation(summary = "사용자 삭제", description = "해당 ID의 사용자를 삭제합니다.")
    @DeleteMapping("/{userId}")
    public ResponseEntity<Void> deleteUser(@PathVariable Long userId) {
        userAdminService.deleteUser(userId);
        return ResponseEntity.noContent().build();
    }
}
