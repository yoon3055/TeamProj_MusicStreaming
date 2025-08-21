package com.music.subscription.service;

import com.music.subscription.dto.UserSubscriptionDto;
import com.music.subscription.entity.SubscriptionPlan;
import com.music.subscription.entity.UserSubscription;
import com.music.subscription.repository.SubscriptionPlanRepository;
import com.music.subscription.repository.UserSubscriptionRepository;
import com.music.user.entity.User;
import com.music.user.repository.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class SubscriptionService {
    private final UserSubscriptionRepository subRepo;
    private final SubscriptionPlanRepository planRepo;
    private final UserRepository userRepo;

    /**
     * 새 구독 생성(이전 활성 구독은 종료 처리)
     */
    @Transactional
    public UserSubscriptionDto.Response subscribePlan(Long userId, Long planId) {
        subRepo.findByUserIdAndIsActiveTrue(userId)
                .ifPresent(active -> {
                    active.setIsActive(false);
                    active.setEndDate(LocalDateTime.now());
                });

        SubscriptionPlan plan = planRepo.findById(planId)
                .orElseThrow(() -> new EntityNotFoundException("Plan not found"));
        User user = userRepo.getReferenceById(userId);

        UserSubscription sub = UserSubscription.builder()
                .user(user)
                .subscriptionPlan(plan)
                .startDate(LocalDateTime.now())
                .endDate(LocalDateTime.now().plusDays(plan.getDurationDays()))
                .isActive(true)
                .build();
        subRepo.save(sub);

        return UserSubscriptionDto.Response.from(sub);
    }

    /**
     * 구독 취소 (isActive=false, endDate=now), SimpleResponse 반환
     */
    @Transactional
    public UserSubscriptionDto.SimpleResponse cancelSubscription(Long subId) {
        UserSubscription sub = subRepo.findById(subId)
                .orElseThrow(() -> new EntityNotFoundException("Subscription not found"));
        sub.setIsActive(false);
        sub.setEndDate(LocalDateTime.now());
        return UserSubscriptionDto.SimpleResponse.from(sub);
    }

    /**
     * 관리자용: 사용자 구독 정보 수정
     */
    @Transactional
    public UserSubscriptionDto.Response updateUserSubscription(Long userId, UserSubscriptionDto.UpdateRequest request) {

        UserSubscription currentSub = subRepo.findByUserIdAndIsActiveTrue(userId)
                .orElseThrow(() -> new EntityNotFoundException("Active subscription not found"));

        if (request.getPlanId() != null) {
            SubscriptionPlan newPlan = planRepo.findById(request.getPlanId())
                    .orElseThrow(() -> new EntityNotFoundException("Plan not found"));
            currentSub.setPlan(newPlan);
        }

        if (request.getEndDate() != null) {
            currentSub.setEndDate(request.getEndDate());
        }

        currentSub.setIsActive(request.isActive());

        return UserSubscriptionDto.Response.from(subRepo.save(currentSub));
    }
}
