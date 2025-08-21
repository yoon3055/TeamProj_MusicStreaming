package com.music.recommendation.controller;

import com.music.recommendation.dto.RecommendationDto;
import com.music.recommendation.service.RecommendationService;
import io.swagger.v3.oas.annotations.Operation;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.net.URI;
import java.util.List;

@RestController
@RequestMapping("/api/recommendations")
@RequiredArgsConstructor
public class RecommendationController {

    private final RecommendationService recommendationService;

    @Operation(
        summary = "추천 생성",
        description = "사용자 또는 익명의 추천 항목을 생성합니다. 곡 ID와 함께 추천 메시지를 입력할 수 있습니다."
    )
    @PostMapping
    public ResponseEntity<RecommendationDto.Response> create(
            @Valid @RequestBody RecommendationDto.Request req) {

        RecommendationDto.Response created = recommendationService.createRecommendation(req);

        URI location = ServletUriComponentsBuilder
                .fromCurrentRequest()
                .path("/{id}")
                .buildAndExpand(created.getId())
                .toUri();

        return ResponseEntity.created(location).body(created);
    }

    @Operation(
        summary = "사용자 추천 목록 조회",
        description = "특정 사용자가 남긴 추천 항목들을 모두 조회합니다."
    )
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<RecommendationDto.SimpleResponse>> listByUser(
            @PathVariable Long userId) {
        return ResponseEntity.ok(
                recommendationService.getRecommendationsByUser(userId));
    }

    @Operation(
        summary = "곡별 추천 목록 조회",
        description = "특정 곡에 대해 작성된 추천 목록을 조회합니다."
    )
    @GetMapping("/song/{songId}")
    public ResponseEntity<List<RecommendationDto.SimpleResponse>> listBySong(
            @PathVariable Long songId) {
        return ResponseEntity.ok(
                recommendationService.getRecommendationsBySong(songId));
    }

    @Operation(
        summary = "익명 추천 목록 조회",
        description = "사용자 정보 없이 작성된 익명 추천들만 필터링하여 반환합니다."
    )
    @GetMapping("/anonymous")
    public ResponseEntity<List<RecommendationDto.SimpleResponse>> listAnonymous() {
        return ResponseEntity.ok(
                recommendationService.getAnonymousRecommendations());
    }
}
