package com.music.artist.dto;

import com.music.artist.entity.Artist;
import lombok.*;

import java.time.LocalDateTime;

public class ArtistDto {

    @Getter @Setter
    @NoArgsConstructor @AllArgsConstructor @Builder
    public static class Request {
        private String name;
        private String profileImage;
        private String genre;
        private String description;
    }

    @Getter @Setter
    @NoArgsConstructor @AllArgsConstructor @Builder
    public static class Response {
        private Long id;
        private String name;
        private String profileImage;
        private String genre;
        private String description;
        private LocalDateTime createdAt;

        public static Response from(Artist artist) {
            return Response.builder()
                    .id(artist.getId())
                    .name(artist.getName())
                    .profileImage(artist.getProfileImage())
                    .genre(artist.getGenre())
                    .description(artist.getDescription())
                    .createdAt(artist.getCreatedAt())
                    .build();
        }
    }
}
