package com.music.subscription.admin.controller;

import com.music.subscription.dto.UserSubscriptionDto;
import com.music.subscription.service.SubscriptionService;
import io.swagger.v3.oas.annotations.Operation;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/admin/subscriptions/users") // ✅ 경로 수정
public class AdminUserSubscriptionController {

    private final SubscriptionService subscriptionService;

    @Operation(
        summary = "사용자 구독 플랜 변경",
        description = "관리자가 특정 사용자(userId)의 구독 플랜을 다른 플랜으로 변경합니다.\n" +
                      "변경할 구독 플랜 ID와 관련 정보는 요청 본문에 포함됩니다."
    )
    @PutMapping("/{userId}")
    public ResponseEntity<UserSubscriptionDto.Response> updateUserSubscription(
            @PathVariable Long userId,
            @RequestBody UserSubscriptionDto.UpdateRequest request
    ) {
        return ResponseEntity.ok(subscriptionService.updateUserSubscription(userId, request));
    }
}
