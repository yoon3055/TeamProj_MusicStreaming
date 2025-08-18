package com.music.music.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate; // release_date 필드를 위해 import

import com.music.artist.entity.Artist;

@Getter
@Setter
@Entity // 이 클래스가 JPA 엔티티임을 나타냅니다.
public class Album {

    @Id // 기본 키(Primary Key)임을 나타냅니다.
    @GeneratedValue(strategy = GenerationType.IDENTITY) // ID 자동 생성을 데이터베이스에 위임합니다.
    private Long id; // BIGINT (PK)

    @Column(nullable = false, length = 255) // VARCHAR(255), NULL 불가능
    private String title; // 앨범 제목

    // Artist 엔티티와의 ManyToOne 관계 설정
    // 여러 Album이 하나의 Artist에 속합니다.
    @ManyToOne // FetchType.LAZY를 명시하여 지연 로딩을 설정하는 것이 성능상 좋습니다. (fetch = FetchType.LAZY)
    @JoinColumn(name = "artist_id", nullable = false) // FK 컬럼 이름은 artist_id, NULL 불가능
    private Artist artist; // FK to Artist.id (Artist 엔티티 객체)

    @Column(name = "release_date", nullable = false) // DATE, NULL 불가능
    private LocalDate releaseDate; // 앨범 발매일

    @Column(name = "cover_image", length = 500) // VARCHAR(500), NULL 가능
    private String coverImage; // 앨범 커버 이미지 URL
    
    @Column(name = "like_count")
    private int likeCount = 0; // 기본값 0

    public int getLikeCount() {
        return likeCount;
    }

    public void setLikeCount(int likeCount) {
        this.likeCount = likeCount;
    }


// Lombok을 사용하면 아래 생성자, Getter, Setter 코드를 자동으로 생성할 수 있어 편리합니다.
// @NoArgsConstructor, @AllArgsConstructor, @Getter, @Setter 어노테이션 사용 권장

}
