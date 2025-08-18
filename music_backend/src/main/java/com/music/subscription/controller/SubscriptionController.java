package com.music.subscription.controller;

import com.music.subscription.dto.UserSubscriptionDto;
import com.music.subscription.service.SubscriptionService;
import com.music.subscription.repository.UserSubscriptionRepository;
import com.music.user.repository.UserRepository;
import com.music.user.entity.User;
import io.swagger.v3.oas.annotations.Operation;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import jakarta.servlet.http.HttpServletRequest;

import java.util.Map;
import java.util.HashMap;
import java.util.List;
import java.util.ArrayList;
import java.util.stream.Collectors;
import com.music.subscription.entity.UserSubscription;

@RestController
@RequestMapping("/api/subscription")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:3000")
public class SubscriptionController {

    private final SubscriptionService subscriptionService;
    private final UserRepository userRepository;
    private final UserSubscriptionRepository userSubscriptionRepository;

    @Operation(
        summary = "현재 구독 정보 조회",
        description = "로그인한 사용자의 현재 구독 정보를 조회합니다."
    )
    @GetMapping("/current")
    public ResponseEntity<Map<String, Object>> getCurrentSubscription(HttpServletRequest httpRequest) {
        try {
            String username = (String) httpRequest.getAttribute("email");
            
            if (username == null) {
                return ResponseEntity.ok(null);
            }
            
            User user = userRepository.findByEmail(username).orElse(null);
            
            if (user == null) {
                return ResponseEntity.ok(null);
            }
            
            var subscriptionOpt = userSubscriptionRepository.findByUserIdAndIsActiveTrue(user.getId());
            
            return subscriptionOpt
                .map(subscription -> {
                    Map<String, Object> response = new HashMap<>();
                    response.put("planType", subscription.getSubscriptionPlan().getName());
                    response.put("status", subscription.getIsActive() ? "ACTIVE" : "INACTIVE");
                    response.put("startDate", subscription.getStartDate());
                    response.put("endDate", subscription.getEndDate());
                    response.put("planName", subscription.getSubscriptionPlan().getName());
                    response.put("price", subscription.getSubscriptionPlan().getPrice().intValue());
                    response.put("description", subscription.getSubscriptionPlan().getDescription());
                    return ResponseEntity.ok(response);
                })
                .orElse(ResponseEntity.ok(null));
                
        } catch (Exception e) {
            return ResponseEntity.ok(null);
        }
    }

    @Operation(
        summary = "구독 신청",
        description = "사용자(userId)가 특정 구독 플랜(planId)을 신청합니다. \n" +
                      "인증된 사용자만 요청할 수 있으며, JWT 토큰은 헤더 'X-AUTH-TOKEN'에 포함되어야 합니다."
    )
    @GetMapping("/all")
    public ResponseEntity<List<Map<String, Object>>> getAllSubscriptions(HttpServletRequest httpRequest) {
        try {
            String username = (String) httpRequest.getAttribute("email");
            
            if (username == null) {
                return ResponseEntity.ok(new ArrayList<>());
            }
            
            User user = userRepository.findByEmail(username).orElse(null);
            
            if (user == null) {
                return ResponseEntity.ok(new ArrayList<>());
            }
            
            // 해당 사용자의 모든 구독 정보 조회 (활성/비활성 모두)
            List<UserSubscription> allSubscriptions = userSubscriptionRepository.findByUserOrderByStartDateDesc(user);
            
            List<Map<String, Object>> response = allSubscriptions.stream()
                .map(subscription -> {
                    Map<String, Object> subData = new HashMap<>();
                    subData.put("id", subscription.getId());
                    subData.put("userId", subscription.getUser().getId());
                    subData.put("planId", subscription.getPlanId());
                    subData.put("planName", subscription.getSubscriptionPlan().getName());
                    subData.put("planType", subscription.getSubscriptionPlan().getName());
                    subData.put("price", subscription.getSubscriptionPlan().getPrice().intValue());
                    subData.put("description", subscription.getSubscriptionPlan().getDescription());
                    subData.put("startDate", subscription.getStartDate());
                    subData.put("endDate", subscription.getEndDate());
                    subData.put("isActive", subscription.getIsActive());
                    subData.put("status", subscription.getIsActive() ? "ACTIVE" : "INACTIVE");
                    subData.put("amount", subscription.getAmount());
                    subData.put("orderId", subscription.getOrderId());
                    subData.put("paymentKey", subscription.getPaymentKey());
                    return subData;
                })
                .collect(Collectors.toList());
                
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            return ResponseEntity.ok(new ArrayList<>());
        }
    }

    @PostMapping("/subscribe")
    public ResponseEntity<UserSubscriptionDto.Response> subscribe(
            @RequestParam Long userId,
            @RequestParam Long planId) {

        UserSubscriptionDto.Response sub =
                subscriptionService.subscribePlan(userId, planId);

        return ResponseEntity.ok(sub);
    }
}
