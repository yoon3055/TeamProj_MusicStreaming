package com.music.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;
import java.time.LocalDateTime;
import com.music.entity.UserSubscription;

// @Repository 어노테이션은 이 인터페이스가 레파지토리임을 스프링에게 알려줍니다.
// JpaRepository<엔티티 타입, 엔티티의 ID 타입>을 상속받아 기본적인 CRUD 기능을 제공받습니다.
@Repository
public interface UserSubscriptionRepository extends JpaRepository<UserSubscription, Long> {

    // 특정 사용자의 모든 구독 기록을 조회하는 메서드
    List<UserSubscription> findByUserId(Long userId);

    // 특정 사용자의 현재 활성(is_active = true) 구독 기록을 조회하는 메서드
    // 일반적으로 한 사용자는 특정 시점에 하나의 활성 구독만 가질 것이므로 Optional을 반환합니다.
    Optional<UserSubscription> findByUserIdAndIsActiveTrue(Long userId);

    // 특정 구독 요금제(plan_id)를 구독한 모든 사용자 기록을 조회하는 메서드
    List<UserSubscription> findByPlanId(Long planId);

    // 특정 기간(start_date 기준) 내에 시작된 모든 구독 기록을 조회하는 메서드
    List<UserSubscription> findByStartDateBetween(LocalDateTime startDateTime, LocalDateTime endDateTime);

    // 특정 기간(end_date 기준) 내에 만료되는 모든 구독 기록을 조회하는 메서드
    List<UserSubscription> findByEndDateBetween(LocalDateTime startDateTime, LocalDateTime endDateTime);

    // 현재 활성 상태인 모든 구독 기록을 조회하는 메서드
    List<UserSubscription> findByIsActiveTrue();

    // 특정 사용자가 특정 구독 요금제에 대한 활성 구독을 가지고 있는지 확인하는 메서드
    boolean existsByUserIdAndPlanIdAndIsActiveTrue(Long userId, Long planId);
}
