package com.music.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Setter
@Getter
@Entity
public class User {

    @Id // 기본 키(Primary Key)임을 나타냅니다.
    @GeneratedValue(strategy = GenerationType.IDENTITY) // ID 자동 생성을 데이터베이스에 위임합니다.
    private Long id; // BIGINT (PK)

    @Column(nullable = false, unique = true) // VARCHAR(255), NULL 불가능, UNIQUE 제약 조건
    private String email; // 이메일은 중복될 수 없습니다.

    @Column(nullable = false) // VARCHAR(255), NULL 불가능
    private String password; // 암호화된 비밀번호를 저장합니다.

    @Column(nullable = false, length = 100) // VARCHAR(100), NULL 불가능, 길이 제한
    private String nickname;

    @Column(length = 500) // VARCHAR(500), NULL 가능, 길이 제한
    private String profileImage; // 프로필 이미지 URL

    @Column(name = "is_verified", nullable = false) // BOOLEAN, NULL 불가능
    private boolean isVerified; // 사용자 인증 여부

    @Column(name = "created_at", nullable = false) // DATETIME, NULL 불가능
    private LocalDateTime createdAt; // 계정 생성 시간




}
