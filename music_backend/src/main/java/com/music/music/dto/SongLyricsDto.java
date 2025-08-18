package com.music.music.dto;

import com.music.music.entity.Song;
import com.music.music.entity.SongLyrics;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;

public class SongLyricsDto {

    @Getter @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class Request {
        private Long songId;
        private String language;
        private String lyrics;
    }

    @Getter @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class Response {
        private Long id;
        private SongInfo song;
        private String language;
        private String lyrics;

        public static Response from(SongLyrics songLyrics) {
            return Response.builder()
                    .id(songLyrics.getId())
                    .song(SongInfo.from(songLyrics.getSong()))
                    .language(songLyrics.getLanguage())
                    .lyrics(songLyrics.getLyrics())
                    .build();
        }
    }

    @Getter @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SongInfo {
        private Long id;
        private String title;
        private String artistName;

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
    @Builder
    public static class UpdateRequest {
        private String language;
        private String lyrics;
    }

    @Getter @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class SimpleResponse {
        private Long id;
        private String language;
        private String lyrics;

        public static SimpleResponse from(SongLyrics songLyrics) {
            return SimpleResponse.builder()
                    .id(songLyrics.getId())
                    .language(songLyrics.getLanguage())
                    .lyrics(songLyrics.getLyrics())
                    .build();
        }
    }
}