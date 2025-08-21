package com.music.interaction.entity;

import com.music.music.entity.Song;
import com.music.user.entity.User;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;

@Entity // 이 클래스가 JPA 엔티티임을 나타냅니다.
@Table(
        name = "song_like", // 테이블 이름 명시 (Like는 SQL 예약어일 수 있으므로 song_like 사용)
        uniqueConstraints = {
                @UniqueConstraint(columnNames = {"user_id", "song_id"}) // user_id와 song_id 조합을 유니크하게 설정
        }
)
public class Like { // Like는 예약어이므로 SongLike로 클래스명 변경 권장 (여기서는 요청에 따라 Like로 유지)

    @Id // 기본 키(Primary Key)임을 나타냅니다.
    @GeneratedValue(strategy = GenerationType.IDENTITY) // ID 자동 생성을 데이터베이스에 위임합니다.
    private Long id; // BIGINT (PK)

    // User 엔티티와의 ManyToOne 관계 설정
    @ManyToOne // FetchType.LAZY를 명시하여 지연 로딩을 설정하는 것이 성능상 좋습니다. (fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false) // FK 컬럼 이름은 user_id, NULL 불가능
    private User user; // FK to User.id (User 엔티티 객체)

    // Song 엔티티와의 ManyToOne 관계 설정
    @ManyToOne // FetchType.LAZY를 명시하여 지연 로딩을 설정하는 것이 성능상 좋습니다. (fetch = FetchType.LAZY)
    @JoinColumn(name = "song_id", nullable = false) // FK 컬럼 이름은 song_id, NULL 불가능
    private Song song; // FK to Song.id (Song 엔티티 객체)


    // Lombok을 사용하면 아래 생성자, Getter, Setter 코드를 자동으로 생성할 수 있어 편리합니다.
    // @NoArgsConstructor, @AllArgsConstructor, @Getter, @Setter 어노테이션 사용 권장

    public Like() {
        // JPA에서 필수적인 기본 생성자
    }

    // 모든 필드를 포함하는 생성자 (ID 제외, ID는 자동 생성)
    public Like(User user, Song song) {
        this.user = user;
        this.song = song;
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

}