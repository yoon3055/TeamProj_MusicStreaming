package com.music.subscription.admin.controller;

import com.music.subscription.dto.SubscriptionPlanDto;
import com.music.subscription.service.SubscriptionPlanService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/admin/subscription-plans")
@RequiredArgsConstructor
public class AdminPlanController {

    private final SubscriptionPlanService planService;

    /** 모든 요금제 조회 */
    @GetMapping
    public ResponseEntity<List<SubscriptionPlanDto.Response>> getAllPlans() {
        return ResponseEntity.ok(planService.getAllPlans());
    }

    /** 요금제 생성 */
    @PostMapping
    public ResponseEntity<SubscriptionPlanDto.Response> createPlan(@RequestBody SubscriptionPlanDto.Request request) {
        return ResponseEntity.ok(planService.createPlan(request));
    }

    /** 요금제 수정 */
    @PutMapping("/{planId}")
    public ResponseEntity<SubscriptionPlanDto.Response> updatePlan(
            @PathVariable Long planId,
            @RequestBody SubscriptionPlanDto.UpdateRequest request
    ) {
        return ResponseEntity.ok(planService.updatePlan(planId, request));
    }

    /** 요금제 삭제 */
    @DeleteMapping("/{planId}")
    public ResponseEntity<Void> deletePlan(@PathVariable Long planId) {
        planService.deletePlan(planId);
        return ResponseEntity.noContent().build();
    }
}
