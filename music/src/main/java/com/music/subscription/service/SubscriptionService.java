package com.music.subscription.service;

import com.music.subscription.entity.SubscriptionPlan;
import com.music.subscription.entity.UserSubscription;
import com.music.subscription.repository.SubscriptionPlanRepository;
import com.music.subscription.repository.UserSubscriptionRepository;
import com.music.user.entity.User;

import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import java.time.LocalDateTime;

import org.springframework.stereotype.Service;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class SubscriptionService {

    private final UserSubscriptionRepository subscriptionRepo;
    private final SubscriptionPlanRepository planRepo;

    /*
     * 사용자가 새 플랜을 구독할 때
     * 1) 기존 활성 구독(isActive=true)이 있으면 종료 처리
     * 2) 새 구독(UserSubscription) 생성
     */
    @Transactional
    public UserSubscription subscribePlan(Long userId, Long planId) {
        // 1) 기존 활성 구독 조회 후 종료
    	subscriptionRepo.findByUserIdAndIsActiveTrue(userId)
            .ifPresent(activeSub -> {
                activeSub.setActive(false);
                activeSub.setEndDate(LocalDateTime.now());
                subscriptionRepo.save(activeSub);
            });

        // 2) 플랜 정보 조회
        SubscriptionPlan plan = planRepo.findById(planId)
            .orElseThrow(() -> new EntityNotFoundException("Plan not found"));

        // 3) 새 구독 생성
        UserSubscription newSub = UserSubscription.builder()
            .user(User.builder().id(userId).build())   // user 레퍼런스만 설정
            .plan(plan)
            .startDate(LocalDateTime.now())
            .endDate(LocalDateTime.now().plusDays(plan.getDurationDays()))
            .isActive(true)
            .build();

        return subscriptionRepo.save(newSub);
    }
}
