package com.music.playlist.entity;

import com.music.user.entity.User;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import lombok.*;

import java.time.LocalDateTime;

@Builder
@Setter
@Getter
@NoArgsConstructor // 추가
@AllArgsConstructor // 추가
@Entity // 이 클래스가 JPA 엔티티임을 나타냅니다.
public class Playlist {

    @Id // 기본 키(Primary Key)임을 나타냅니다.
    @GeneratedValue(strategy = GenerationType.IDENTITY) // ID 자동 생성을 데이터베이스에 위임합니다.
    private Long id; // BIGINT (PK)

    // User 엔티티와의 ManyToOne 관계 설정
    // 여러 Playlist가 하나의 User에 속합니다.
    @ManyToOne // FetchType.LAZY를 명시하여 지연 로딩을 설정하는 것이 성능상 좋습니다. (fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false) // FK 컬럼 이름은 user_id, NULL 불가능
    private User user; // FK to User.id (User 엔티티 객체)

    @Column(nullable = false, length = 255) // VARCHAR(255), NULL 불가능
    private String title; // 플레이리스트 제목

    @Column(name = "is_public", nullable = false) // BOOLEAN, NULL 불가능
    private boolean isPublic; // 공개 여부 (true = 공개, false = 비공개)

    @Column(name = "created_at", nullable = false) // DATETIME, NULL 불가능
    private LocalDateTime createdAt; // 플레이리스트 생성 시간
    
    @Column(name = "like_count", nullable = false)
    private int likeCount = 0;

    @Column(name = "view_count", nullable = false)
    private int viewCount = 0;

    /* 좋아요 +1 / -1, 조회수 +1 헬퍼 메서드 */
    public void increaseLike()  { this.likeCount++;  }
    public void decreaseLike()  { this.likeCount--;  }
    public void increaseView()  { this.viewCount++;  }


// Lombok을 사용하면 아래 생성자, Getter, Setter 코드를 자동으로 생성할 수 있어 편리합니다.
// @NoArgsConstructor, @AllArgsConstructor, @Getter, @Setter 어노테이션 사용 권장

}