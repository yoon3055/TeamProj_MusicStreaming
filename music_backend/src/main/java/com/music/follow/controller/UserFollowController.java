package com.music.follow.controller;

import com.music.follow.dto.FollowDto;
import com.music.follow.service.UserFollowService;
import io.swagger.v3.oas.annotations.Operation;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/follows/users")
@RequiredArgsConstructor
public class UserFollowController {

    private final UserFollowService userFollowService;

    @Operation(
        summary = "유저 팔로우/언팔로우 토글",
        description = "현재 로그인한 사용자가 특정 사용자를 팔로우하거나 언팔로우합니다. 이미 팔로우 중이면 언팔로우됩니다."
    )
    @PostMapping
    public ResponseEntity<?> toggleUserFollow(@RequestBody FollowDto.UserFollowRequest request) {
        FollowDto.UserFollowResponse response = userFollowService.toggleFollow(request);

        if (response == null) {
            return ResponseEntity.ok("언팔로우 되었습니다.");
        }
        return ResponseEntity.ok(response);
    }
}
