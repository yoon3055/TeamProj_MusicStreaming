package com.music.playlist.dto;

import com.music.playlist.entity.PlaylistSong;
import com.music.music.entity.Song;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;

import java.util.List;

public class PlaylistSongDto {

    @Getter @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class Request {
        private Long playlistId;
        private Long songId;
        private Integer order;
    }

    @Getter @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class Response {
        private Long playlistId;
        private SongInfo song;
        private Integer order;

        public static Response from(PlaylistSong playlistSong) {
            return Response.builder()
                    .playlistId(playlistSong.getPlaylistId())
                    .song(SongInfo.from(playlistSong.getSong()))
                    .order(playlistSong.getOrder())
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
        private Integer duration;

        public static SongInfo from(Song song) {
            return new SongInfo(
                    song.getId(),
                    song.getTitle(),
                    song.getArtist().getName(),
                    song.getDuration()
            );
        }
    }

    @Getter @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class UpdateOrderRequest {
        private Long playlistId;
        private Long songId;
        private Integer newOrder;
    }

    @Getter @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class BatchUpdateRequest {
        private Long playlistId;
        private List<SongOrderInfo> songs;
    }

    @Getter @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SongOrderInfo {
        private Long songId;
        private Integer order;
    }
}