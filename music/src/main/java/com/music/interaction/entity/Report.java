package com.music.interaction.entity;

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
@Table(name = "report") // 데이터베이스 테이블 이름을 'report'로 명시합니다.
public class Report {

    @Id // 기본 키(Primary Key)임을 나타냅니다.
    @GeneratedValue(strategy = GenerationType.IDENTITY) // ID 자동 생성을 데이터베이스에 위임합니다.
    private Long id; // BIGINT (PK)

    // 신고를 한 사용자와의 다대일(N:1) 관계를 설정합니다.
    @ManyToOne // 기본적으로 지연 로딩(LAZY)이 적용되지만, 명시적으로 설정할 수도 있습니다 (fetch = FetchType.LAZY).
    @JoinColumn(name = "user_id", nullable = false) // 외래 키 컬럼 이름은 user_id, NULL을 허용하지 않습니다.
    private User user; // FK to User.id

    @Column(name = "target_type", nullable = false, length = 20) // VARCHAR(20), NULL을 허용하지 않습니다.
    // 'comment', 'song', 'user' 등 신고 대상의 타입을 문자열로 저장합니다.
    // Enum으로 매핑할 경우: @Enumerated(EnumType.STRING) private TargetType targetType;
    private String targetType;

    @Column(name = "target_id", nullable = false) // BIGINT, NULL을 허용하지 않습니다.
    private Long targetId; // 신고 대상의 ID (예: 댓글 ID, 곡 ID, 사용자 ID)

    @Column(columnDefinition = "TEXT", nullable = false) // TEXT, NULL을 허용하지 않습니다.
    private String reason; // 신고 사유 (긴 텍스트)

    @Column(name = "created_at", nullable = false) // DATETIME, NULL을 허용하지 않습니다.
    private LocalDateTime createdAt; // 신고 접수 시간

    // JPA가 엔티티를 생성할 때 사용하는 기본 생성자는 필수입니다.
    public Report() {
    }

    // 모든 필드를 포함하는 생성자 (ID는 데이터베이스에서 자동 생성되므로 제외합니다.)
    public Report(User user, String targetType, Long targetId, String reason, LocalDateTime createdAt) {
        this.user = user;
        this.targetType = targetType;
        this.targetId = targetId;
        this.reason = reason;
        this.createdAt = createdAt;
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

    public String getTargetType() {
        return targetType;
    }

    public void setTargetType(String targetType) {
        this.targetType = targetType;
    }

    public Long getTargetId() {
        return targetId;
    }

    public void setTargetId(Long targetId) {
        this.targetId = targetId;
    }

    public String getReason() {
        return reason;
    }

    public void setReason(String reason) {
        this.reason = reason;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
