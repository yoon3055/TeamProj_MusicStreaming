package com.music.music.dto;

import com.music.music.entity.Album;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;

import java.time.LocalDate;

public class AlbumDto {

    @Getter @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class Request {
        private String title;
        private Long artistId;  // Artist의 ID만 전달받습니다
        private LocalDate releaseDate;
        private String coverImage;
    }

    @Getter @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class Response {
        private Long id;
        private String title;
        private String artistName;  // Artist의 이름을 포함합니다
        private LocalDate releaseDate;
        private String coverImage;

        // Entity를 DTO로 변환하는 정적 메서드
        public static Response from(Album album) {
            return Response.builder()
                    .id(album.getId())
                    .title(album.getTitle())
                    .artistName(album.getArtist().getName())  // Artist 엔티티에 getName() 메서드가 있다고 가정
                    .releaseDate(album.getReleaseDate())
                    .coverImage(album.getCoverImage())
                    .build();
        }
    }

    @Getter @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class UpdateRequest {
        private String title;
        private LocalDate releaseDate;
        private String coverImage;
        // artistId는 수정 불가능하도록 제외
    }

    @Getter @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ListResponse {
        private Long id;
        private String title;
        private String artistName;
        private LocalDate releaseDate;
        // 목록 조회시에는 coverImage를 제외하여 데이터 전송량 감소

        public static ListResponse from(Album album) {
            return ListResponse.builder()
                    .id(album.getId())
                    .title(album.getTitle())
                    .artistName(album.getArtist().getName())
                    .releaseDate(album.getReleaseDate())
                    .build();
        }
    }
}