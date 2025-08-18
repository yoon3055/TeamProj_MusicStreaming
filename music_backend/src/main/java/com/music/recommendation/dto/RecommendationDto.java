package com.music.recommendation.dto;

import com.music.recommendation.entity.Recommendation;
import com.music.music.entity.Song;
import com.music.user.entity.User;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;
import java.time.LocalDateTime;

public class RecommendationDto {

    @Getter @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class Request {
        private Long songId;
        private Long userId;    // nullable
        private String reason;  // nullable
    }

    @Getter @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class Response {
        private Long id;
        private SongInfo song;
        private UserInfo user;  // nullable
        private LocalDateTime recommendedAt;
        private String reason;  // nullable

        public static Response from(Recommendation recommendation) {
            return Response.builder()
                    .id(recommendation.getId())
                    .song(SongInfo.from(recommendation.getSong()))
                    .user(recommendation.getUser() != null ?
                            UserInfo.from(recommendation.getUser()) : null)
                    .recommendedAt(recommendation.getRecommendedAt())
                    .reason(recommendation.getReason())
                    .build();
        }
    }

    @Getter @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SongInfo {
        private Long id;
        private String title;
        private String artist;

        public static SongInfo from(Song song) {
            return new SongInfo(
                    song.getId(),
                    song.getTitle(),
                    song.getArtist().getName()
            );
        }
    }

    @Getter @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UserInfo {
        private Long id;
        private String nickname;

        public static UserInfo from(User user) {
            return new UserInfo(
                    user.getId(),
                    user.getNickname()
            );
        }
    }

    @Getter @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class SimpleResponse {
        private Long id;
        private SongInfo song;
        private LocalDateTime recommendedAt;
        private String reason;

        public static SimpleResponse from(Recommendation recommendation) {
            return SimpleResponse.builder()
                    .id(recommendation.getId())
                    .song(SongInfo.from(recommendation.getSong()))
                    .recommendedAt(recommendation.getRecommendedAt())
                    .reason(recommendation.getReason())
                    .build();
        }
    }
}