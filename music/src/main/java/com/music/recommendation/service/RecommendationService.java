package com.music.recommendation.service;

import com.music.recommendation.dto.RecommendationDto;
import java.util.List;

public interface RecommendationService {
    // 1) 추천 생성
    RecommendationDto.Response createRecommendation(RecommendationDto.Request req);

    // 2) 사용자별 추천 목록 조회 (최신순)
    List<RecommendationDto.SimpleResponse> getRecommendationsByUser(Long userId);

    // 3) 곡별 추천 목록 조회 (최신순)
    List<RecommendationDto.SimpleResponse> getRecommendationsBySong(Long songId);

    // 4) 익명(로그인 없이) 추천 조회
    List<RecommendationDto.SimpleResponse> getAnonymousRecommendations();
}
