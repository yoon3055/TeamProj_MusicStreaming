package com.music.history.dto;

import com.music.history.entity.History;
import com.music.music.entity.Song;
import com.music.user.entity.User;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;
import java.time.LocalDateTime;

public class HistoryDto {

    @Getter @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class Request {
        private Long userId;
        private Long songId;
        private LocalDateTime playedAt;
    }

    @Getter @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class Response {
        private Long id;
        private LocalDateTime playedAt;
        private SongInfo song;
        private UserInfo user;

        public static Response from(History history) {
            return Response.builder()
                    .id(history.getId())
                    .playedAt(history.getPlayedAt())
                    .song(SongInfo.from(history.getSong()))
                    .user(UserInfo.from(history.getUser()))
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
        private String profileImage;

        public static UserInfo from(User user) {
            return new UserInfo(
                    user.getId(),
                    user.getNickname(),
                    user.getProfileImage()
            );
        }
    }

    @Getter @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class SimpleResponse {
        private Long id;
        private LocalDateTime playedAt;
        private SongInfo song;

        public static SimpleResponse from(History history) {
            return SimpleResponse.builder()
                    .id(history.getId())
                    .playedAt(history.getPlayedAt())
                    .song(SongInfo.from(history.getSong()))
                    .build();
        }
    }
}
