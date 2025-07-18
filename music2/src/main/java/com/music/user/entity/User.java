package com.music.user.entity;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "users")
public class User {

    @Id // JPA: 해당 필드가 엔티티의 기본 키(Primary Key)임을 지정
    @GeneratedValue(strategy = GenerationType.IDENTITY) // 기본 키의 값 생성 전략을 데이터베이스에 위임 (AUTO_INCREMENT)
    @Column(name = "id") // 데이터베이스 컬럼 이름 명시
    private Long id;

    @Column(name = "email", unique = true, nullable = false) // "email" 컬럼, 유니크 제약 조건, NULL 불허
    private String email;

    @Column(name = "password", nullable = false) // "password" 컬럼, NULL 불허
    private String password;

    @Column(name = "nickname", nullable = false) // "nickname" 컬럼, NULL 불허
    private String nickname;

    @Column(name = "profile_image") // "profile_image" 컬럼 (선택 사항이므로 nullable = false 없음)
    private String profileImage;

    @Column(name = "is_verified", nullable = false) // "is_verified" 컬럼, NULL 불허
    private boolean isVerified; // 이메일 인증 여부

    @Column(name = "created_at", nullable = false, updatable = false) // "created_at" 컬럼, NULL 불허, 업데이트 불가능
    private LocalDateTime createdAt; // 생성 시간

    @PrePersist // 엔티티가 영속화되기 전에 실행되는 메서드 (새로운 엔티티가 저장되기 전)
    protected void onCreate() {
        this.createdAt = LocalDateTime.now(); // 현재 시간으로 created_at 설정
    }



}
