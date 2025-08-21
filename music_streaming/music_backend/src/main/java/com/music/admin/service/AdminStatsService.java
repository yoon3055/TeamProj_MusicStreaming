package com.music.admin.service;

import com.music.admin.dto.AdminStatsDto;
import com.music.user.repository.UserRepository;
import com.music.music.repository.SongRepository;
import com.music.interaction.repository.CommentRepository;
import com.music.subscription.repository.UserSubscriptionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AdminStatsService {

    private final UserRepository userRepository;
    private final SongRepository songRepository;
    private final CommentRepository commentRepository;
    private final UserSubscriptionRepository userSubscriptionRepository;

    public AdminStatsDto.StatsResponse getStats() {
        // 기본 통계 수집
        Long totalUsers = userRepository.count();
        Long totalSongs = songRepository.count();
        Long totalComments = commentRepository.count();
        Long activeSubscriptions = userSubscriptionRepository.countByIsActiveTrue();

        // 구독 등급별 사용자 수 (구독 플랜별)
        Map<String, Long> subscriptionBreakdown = getSubscriptionBreakdown();

        // 장르별 곡 수
        Map<String, Long> genreBreakdown = getGenreBreakdown();

        // 아티스트별 곡 수 (상위 7개)
        Map<String, Long> artistBreakdown = getArtistBreakdown();

        return AdminStatsDto.StatsResponse.builder()
                .totalUsers(totalUsers)
                .activeSubscriptions(activeSubscriptions)
                .totalSongs(totalSongs)
                .totalComments(totalComments)
                .subscriptionBreakdown(subscriptionBreakdown)
                .genreBreakdown(genreBreakdown)
                .artistBreakdown(artistBreakdown)
                .build();
    }

    private Map<String, Long> getSubscriptionBreakdown() {
        Map<String, Long> breakdown = new HashMap<>();
        
        // 구독 플랜별 활성 구독자 수 조회
        List<Object[]> results = userSubscriptionRepository.countActiveSubscriptionsByPlan();
        
        for (Object[] result : results) {
            String planName = (String) result[0];
            Long count = (Long) result[1];
            breakdown.put(planName, count);
        }
        
        // 기본값 설정 (구독하지 않은 사용자는 Free로 간주)
        Long totalUsers = userRepository.count();
        Long totalSubscribed = breakdown.values().stream().mapToLong(Long::longValue).sum();
        breakdown.put("Free", totalUsers - totalSubscribed);
        
        return breakdown;
    }

    private Map<String, Long> getGenreBreakdown() {
        Map<String, Long> breakdown = new HashMap<>();
        
        List<Object[]> results = songRepository.countByGenreGroupBy();
        
        for (Object[] result : results) {
            String genre = (String) result[0];
            Long count = (Long) result[1];
            if (genre != null && !genre.trim().isEmpty()) {
                breakdown.put(genre, count);
            }
        }
        
        // 기본 장르가 없으면 더미 데이터 추가
        if (breakdown.isEmpty()) {
            breakdown.put("Pop", 0L);
            breakdown.put("Rock", 0L);
            breakdown.put("HipHop", 0L);
            breakdown.put("Jazz", 0L);
            breakdown.put("Classical", 0L);
            breakdown.put("Electronic", 0L);
            breakdown.put("Ballad", 0L);
        }
        
        return breakdown;
    }

    private Map<String, Long> getArtistBreakdown() {
        Map<String, Long> breakdown = new HashMap<>();
        
        List<Object[]> results = songRepository.countByArtistGroupByTop7();
        
        for (Object[] result : results) {
            String artistName = (String) result[0];
            Long count = (Long) result[1];
            if (artistName != null && !artistName.trim().isEmpty()) {
                breakdown.put(artistName, count);
            }
        }
        
        // 기본 아티스트가 없으면 더미 데이터 추가
        if (breakdown.isEmpty()) {
            breakdown.put("Artist A", 0L);
            breakdown.put("Artist B", 0L);
            breakdown.put("Artist C", 0L);
            breakdown.put("Artist D", 0L);
            breakdown.put("Artist E", 0L);
            breakdown.put("Artist F", 0L);
            breakdown.put("Artist G", 0L);
        }
        
        return breakdown;
    }
}
