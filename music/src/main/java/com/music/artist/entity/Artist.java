package com.music.artist.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@Entity
@Table(name = "artist")
public class Artist {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // 아티스트 이름
    @Column(nullable = false, unique = true, length = 50)
    private String name;

    // 프로필 이미지 URL (예: S3 주소)
    @Column(name = "profile_image", length = 255)
    private String profileImage;

    // 장르 (예: Pop, Jazz, HipHop)
    @Column(length = 50)
    private String genre;

    // 아티스트 소개 또는 설명
    @Column(columnDefinition = "TEXT")
    private String description;

    // 생성일시
    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    // 기본 생성자
    public Artist() {}

    public Artist(String name, String profileImage, String genre, String description, LocalDateTime createdAt) {
        this.name = name;
        this.profileImage = profileImage;
        this.genre = genre;
        this.description = description;
        this.createdAt = createdAt;
    }

    // Getter & Setter
    public Long getId() { return id; }

    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }

    public void setName(String name) { this.name = name; }

    public String getProfileImage() { return profileImage; }

    public void setProfileImage(String profileImage) { this.profileImage = profileImage; }

    public String getGenre() { return genre; }

    public void setGenre(String genre) { this.genre = genre; }

    public String getDescription() { return description; }

    public void setDescription(String description) { this.description = description; }

    public LocalDateTime getCreatedAt() { return createdAt; }

    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    
    @Column(name = "like_count")
    private int likeCount = 0;

    public int getLikeCount() {
        return likeCount;
    }

    public void setLikeCount(int likeCount) {
        this.likeCount = likeCount;
    }

}
