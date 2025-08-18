package com.music.admin.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

public class AdminStatsDto {

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class StatsResponse {
        private Long totalUsers;
        private Long activeSubscriptions;
        private Long totalSongs;
        private Long totalComments;
        private Map<String, Long> subscriptionBreakdown;
        private Map<String, Long> genreBreakdown;
        private Map<String, Long> artistBreakdown;
    }
}
