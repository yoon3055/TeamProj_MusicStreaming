package com.music.music.dto;

import lombok.Builder;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Builder
public class SongListDto {
    private Long id;
    private String title;
    private String artistName;
    private String albumTitle;
    private String genre;
    private String originalFileName;
    private Long fileSize;
    private String fileFormat;
    private Integer duration;
    private String audioUrl;
    private String uploadedBy;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    
    // Artist 정보를 위한 중첩 클래스
    @Data
    @Builder
    public static class ArtistInfo {
        private Long id;
        private String name;
    }
    
    // Album 정보를 위한 중첩 클래스
    @Data
    @Builder
    public static class AlbumInfo {
        private Long id;
        private String title;
    }
    
    private ArtistInfo artist;
    private AlbumInfo album;
}
