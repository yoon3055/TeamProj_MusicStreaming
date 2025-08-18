package com.music.lyrics.dto;

import com.music.lyrics.entity.Lyrics;
import lombok.*;

import java.time.LocalDateTime;

public class LyricsDto {

    @Getter @Setter
    @NoArgsConstructor @AllArgsConstructor @Builder
    public static class Request {
        private Long songId;
        private String content;
    }

    @Getter @Setter
    @NoArgsConstructor @AllArgsConstructor @Builder
    public static class Response {
        private Long id;
        private Long songId;
        private String content;
        private LocalDateTime updatedAt;

        public static Response from(Lyrics lyrics) {
            return Response.builder()
                    .id(lyrics.getId())
                    .songId(lyrics.getSong().getId())
                    .content(lyrics.getContent())
                    .updatedAt(lyrics.getUpdatedAt())
                    .build();
        }
    }
}
