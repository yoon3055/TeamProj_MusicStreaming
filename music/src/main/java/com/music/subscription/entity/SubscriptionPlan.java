package com.music.subscription.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.math.BigDecimal; // 가격 (DECIMAL)을 위해 import

@Entity // 이 클래스가 JPA 엔티티임을 나타냅니다.
@Table(name = "subscription_plan") // 테이블 이름 명시
public class SubscriptionPlan {

    @Id // 기본 키(Primary Key)임을 나타냅니다.
    @GeneratedValue(strategy = GenerationType.IDENTITY) // ID 자동 생성을 데이터베이스에 위임합니다.
    private Long id; // BIGINT (PK)

    @Column(nullable = false, unique = true, length = 100) // VARCHAR(100), NULL 불가능, UNIQUE 제약 조건
    private String name; // 요금제 이름 (예: "Basic", "Premium")

    @Column(nullable = false, precision = 10, scale = 2) // DECIMAL(10,2), NULL 불가능
    private BigDecimal price; // 가격 (소수점 2자리까지 정확하게 표현)

    @Column(name = "duration_days", nullable = false) // INT, NULL 불가능
    private Integer durationDays; // 구독 기간 (일 단위)

    @Column(columnDefinition = "TEXT") // TEXT 타입에 매핑되도록 합니다. NULL 가능
    private String description; // 요금제 설명 (긴 텍스트)

    // Lombok을 사용하면 아래 생성자, Getter, Setter 코드를 자동으로 생성할 수 있어 편리합니다.
    // @NoArgsConstructor, @AllArgsConstructor, @Getter, @Setter 어노테이션 사용 권장

    public SubscriptionPlan() {
        // JPA에서 필수적인 기본 생성자
    }

    // 모든 필드를 포함하는 생성자 (ID 제외, ID는 자동 생성)
    public SubscriptionPlan(String name, BigDecimal price, Integer durationDays, String description) {
        this.name = name;
        this.price = price;
        this.durationDays = durationDays;
        this.description = description;
    }

    // Getter 및 Setter 메서드
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public BigDecimal getPrice() {
        return price;
    }

    public void setPrice(BigDecimal price) {
        this.price = price;
    }

    public Integer getDurationDays() {
        return durationDays;
    }

    public void setDurationDays(Integer durationDays) {
        this.durationDays = durationDays;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }
}