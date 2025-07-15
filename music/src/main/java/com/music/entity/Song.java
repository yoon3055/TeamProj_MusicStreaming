package com.music.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Setter
@Getter
@Entity
public class Song {

    @Id // 기본 키(Primary Key)임을 나타냅니다.
    @GeneratedValue(strategy = GenerationType.IDENTITY) // ID 자동 생성을 데이터베이스에 위임합니다.
    private Long id; // BIGINT (PK)

    @Column(nullable = false, length = 255) // VARCHAR(255), NULL 불가능
    private String title; // 곡 제목

    // Album 엔티티와의 ManyToOne 관계 설정
    // 여러 Song이 하나의 Album에 속합니다. (앨범에 속하지 않을 수도 있으므로 nullable = true)
    @ManyToOne // FetchType.LAZY를 명시하여 지연 로딩을 설정하는 것이 성능상 좋습니다. (fetch = FetchType.LAZY)
    @JoinColumn(name = "album_id") // FK 컬럼 이름은 album_id. 앨범이 없는 곡도 있을 수 있으므로 nullable 기본값 사용 (true)
    private Album album; // FK to Album.id (Album 엔티티 객체)

    // Artist 엔티티와의 ManyToOne 관계 설정 (비정규화 목적)
    // 여러 Song이 하나의 Artist에 속합니다.
    @ManyToOne // FetchType.LAZY를 명시하여 지연 로딩을 설정하는 것이 성능상 좋습니다. (fetch = FetchType.LAZY)
    @JoinColumn(name = "artist_id", nullable = false) // FK 컬럼 이름은 artist_id, NULL 불가능
    private Artist artist; // FK to Artist.id (Artist 엔티티 객체)

    @Column(nullable = false) // INT, NULL 불가능
    private Integer duration; // 재생 시간 (초 단위)

    @Column(name = "audio_url", length = 500) // VARCHAR(500), NULL 가능
    private String audioUrl; // 음원 파일 링크

    @Column(length = 100) // VARCHAR(100), NULL 가능
    private String genre; // 곡 장르

    @Column(name = "created_at", nullable = false) // DATETIME, NULL 불가능
    private LocalDateTime createdAt; // 곡 정보 생성 시간

}
