package com.music.subscription.repository;

import com.music.subscription.entity.SubscriptionPlan;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.math.BigDecimal; // 가격 비교를 위해 필요
import java.util.List;
import java.util.Optional;


// @Repository 어노테이션은 이 인터페이스가 레파지토리임을 스프링에게 알려줍니다.
// JpaRepository<엔티티 타입, 엔티티의 ID 타입>을 상속받아 기본적인 CRUD 기능을 제공받습니다.
@Repository
public interface SubscriptionPlanRepository extends JpaRepository<SubscriptionPlan, Long> {

    // 요금제 이름으로 SubscriptionPlan을 조회하는 메서드
    // name 필드는 UNIQUE 속성을 가지고 있으므로, Optional<SubscriptionPlan>을 반환합니다.
    Optional<SubscriptionPlan> findByName(String name);

    // 특정 가격 이하의 모든 구독 요금제를 조회하는 메서드
    List<SubscriptionPlan> findByPriceLessThanEqual(BigDecimal price);

    // 특정 가격 이상의 모든 구독 요금제를 조회하는 메서드
    List<SubscriptionPlan> findByPriceGreaterThanEqual(BigDecimal price);

    // 특정 구독 기간(일)을 가진 요금제를 조회하는 메서드
    List<SubscriptionPlan> findByDurationDays(Integer durationDays);

    // 특정 가격 범위 내의 모든 구독 요금제를 조회하는 메서드
    List<SubscriptionPlan> findByPriceBetween(BigDecimal minPrice, BigDecimal maxPrice);

    // 요금제 이름의 존재 여부를 확인하는 메서드 (새로운 요금제 생성 시 중복 이름 방지 등)
    boolean existsByName(String name);
}
