package com.music.follow.controller;

import com.music.follow.dto.FollowDto;
import com.music.follow.service.UserFollowService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/follows/user")
@RequiredArgsConstructor
public class UserFollowController {

    private final UserFollowService userFollowService;

    // 🔁 유저 팔로우/언팔로우 토글
    @PostMapping
    public ResponseEntity<?> toggleUserFollow(@RequestBody FollowDto.UserFollowRequest request) {
        FollowDto.UserFollowResponse response = userFollowService.toggleFollow(request);

        if (response == null) {
            return ResponseEntity.ok("언팔로우 되었습니다.");
        }
        return ResponseEntity.ok(response);
    }

    // 👉 내가 팔로우하는 사람들
    @GetMapping("/following/{userId}")
    public ResponseEntity<?> getFollowings(@PathVariable Long userId) {
        return ResponseEntity.ok(userFollowService.getFollowings(userId));
    }

    // 👈 나를 팔로우하는 사람들
    @GetMapping("/followers/{userId}")
    public ResponseEntity<?> getFollowers(@PathVariable Long userId) {
        return ResponseEntity.ok(userFollowService.getFollowers(userId));
    }
}
