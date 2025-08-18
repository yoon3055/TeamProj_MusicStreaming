package com.music.music.controller;

import com.music.music.service.AlbumLikeService;
import io.swagger.v3.oas.annotations.Operation;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/albums/{albumId}/likes")
@RequiredArgsConstructor
public class AlbumLikeController {

    private final AlbumLikeService likeService;

    @Operation(
        summary = "앨범 좋아요 토글",
        description = "사용자가 해당 앨범에 좋아요를 누르거나 해제합니다. \n\n" +
                      "- true: 좋아요 추가됨\n" +
                      "- false: 좋아요 해제됨"
    )
    @PostMapping
    public ResponseEntity<Boolean> toggleLike(
            @PathVariable("albumId") Long albumId,
            @RequestParam("userId") Long userId
    ) {
        boolean liked = likeService.toggleLike(userId, albumId);
        return ResponseEntity.ok(liked);
    }

    @Operation(
        summary = "앨범 좋아요 여부 확인",
        description = "해당 사용자가 앨범에 좋아요를 눌렀는지 여부를 반환합니다."
    )
    @GetMapping("/is-liked")
    public ResponseEntity<Boolean> isLikedByUser(
            @PathVariable("albumId") Long albumId,
            @RequestParam("userId") Long userId
    ) {
        return ResponseEntity.ok(likeService.isLikedByUser(userId, albumId));
    }
}
