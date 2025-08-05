package com.music.music.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

import com.music.artist.entity.Artist;

@Entity
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Song {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 255)
    private String title;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "album_id")
    private Album album;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "artist_id", nullable = false)
    private Artist artist;

    @Column(nullable = false)
    private Integer duration; // 재생 시간 (초 단위)

    @Column(name = "audio_url", length = 500)
    private String audioUrl; // 음원 파일 저장 경로

    @Column(length = 100)
    private String genre;

    @Column(name = "original_file_name", length = 255)
    private String originalFileName; // 원본 파일명

    @Column(name = "file_size")
    private Long fileSize; // 파일 크기 (바이트)

    @Column(name = "file_format", length = 10)
    private String fileFormat; // 파일 형식 (mp3, wav, flac 등)

    @Column(name = "uploaded_by")
    private String uploadedBy; // 업로드한 관리자 이메일

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
    
    @Column(name = "like_count")
    private int likeCount = 0; // 기본값 0

    public int getLikeCount() {
        return likeCount;
    }

    public void setLikeCount(int likeCount) {
        this.likeCount = likeCount;
    }

}
