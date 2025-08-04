package com.music.subscription.entity;

import com.music.user.entity.User;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime; // 날짜와 시간 필드를 위해 import

@AllArgsConstructor
@Builder
@Entity // 이 클래스가 JPA 엔티티임을 나타냅니다.
@Table(name = "user_subscription") // 테이블 이름 명시
public class UserSubscription {

    @Id // 기본 키(Primary Key)임을 나타냅니다.
    @GeneratedValue(strategy = GenerationType.IDENTITY) // ID 자동 생성을 데이터베이스에 위임합니다.
    private Long id; // BIGINT (PK)

    // User 엔티티와의 ManyToOne 관계 설정
    @ManyToOne // 지연 로딩 설정을 위해 (fetch = FetchType.LAZY)를 추가하는 것이 성능상 좋습니다.
    @JoinColumn(name = "user_id", nullable = false) // FK 컬럼 이름은 user_id, NULL 불가능
    private User user; // FK to User.id (User 엔티티 객체)

    // SubscriptionPlan 엔티티와의 ManyToOne 관계 설정
    @ManyToOne // 지연 로딩 설정을 위해 (fetch = FetchType.LAZY)를 추가하는 것이 성능상 좋습니다.
    @JoinColumn(name = "plan_id", nullable = false) // FK 컬럼 이름은 plan_id, NULL 불가능
    private SubscriptionPlan plan; // FK to SubscriptionPlan.id (SubscriptionPlan 엔티티 객체)

    @Column(name = "start_date", nullable = false) // DATETIME, NULL 불가능
    private LocalDateTime startDate; // 구독 시작일

    @Column(name = "end_date", nullable = false) // DATETIME, NULL 불가능
    private LocalDateTime endDate; // 구독 종료일

    @Column(name = "is_active", nullable = false) // BOOLEAN, NULL 불가능
    private boolean isActive; // 현재 구독 활성 여부 (true = 활성, false = 비활성)

    // Lombok을 사용하면 아래 생성자, Getter, Setter 코드를 자동으로 생성할 수 있어 편리합니다.
    // @NoArgsConstructor, @AllArgsConstructor, @Getter, @Setter 어노테이션 사용 권장

    public UserSubscription() {
        // JPA에서 필수적인 기본 생성자
    }

    // 모든 필드를 포함하는 생성자 (ID 제외, ID는 자동 생성)
    public UserSubscription(User user, SubscriptionPlan plan, LocalDateTime startDate, LocalDateTime endDate, boolean isActive) {
        this.user = user;
        this.plan = plan;
        this.startDate = startDate;
        this.endDate = endDate;
        this.isActive = isActive;
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

    public SubscriptionPlan getPlan() {
        return plan;
    }

    public void setPlan(SubscriptionPlan plan) {
        this.plan = plan;
    }

    public LocalDateTime getStartDate() {
        return startDate;
    }

    public void setStartDate(LocalDateTime startDate) {
        this.startDate = startDate;
    }

    public LocalDateTime getEndDate() {
        return endDate;
    }

    public void setEndDate(LocalDateTime endDate) {
        this.endDate = endDate;
    }

    public boolean isActive() {
        return isActive;
    }

    public void setActive(boolean active) {
        isActive = active;
    }
}
