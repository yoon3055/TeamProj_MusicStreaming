package com.music.music.controller;

import com.music.music.service.SongLikeService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/songs/{songId}/likes")
@RequiredArgsConstructor
public class SongLikeController {

    private final SongLikeService likeService;

    /**
     * ✅ [POST] 좋아요 토글 (좋아요/해제)
     */
    @PostMapping
    public ResponseEntity<Boolean> toggleLike(
            @PathVariable Long songId,
            @RequestParam Long userId
    ) {
        boolean liked = likeService.toggleLike(userId, songId);
        return ResponseEntity.ok(liked); // true: 좋아요됨, false: 좋아요 해제됨
    }

    /**
     * ✅ [GET] 좋아요 개수 조회
     */
    @GetMapping("/count")
    public ResponseEntity<Long> getLikeCount(@PathVariable Long songId) {
        long count = likeService.getLikeCount(songId);
        return ResponseEntity.ok(count);
    }

    /**
     * ✅ [GET] 사용자 좋아요 여부 확인
     */
    @GetMapping("/is-liked")
    public ResponseEntity<Boolean> isLikedByUser(
            @PathVariable Long songId,
            @RequestParam Long userId
    ) {
        boolean liked = likeService.isLikedByUser(userId, songId);
        return ResponseEntity.ok(liked);
    }
}
