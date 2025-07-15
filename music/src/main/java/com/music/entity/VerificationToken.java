package com.music.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Setter
@Getter
@Entity
public class VerificationToken {

    @Id // 기본 키(Primary Key)임을 나타냅니다.
    @GeneratedValue(strategy = GenerationType.IDENTITY) // ID 자동 생성을 데이터베이스에 위임합니다.
    private Long id; // BIGINT (PK)

    // User 엔티티와의 ManyToOne 관계 설정
    // 여러 VerificationToken이 하나의 User에 속합니다.
    @ManyToOne // FetchType.LAZY를 명시하여 지연 로딩을 설정하는 것이 성능상 좋습니다. (fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false) // FK 컬럼 이름은 user_id, NULL 불가능
    private User user; // FK to User.id (User 엔티티 객체)

    @Column(nullable = false, unique = true, length = 255) // VARCHAR(255), NULL 불가능, UNIQUE 제약 조건
    private String token; // 실제 인증 토큰 값

    @Column(name = "expires_at", nullable = false) // DATETIME, NULL 불가능
    private LocalDateTime expiresAt; // 토큰 만료 시간

    // 누락된 필드 추가
    private LocalDateTime createdAt;

    // 1. `@PrePersist` 어노테이션을 사용하여 엔티티가 저장되기 전에 자동으로 생성 시간이 설정되도록 했습니다.
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }



    @Column(name = "is_used", nullable = false) // BOOLEAN, NULL 불가능
    private boolean isUsed; // 토큰 사용 여부 (true = 사용됨, false = 사용 안됨)






}
