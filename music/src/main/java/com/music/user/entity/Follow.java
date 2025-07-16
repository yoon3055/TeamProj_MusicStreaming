package com.music.user.entity;

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
        name = "user_follow", // 테이블 이름 명시 ('Follow'는 SQL 예약어일 수 있으므로 user_follow 사용)
        uniqueConstraints = {
                @UniqueConstraint(columnNames = {"follower_id", "following_id"}) // follower_id와 following_id 조합을 유니크하게 설정
        }
)
public class Follow {

    @Id // 기본 키(Primary Key)임을 나타냅니다.
    @GeneratedValue(strategy = GenerationType.IDENTITY) // ID 자동 생성을 데이터베이스에 위임합니다.
    private Long id; // BIGINT (PK)

    // 팔로우를 하는 사용자 (나)
    // User 엔티티와의 ManyToOne 관계 설정
    @ManyToOne // 지연 로딩 설정을 위해 (fetch = FetchType.LAZY)를 추가하는 것이 성능상 좋습니다.
    @JoinColumn(name = "follower_id", nullable = false) // FK 컬럼 이름은 follower_id, NULL 불가능
    private User follower; // FK to User.id (팔로우를 거는 사용자)

    // 팔로우를 받는 사용자 (상대방)
    // User 엔티티와의 ManyToOne 관계 설정
    @ManyToOne // 지연 로딩 설정을 위해 (fetch = FetchType.LAZY)를 추가하는 것이 성능상 좋습니다.
    @JoinColumn(name = "following_id", nullable = false) // FK 컬럼 이름은 following_id, NULL 불가능
    private User following; // FK to User.id (팔로우를 받는 사용자)

    // Lombok을 사용하면 아래 생성자, Getter, Setter 코드를 자동으로 생성할 수 있어 편리합니다.
    // @NoArgsConstructor, @AllArgsConstructor, @Getter, @Setter 어노테이션 사용 권장

    public Follow() {
        // JPA에서 필수적인 기본 생성자
    }

    // 모든 필드를 포함하는 생성자 (ID 제외, ID는 자동 생성)
    public Follow(User follower, User following) {
        this.follower = follower;
        this.following = following;
    }

    // Getter 및 Setter 메서드
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public User getFollower() {
        return follower;
    }

    public void setFollower(User follower) {
        this.follower = follower;
    }

    public User getFollowing() {
        return following;
    }

    public void setFollowing(User following) {
        this.following = following;
    }
}