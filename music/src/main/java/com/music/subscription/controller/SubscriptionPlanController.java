package com.music.subscription.controller;

import com.music.subscription.dto.SubscriptionPlanDto;
import com.music.subscription.repository.SubscriptionPlanRepository;
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

    /**
     * 모든 구독 플랜 조회
     *
     * HTTP Method : GET
     * 엔드포인트   : /api/subscription-plans
     *
     * @return ResponseEntity<List<SubscriptionPlanDto.SimpleResponse>>
     *         - HTTP 200 OK와 함께 SubscriptionPlanDto.SimpleResponse 리스트 반환
     *         - 각 DTO에는 id, name, price, durationDays 정보만 담겨 있음
     */
    @GetMapping
    public ResponseEntity<List<SubscriptionPlanDto.SimpleResponse>> listPlans() {
        // 1) DB에서 모든 SubscriptionPlan 엔티티를 조회
        List<SubscriptionPlanDto.SimpleResponse> list = planRepo.findAll().stream()
            // 2) 각 엔티티를 SimpleResponse DTO로 변환
            .map(SubscriptionPlanDto.SimpleResponse::from)
            .collect(Collectors.toList());

        // 3) 변환된 DTO 리스트를 HTTP 200 OK 응답으로 반환
        return ResponseEntity.ok(list);
    }
}
