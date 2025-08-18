package com.music.subscription.admin.controller;

import com.music.subscription.dto.UserSubscriptionDto;
import com.music.subscription.service.SubscriptionService;
import io.swagger.v3.oas.annotations.Operation;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/subscriptions")  // ← 수정됨: /admin → /api/admin
@RequiredArgsConstructor
public class AdminSubscriptionController {

    private final SubscriptionService subscriptionService;

    @Operation(
        summary = "사용자에게 구독 플랜 부여",
        description = "관리자가 특정 사용자(userId)에게 구독 플랜(planId)을 부여합니다. 이미 구독 중인 경우에는 예외 처리됩니다."
    )
    @PostMapping("/{userId}/subscribe/{planId}")
    public ResponseEntity<UserSubscriptionDto.Response> subscribeUserToPlan(
            @PathVariable Long userId,
            @PathVariable Long planId) {
        return ResponseEntity.ok(subscriptionService.subscribePlan(userId, planId));
    }

    @Operation(
        summary = "사용자 구독 취소",
        description = "관리자가 특정 구독(subscriptionId)을 취소합니다. 구독 ID는 UserSubscription의 ID입니다."
    )
    @PostMapping("/{subscriptionId}/cancel")
    public ResponseEntity<UserSubscriptionDto.SimpleResponse> cancelSubscription(
            @PathVariable Long subscriptionId) {
        return ResponseEntity.ok(subscriptionService.cancelSubscription(subscriptionId));
    }

}
