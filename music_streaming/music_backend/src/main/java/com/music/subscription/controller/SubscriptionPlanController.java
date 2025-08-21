package com.music.subscription.controller;

import com.music.subscription.dto.SubscriptionPlanDto;
import com.music.subscription.repository.SubscriptionPlanRepository;
import io.swagger.v3.oas.annotations.Operation;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

/**
 * 구독 플랜 조회 전용 컨트롤러
 * 
 * - GET  /api/subscription-plans : 등록된 모든 구독 플랜을 간단한 DTO 형태로 반환
 */
@RestController
@RequestMapping("/api/subscription-plans")
@RequiredArgsConstructor
public class SubscriptionPlanController {

    /** 구독 플랜을 읽어오는 JPA 레포지토리 */
    private final SubscriptionPlanRepository planRepo;

    @Operation(
        summary = "전체 구독 플랜 조회",
        description = "등록된 모든 구독 플랜 정보를 id, name, price, durationDays 형식으로 간단히 반환합니다."
    )
    @GetMapping
    public ResponseEntity<List<SubscriptionPlanDto.SimpleResponse>> listPlans() {
        List<SubscriptionPlanDto.SimpleResponse> list = planRepo.findAll().stream()
            .map(SubscriptionPlanDto.SimpleResponse::from)
            .collect(Collectors.toList());

        return ResponseEntity.ok(list);
    }
}
