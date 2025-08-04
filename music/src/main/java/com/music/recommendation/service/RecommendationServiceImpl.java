package com.music.recommendation.service;

import com.music.recommendation.dto.RecommendationDto;
import com.music.recommendation.entity.Recommendation;
import com.music.recommendation.repository.RecommendationRepository;
import com.music.music.entity.Song;
import com.music.music.repository.SongRepository;
import com.music.user.entity.User;
import com.music.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class RecommendationServiceImpl implements RecommendationService {

    private final RecommendationRepository recommendationRepository;
    private final SongRepository songRepository;
    private final UserRepository userRepository;

    @Override
    @Transactional
    public RecommendationDto.Response createRecommendation(RecommendationDto.Request req) {
        // 1) Song 조회 (존재하지 않으면 예외)
        Song song = songRepository.findById(req.getSongId())
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 곡입니다: " + req.getSongId()));

        // 2) User 조회 (nullable)
        User user = null;
        if (req.getUserId() != null) {
            user = userRepository.findById(req.getUserId())
                    .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 사용자입니다: " + req.getUserId()));
        }

        // 3) Recommendation 엔티티 생성 & 저장
        Recommendation rec = new Recommendation(user, song, LocalDateTime.now(), req.getReason());
        Recommendation saved = recommendationRepository.save(rec);

        // 4) DTO 변환 후 반환
        return RecommendationDto.Response.from(saved);
    }

    @Override
    public List<RecommendationDto.SimpleResponse> getRecommendationsByUser(Long userId) {
        return recommendationRepository
                .findByUserIdOrderByRecommendedAtDesc(userId)
                .stream()
                .map(RecommendationDto.SimpleResponse::from)
                .collect(Collectors.toList());
    }

    @Override
    public List<RecommendationDto.SimpleResponse> getRecommendationsBySong(Long songId) {
        return recommendationRepository
                .findBySongIdOrderByRecommendedAtDesc(songId)
                .stream()
                .map(RecommendationDto.SimpleResponse::from)
                .collect(Collectors.toList());
    }

    @Override
    public List<RecommendationDto.SimpleResponse> getAnonymousRecommendations() {
        return recommendationRepository
                .findByUserIsNullOrderByRecommendedAtDesc()
                .stream()
                .map(RecommendationDto.SimpleResponse::from)
                .collect(Collectors.toList());
    }
}
