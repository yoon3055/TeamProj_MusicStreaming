package com.music.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table; // 테이블 이름을 명시하기 위해 import
import java.time.LocalDateTime;

@Entity // 이 클래스가 JPA 엔티티임을 나타냅니다.
@Table(name = "play_history") // 'History'는 일반적인 단어이므로 테이블 이름을 'play_history'로 명시
public class History {

    @Id // 기본 키(Primary Key)임을 나타냅니다.
    @GeneratedValue(strategy = GenerationType.IDENTITY) // ID 자동 생성을 데이터베이스에 위임합니다.
    private Long id; // BIGINT (PK)

    // User 엔티티와의 ManyToOne 관계 설정
    @ManyToOne // 지연 로딩 설정을 위해 (fetch = FetchType.LAZY)를 추가하는 것이 성능상 좋습니다.
    @JoinColumn(name = "user_id", nullable = false) // FK 컬럼 이름은 user_id, NULL 불가능
    private User user; // FK to User.id (User 엔티티 객체)

    // Song 엔티티와의 ManyToOne 관계 설정
    @ManyToOne // 지연 로딩 설정을 위해 (fetch = FetchType.LAZY)를 추가하는 것이 성능상 좋습니다.
    @JoinColumn(name = "song_id", nullable = false) // FK 컬럼 이름은 song_id, NULL 불가능
    private Song song; // FK to Song.id (Song 엔티티 객체)

    @Column(name = "played_at", nullable = false) // DATETIME, NULL 불가능
    private LocalDateTime playedAt; // 곡이 재생된 시간

    // Lombok을 사용하면 아래 생성자, Getter, Setter 코드를 자동으로 생성할 수 있어 편리합니다.
    // @NoArgsConstructor, @AllArgsConstructor, @Getter, @Setter 어노테이션 사용 권장

    public History() {
        // JPA에서 필수적인 기본 생성자
    }

    // 모든 필드를 포함하는 생성자 (ID 제외, ID는 자동 생성)
    public History(User user, Song song, LocalDateTime playedAt) {
        this.user = user;
        this.song = song;
        this.playedAt = playedAt;
    }

    // Getter 및 Setter 메서드
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public Song getSong() {
        return song;
    }

    public void setSong(Song song) {
        this.song = song;
    }

    public LocalDateTime getPlayedAt() {
        return playedAt;
    }

    public void setPlayedAt(LocalDateTime playedAt) {
        this.playedAt = playedAt;
    }
}
