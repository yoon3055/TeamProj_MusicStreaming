package com.music.follow.controller;

import com.music.follow.dto.FollowDto.ArtistFollowRequest;
import com.music.follow.dto.FollowDto.ArtistFollowResponse;
import com.music.follow.service.ArtistFollowService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/follows")
@RequiredArgsConstructor
public class ArtistFollowController {

    private final ArtistFollowService followService;

    /**
     * 아티스트 팔로우 / 언팔로우 토글
     * POST /api/follows/artist
     */
    @PostMapping("/artist")
    public ResponseEntity<?> toggleFollow(@RequestBody ArtistFollowRequest request) {
        ArtistFollowResponse response = followService.toggleFollow(request);

        if (response == null) {
            return ResponseEntity.ok("팔로우 해제됨");
        }
        return ResponseEntity.ok(response);
    }

    /**
     * 특정 아티스트의 팔로워 수 조회
     * GET /api/follows/count/artist/{artistId}
     */
    @GetMapping("/count/artist/{artistId}")
    public ResponseEntity<Long> countFollowers(@PathVariable Long artistId) {
        return ResponseEntity.ok(followService.countFollowers(artistId));
    }
}
