package com.music.subscription.controller;

import com.music.subscription.dto.UserSubscriptionDto;
import com.music.subscription.service.SubscriptionService;
import io.swagger.v3.oas.annotations.Operation;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/subscriptions")
@RequiredArgsConstructor
public class SubscriptionController {

    private final SubscriptionService subscriptionService;

    @Operation(
        summary = "구독 신청",
        description = "사용자(userId)가 특정 구독 플랜(planId)을 신청합니다. \n" +
                      "인증된 사용자만 요청할 수 있으며, JWT 토큰은 헤더 'X-AUTH-TOKEN'에 포함되어야 합니다."
    )
    @PostMapping("/subscribe")
    public ResponseEntity<UserSubscriptionDto.Response> subscribe(
            @RequestParam Long userId,
            @RequestParam Long planId) {

        UserSubscriptionDto.Response sub =
                subscriptionService.subscribePlan(userId, planId);

        return ResponseEntity.ok(sub);
    }
}
