package com.music.playlist.dto;

import com.music.playlist.entity.Playlist;
import com.music.user.entity.User;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;
import java.time.LocalDateTime;

public class PlaylistDto {

    @Getter @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class Request {
        private String title;
        private boolean isPublic;
        private Long userId;
    }

    @Getter @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class Response {
        private Long id;
        private String title;
        private boolean isPublic;
        private LocalDateTime createdAt;
        private UserInfo user;

        public static Response from(Playlist playlist) {
            return Response.builder()
                    .id(playlist.getId())
                    .title(playlist.getTitle())
                    .isPublic(playlist.isPublic())
                    .createdAt(playlist.getCreatedAt())
                    .user(UserInfo.from(playlist.getUser()))
                    .build();
        }
    }

    @Getter @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class SimpleResponse {
        private Long id;
        private String title;
        private boolean isPublic;
        private LocalDateTime createdAt;

        public static SimpleResponse from(Playlist playlist) {
            return SimpleResponse.builder()
                    .id(playlist.getId())
                    .title(playlist.getTitle())
                    .isPublic(playlist.isPublic())
                    .createdAt(playlist.getCreatedAt())
                    .build();
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
}
