package com.music.recommendation.controller;

import com.music.recommendation.dto.RecommendationDto;
import com.music.recommendation.service.RecommendationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import jakarta.validation.Valid;
import java.net.URI;
import java.util.List;

@RestController
@RequestMapping("/api/recommendations")
@RequiredArgsConstructor
public class RecommendationController {
    private final RecommendationService recommendationService;

    /** 1) 추천 생성 */
    @PostMapping
    public ResponseEntity<RecommendationDto.Response> create(
            @Valid @RequestBody RecommendationDto.Request req) {

        RecommendationDto.Response created = recommendationService.createRecommendation(req);

        // 201 Created + Location 헤더
        URI location = ServletUriComponentsBuilder
                .fromCurrentRequest()
                .path("/{id}")
                .buildAndExpand(created.getId())
                .toUri();

        return ResponseEntity.created(location).body(created);
    }

    /** 2) 사용자별 추천 목록 조회 */
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<RecommendationDto.SimpleResponse>> listByUser(
            @PathVariable Long userId) {
        return ResponseEntity.ok(
                recommendationService.getRecommendationsByUser(userId));
    }

    /** 3) 곡별 추천 목록 조회 */
    @GetMapping("/song/{songId}")
    public ResponseEntity<List<RecommendationDto.SimpleResponse>> listBySong(
            @PathVariable Long songId) {
        return ResponseEntity.ok(
                recommendationService.getRecommendationsBySong(songId));
    }

    /** 4) 익명 추천 목록 조회 */
    @GetMapping("/anonymous")
    public ResponseEntity<List<RecommendationDto.SimpleResponse>> listAnonymous() {
        return ResponseEntity.ok(
                recommendationService.getAnonymousRecommendations());
    }
}
