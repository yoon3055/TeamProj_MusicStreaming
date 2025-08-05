package com.music.subscription.admin.controller;

import com.music.subscription.dto.SubscriptionPlanDto;
import com.music.subscription.service.SubscriptionPlanService;
import io.swagger.v3.oas.annotations.Operation;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/subscription-plans") // ✅ 경로 수정
@RequiredArgsConstructor
public class AdminPlanController {

    private final SubscriptionPlanService planService;

    @Operation(
        summary = "모든 요금제 조회",
        description = "관리자가 등록된 모든 구독 요금제 목록을 조회합니다."
    )
    @GetMapping
    public ResponseEntity<List<SubscriptionPlanDto.Response>> getAllPlans() {
        return ResponseEntity.ok(planService.getAllPlans());
    }

    @Operation(
        summary = "요금제 생성",
        description = "관리자가 새로운 구독 요금제를 생성합니다."
    )
    @PostMapping
    public ResponseEntity<SubscriptionPlanDto.Response> createPlan(@RequestBody SubscriptionPlanDto.Request request) {
        return ResponseEntity.ok(planService.createPlan(request));
    }

    @Operation(
        summary = "요금제 수정",
        description = "관리자가 기존 구독 요금제의 이름, 가격, 설명 등을 수정합니다."
    )
    @PutMapping("/{planId}")
    public ResponseEntity<SubscriptionPlanDto.Response> updatePlan(
            @PathVariable Long planId,
            @RequestBody SubscriptionPlanDto.UpdateRequest request
    ) {
        return ResponseEntity.ok(planService.updatePlan(planId, request));
    }

    @Operation(
        summary = "요금제 삭제",
        description = "관리자가 구독 요금제를 삭제합니다. 해당 플랜을 사용하는 유저가 없어야 삭제 가능합니다."
    )
    @DeleteMapping("/{planId}")
    public ResponseEntity<Void> deletePlan(@PathVariable Long planId) {
        planService.deletePlan(planId);
        return ResponseEntity.noContent().build();
    }
}
