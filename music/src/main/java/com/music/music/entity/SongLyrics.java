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

@Setter
@Getter
@Entity // 이 클래스가 JPA 엔티티임을 나타냅니다.
public class SongLyrics {

    @Id // 기본 키(Primary Key)임을 나타냅니다.
    @GeneratedValue(strategy = GenerationType.IDENTITY) // ID 자동 생성을 데이터베이스에 위임합니다.
    private Long id; // BIGINT (PK)

    // Song 엔티티와의 ManyToOne 관계 설정
    // 여러 SongLyrics가 하나의 Song에 속합니다.
    @ManyToOne // FetchType.LAZY를 명시하여 지연 로딩을 설정하는 것이 성능상 좋습니다. (fetch = FetchType.LAZY)
    @JoinColumn(name = "song_id", nullable = false) // FK 컬럼 이름은 song_id, NULL 불가능
    private Song song; // FK to Song.id (Song 엔티티 객체)

    @Column(nullable = false, length = 10) // VARCHAR(10), NULL 불가능
    private String language; // 가사 언어 (예: 'ko', 'en')

    @Column(columnDefinition = "TEXT", nullable = false) // TEXT, NULL 불가능
    private String lyrics; // 가사 내용 (긴 텍스트)

// Lombok을 사용하면 아래 생성자, Getter, Setter 코드를 자동으로 생성할 수 있어 편리합니다.
// @NoArgsConstructor, @AllArgsConstructor, @Getter, @Setter 어노테이션 사용 권장

}