package com.music.interaction.dto;

import com.music.interaction.entity.Like;
import com.music.music.entity.Song;
import com.music.user.entity.User;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;

public class LikeDto {

    @Getter @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class Request {
        private Long userId;
        private Long songId;
    }

    @Getter @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class Response {
        private Long id;
        private SongInfo song;
        private UserInfo user;

        public static Response from(Like like) {
            return Response.builder()
                    .id(like.getId())
                    .song(SongInfo.from(like.getSong()))
                    .user(UserInfo.from(like.getUser()))
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

        public static SimpleResponse from(Like like) {
            return SimpleResponse.builder()
                    .id(like.getId())
                    .song(SongInfo.from(like.getSong()))
                    .build();
        }
    }
}
