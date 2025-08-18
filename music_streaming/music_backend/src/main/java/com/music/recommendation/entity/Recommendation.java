package com.music.recommendation.entity;

import com.music.music.entity.Song;
import com.music.user.entity.User;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.time.LocalDateTime;

@Entity // 이 클래스가 JPA 엔티티임을 나타냅니다.
@Table(name = "recommendation") // 테이블 이름 명시
public class Recommendation {

    @Id // 기본 키(Primary Key)임을 나타냅니다.
    @GeneratedValue(strategy = GenerationType.IDENTITY) // ID 자동 생성을 데이터베이스에 위임합니다.
    private Long id; // BIGINT (PK)

    // User 엔티티와의 ManyToOne 관계 설정
    // user_id가 Nullable이므로, @JoinColumn의 nullable 속성을 true로 설정합니다.
    @ManyToOne // 지연 로딩 설정을 위해 (fetch = FetchType.LAZY)를 추가하는 것이 성능상 좋습니다.
    @JoinColumn(name = "user_id", nullable = true) // FK 컬럼 이름은 user_id, NULL 허용
    private User user; // FK to User.id (User 엔티티 객체)

    // Song 엔티티와의 ManyToOne 관계 설정
    @ManyToOne // 지연 로딩 설정을 위해 (fetch = FetchType.LAZY)를 추가하는 것이 성능상 좋습니다.
    @JoinColumn(name = "song_id", nullable = false) // FK 컬럼 이름은 song_id, NULL 불가능
    private Song song; // FK to Song.id (Song 엔티티 객체)

    @Column(name = "recommended_at", nullable = false) // DATETIME, NULL 불가능
    private LocalDateTime recommendedAt; // 추천된 시간

    @Column(length = 255) // VARCHAR(255), NULL 가능
    private String reason; // 추천 이유

    // Lombok을 사용하면 아래 생성자, Getter, Setter 코드를 자동으로 생성할 수 있어 편리합니다.
    // @NoArgsConstructor, @AllArgsConstructor, @Getter, @Setter 어노테이션 사용 권장

    public Recommendation() {
        // JPA에서 필수적인 기본 생성자
    }

    // 모든 필드를 포함하는 생성자 (ID 제외, ID는 자동 생성)
    // user는 nullable이므로 없을 경우 null 전달 가능
    public Recommendation(User user, Song song, LocalDateTime recommendedAt, String reason) {
        this.user = user;
        this.song = song;
        this.recommendedAt = recommendedAt;
        this.reason = reason;
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

    public LocalDateTime getRecommendedAt() {
        return recommendedAt;
    }

    public void setRecommendedAt(LocalDateTime recommendedAt) {
        this.recommendedAt = recommendedAt;
    }

    public String getReason() {
        return reason;
    }

    public void setReason(String reason) {
        this.reason = reason;
    }
}
