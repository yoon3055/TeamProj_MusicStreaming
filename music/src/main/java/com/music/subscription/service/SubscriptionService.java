package com.music.subscription.service;

import com.music.subscription.dto.UserSubscriptionDto;
import com.music.subscription.entity.SubscriptionPlan;
import com.music.subscription.entity.UserSubscription;
import com.music.subscription.repository.SubscriptionPlanRepository;
import com.music.subscription.repository.UserSubscriptionRepository;
import com.music.user.entity.User;
import com.music.user.repository.UserRepository;
import com.music.jwt.JwtTokenProvider;          // 정확한 패키지 경로로
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
    private final JwtTokenProvider jwtTokenProvider;

    /**
     * 새 구독 생성(이전 활성 구독은 종료 처리)
     */
    @Transactional
    public UserSubscriptionDto.Response subscribePlan(Long userId, Long planId) {
        // 1) 기존 활성 구독 종료
        subRepo.findByUserIdAndIsActiveTrue(userId)
               .ifPresent(active -> {
                   active.setActive(false);
                   active.setEndDate(LocalDateTime.now());
               });

        // 2) 플랜 조회
        SubscriptionPlan plan = planRepo.findById(planId)
            .orElseThrow(() -> new EntityNotFoundException("Plan not found"));

        // 3) User 프록시 가져오기
        User user = userRepo.getReferenceById(userId);

        // 4) 새 구독 생성
        UserSubscription sub = UserSubscription.builder()
            .user(user)
            .plan(plan)
            .startDate(LocalDateTime.now())
            .endDate(LocalDateTime.now().plusDays(plan.getDurationDays()))
            .isActive(true)
            .build();
        subRepo.save(sub);

        // 5) DTO 변환 반환
        return UserSubscriptionDto.Response.from(sub);
    }

    /**
     * 토큰에서 userId 추출 후, 활성 구독 조회
     */
    @Transactional(readOnly = true)
    public UserSubscriptionDto.Response getCurrentSubscription(String token) {
        Long userId = Long.valueOf(jwtTokenProvider.getUsername(token));
        UserSubscription sub = subRepo.findByUserIdAndIsActiveTrue(userId)
            .orElseThrow(() -> new EntityNotFoundException("Active subscription not found"));
        return UserSubscriptionDto.Response.from(sub);
    }

    /**
     * 구독 취소 (isActive=false, endDate=now), SimpleResponse 반환
     */
    @Transactional
    public UserSubscriptionDto.SimpleResponse cancelSubscription(Long subId) {
        UserSubscription sub = subRepo.findById(subId)
            .orElseThrow(() -> new EntityNotFoundException("Subscription not found"));
        sub.setActive(false);
        sub.setEndDate(LocalDateTime.now());
        return UserSubscriptionDto.SimpleResponse.from(sub);
    }
}
