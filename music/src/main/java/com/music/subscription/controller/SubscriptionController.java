// src/main/java/com/music/subscription/controller/SubscriptionController.java
package com.music.subscription.controller;

import com.music.subscription.dto.UserSubscriptionDto;
import com.music.subscription.service.SubscriptionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/subscriptions")
@RequiredArgsConstructor
public class SubscriptionController {

    private final SubscriptionService subscriptionService;

    /**
     * 구독 신청
     * POST /api/subscriptions/subscribe?userId={userId}&planId={planId}
     * 헤더: X-AUTH-TOKEN
     */
    @PostMapping("/subscribe")
    public ResponseEntity<UserSubscriptionDto.Response> subscribe(
            @RequestParam Long userId,
            @RequestParam Long planId) {

        // 서비스가 반환하는 DTO 그대로 내려주면 끝
        UserSubscriptionDto.Response sub =
                subscriptionService.subscribePlan(userId, planId);

        return ResponseEntity.ok(sub);
    }
}
