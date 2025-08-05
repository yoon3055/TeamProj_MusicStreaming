package com.music.follow.controller;

import com.music.follow.dto.FollowDto.ArtistFollowRequest;
import com.music.follow.dto.FollowDto.ArtistFollowResponse;
import com.music.follow.service.ArtistFollowService;
import io.swagger.v3.oas.annotations.Operation;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/follows/artists")
@RequiredArgsConstructor
public class ArtistFollowController {

    private final ArtistFollowService followService;

    @Operation(
        summary = "아티스트 팔로우/언팔로우 토글",
        description = "사용자가 아티스트를 팔로우하거나 언팔로우합니다. 이미 팔로우 중인 경우 언팔로우 처리됩니다."
    )
    @PostMapping
    public ResponseEntity<?> toggleFollow(@RequestBody ArtistFollowRequest request) {
        ArtistFollowResponse response = followService.toggleFollow(request);

        if (response == null) {
            return ResponseEntity.ok("팔로우 해제됨");
        }
        return ResponseEntity.ok(response);
    }
}
