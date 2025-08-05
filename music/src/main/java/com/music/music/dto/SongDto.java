package com.music.music.dto;

import com.music.music.entity.Album;
import com.music.artist.entity.Artist;
import com.music.music.entity.Song;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;
import java.time.LocalDateTime;

public class SongDto {

    @Getter @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class Request {
        private String title;
        private Long artistId;
        private Long albumId;    // nullable
        private Integer duration;
        private String audioUrl; // nullable
        private String genre;    // nullable
    }

    @Getter @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class Response {
        private Long id;
        private String title;
        private ArtistInfo artist;
        private AlbumInfo album;
        private Integer duration;
        private String audioUrl;
        private String genre;
        private LocalDateTime createdAt;

        public static Response from(Song song) {
            return Response.builder()
                    .id(song.getId())
                    .title(song.getTitle())
                    .artist(ArtistInfo.from(song.getArtist()))
                    .album(song.getAlbum() != null ? AlbumInfo.from(song.getAlbum()) : null)
                    .duration(song.getDuration())
                    .audioUrl(song.getAudioUrl())
                    .genre(song.getGenre())
                    .createdAt(song.getCreatedAt())
                    .build();
        }
    }

    @Getter @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ArtistInfo {
        private Long id;
        private String name;

        public static ArtistInfo from(Artist artist) {
            return new ArtistInfo(
                    artist.getId(),
                    artist.getName()
            );
        }
    }

    @Getter @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AlbumInfo {
        private Long id;
        private String title;

        public static AlbumInfo from(Album album) {
            return new AlbumInfo(
                    album.getId(),
                    album.getTitle()

            );
        }
    }

    @Getter @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class SimpleResponse {
        private Long id;
        private String title;
        private String artistName;
        private Integer duration;
        private String genre;

        public static SimpleResponse from(Song song) {
            return SimpleResponse.builder()
                    .id(song.getId())
                    .title(song.getTitle())
                    .artistName(song.getArtist().getName())
                    .duration(song.getDuration())
                    .genre(song.getGenre())
                    .build();
        }
    }

    @Getter @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class UpdateRequest {
        private String title;
        private Long albumId;
        private Integer duration;
        private String audioUrl;
        private String genre;
    }
}