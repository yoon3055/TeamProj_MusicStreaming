package com.music.music.controller;

import com.music.music.service.AlbumLikeService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/albums/{albumId}/likes")
@RequiredArgsConstructor
public class AlbumLikeController {

    private final AlbumLikeService likeService;

    /**
     * ✅ [POST] 좋아요 토글
     */
    @PostMapping
    public ResponseEntity<Boolean> toggleLike(
            @PathVariable Long albumId,
            @RequestParam Long userId
    ) {
        boolean liked = likeService.toggleLike(userId, albumId);
        return ResponseEntity.ok(liked);
    }

    /**
     * ✅ [GET] 좋아요 수
     */
    @GetMapping("/count")
    public ResponseEntity<Long> getLikeCount(@PathVariable Long albumId) {
        return ResponseEntity.ok(likeService.getLikeCount(albumId));
    }

    /**
     * ✅ [GET] 좋아요 여부
     */
    @GetMapping("/is-liked")
    public ResponseEntity<Boolean> isLikedByUser(
            @PathVariable Long albumId,
            @RequestParam Long userId
    ) {
        return ResponseEntity.ok(likeService.isLikedByUser(userId, albumId));
    }
}
