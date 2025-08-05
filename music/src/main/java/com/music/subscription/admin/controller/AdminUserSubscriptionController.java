package com.music.subscription.admin.controller;

import com.music.subscription.dto.UserSubscriptionDto;
import com.music.subscription.service.SubscriptionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/admin/user-subscriptions")
public class AdminUserSubscriptionController {

    private final SubscriptionService subscriptionService;

    // ✅ 사용자 구독 플랜 변경
    @PutMapping("/{userId}")
    public ResponseEntity<UserSubscriptionDto.Response> updateUserSubscription(
            @PathVariable Long userId,
            @RequestBody UserSubscriptionDto.UpdateRequest request
    ) {
        return ResponseEntity.ok(subscriptionService.updateUserSubscription(userId, request));
    }
}
