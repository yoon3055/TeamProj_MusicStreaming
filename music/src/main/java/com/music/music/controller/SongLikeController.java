package com.music.music.controller;

import com.music.music.service.SongLikeService;
import io.swagger.v3.oas.annotations.Operation;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/songs/{songId}/likes")
@RequiredArgsConstructor
public class SongLikeController {

    private final SongLikeService likeService;

    @Operation(
        summary = "곡 좋아요 토글",
        description = "특정 곡(songId)에 대해 사용자가 좋아요 또는 좋아요 해제를 수행합니다. \n" +
                      "userId를 쿼리 파라미터로 전달합니다."
    )
    @PostMapping
    public ResponseEntity<Boolean> toggleLike(
            @PathVariable Long songId,
            @RequestParam Long userId
    ) {
        boolean liked = likeService.toggleLike(userId, songId);
        return ResponseEntity.ok(liked); // true: 좋아요됨, false: 좋아요 해제됨
    }

    @Operation(
        summary = "곡 좋아요 수 조회",
        description = "특정 곡(songId)의 총 좋아요 수를 조회합니다."
    )
    @GetMapping("/count")
    public ResponseEntity<Long> getLikeCount(@PathVariable Long songId) {
        long count = likeService.getLikeCount(songId);
        return ResponseEntity.ok(count);
    }

    @Operation(
        summary = "사용자의 곡 좋아요 여부 확인",
        description = "사용자(userId)가 특정 곡(songId)을 좋아요 했는지 여부를 확인합니다."
    )
    @GetMapping("/is-liked")
    public ResponseEntity<Boolean> isLikedByUser(
            @PathVariable Long songId,
            @RequestParam Long userId
    ) {
        boolean liked = likeService.isLikedByUser(userId, songId);
        return ResponseEntity.ok(liked);
    }
}
