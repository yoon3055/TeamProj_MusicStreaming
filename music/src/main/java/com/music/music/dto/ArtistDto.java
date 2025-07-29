package com.music.music.dto;

import com.music.music.entity.Artist;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;

public class ArtistDto {

    @Getter @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class Request {
        private String name;
        private String bio;
        private String imageUrl;
    }

    @Getter @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class Response {
        private Long id;
        private String name;
        private String bio;
        private String imageUrl;

        // Entity를 DTO로 변환하는 정적 메서드
        public static Response from(Artist artist) {
            return Response.builder()
                    .id(artist.getId())
                    .name(artist.getName())
                    .bio(artist.getBio())
                    .imageUrl(artist.getImageUrl())
                    .build();
        }
    }

    @Getter @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class UpdateRequest {
        private String name;
        private String bio;
        private String imageUrl;
    }

    @Getter @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ListResponse {
        private Long id;
        private String name;
        private String imageUrl;
        // 목록 조회시에는 bio를 제외하여 데이터 전송량 감소

        public static ListResponse from(Artist artist) {
            return ListResponse.builder()
                    .id(artist.getId())
                    .name(artist.getName())
                    .imageUrl(artist.getImageUrl())
                    .build();
        }
    }

    @Getter @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class SimpleResponse {
        private Long id;
        private String name;

        // 다른 엔티티에서 참조할 때 사용하는 간단한 응답용 DTO
        public static SimpleResponse from(Artist artist) {
            return SimpleResponse.builder()
                    .id(artist.getId())
                    .name(artist.getName())
                    .build();
        }
    }
}