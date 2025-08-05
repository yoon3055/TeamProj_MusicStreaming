package com.music.subscription.admin.controller;

import com.music.subscription.dto.UserSubscriptionDto;
import com.music.subscription.service.SubscriptionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/admin/subscriptions")
@RequiredArgsConstructor
public class AdminSubscriptionController {

    private final SubscriptionService subscriptionService;

    // 특정 사용자에게 구독 플랜 부여
    @PostMapping("/{userId}/subscribe/{planId}")
    public ResponseEntity<UserSubscriptionDto.Response> subscribeUserToPlan(
            @PathVariable Long userId,
            @PathVariable Long planId) {
        return ResponseEntity.ok(subscriptionService.subscribePlan(userId, planId));
    }

    // 특정 구독 취소
    @PostMapping("/{subscriptionId}/cancel")
    public ResponseEntity<UserSubscriptionDto.SimpleResponse> cancelSubscription(
            @PathVariable Long subscriptionId) {
        return ResponseEntity.ok(subscriptionService.cancelSubscription(subscriptionId));
    }

    // 필요하면 여기서 전체 사용자 구독 내역 조회, 구독별 상태 등 확장 가능
}
