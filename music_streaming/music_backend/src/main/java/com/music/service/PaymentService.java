package com.music.service;

import com.music.dto.PaymentConfirmRequest;
import com.music.dto.PaymentConfirmResponse;
import com.music.user.entity.User;
import com.music.subscription.entity.UserSubscription;
import com.music.subscription.entity.SubscriptionPlan;
import com.music.user.repository.UserRepository;
import com.music.subscription.repository.UserSubscriptionRepository;
import com.music.subscription.repository.SubscriptionPlanRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
@Slf4j
public class PaymentService {

    private final UserRepository userRepository;
    private final UserSubscriptionRepository userSubscriptionRepository;
    private final SubscriptionPlanRepository subscriptionPlanRepository;

    @Transactional
    public PaymentConfirmResponse confirmPayment(PaymentConfirmRequest request, String username) {
        try {
            log.info("결제 승인 시작 - username: {}, orderId: {}, paymentKey: {}", username, request.getOrderId(), request.getPaymentKey());
            
            // 사용자 조회
            User user = userRepository.findByEmail(username)
                    .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다: " + username));
            log.info("사용자 조회 성공 - userId: {}, email: {}", user.getId(), user.getEmail());

            // orderId에서 planType 추출 (예: subscription_basic_1234567890)
            String planType = extractPlanTypeFromOrderId(request.getOrderId());
            log.info("플랜 타입 추출 - planType: {}", planType);
            
            // 중복 결제 체크
            if (userSubscriptionRepository.findByOrderId(request.getOrderId()).isPresent()) {
                log.warn("이미 처리된 주문입니다 - orderId: {}", request.getOrderId());
                throw new RuntimeException("이미 처리된 주문입니다.");
            }

            // 구독 플랜 조회 또는 생성
            SubscriptionPlan plan = subscriptionPlanRepository.findByName(planType)
                    .orElseThrow(() -> new RuntimeException("구독 플랜을 찾을 수 없습니다: " + planType));
            log.info("구독 플랜 조회 성공 - planId: {}, planName: {}, price: {}", plan.getId(), plan.getName(), plan.getPrice());

            // 기존 활성 구독 만료 처리
            userSubscriptionRepository.findByUserIdAndIsActiveTrue(user.getId())
                    .ifPresent(existingSubscription -> {
                        existingSubscription.setIsActive(false);
                        userSubscriptionRepository.save(existingSubscription);
                        log.info("기존 활성 구독 만료 처리 완료 - subscriptionId: {}", existingSubscription.getId());
                    });

            // 새 구독 생성
            LocalDateTime startDate = LocalDateTime.now();
            LocalDateTime endDate = startDate.plusDays(30); // 30일 구독

            UserSubscription newSubscription = UserSubscription.builder()
                    .user(user)
                    .subscriptionPlan(plan)
                    .planId(plan.getId())
                    .startDate(startDate)
                    .endDate(endDate)
                    .isActive(true)
                    .paymentKey(request.getPaymentKey())
                    .orderId(request.getOrderId())
                    .amount(request.getAmount())
                    .build();

            UserSubscription savedSubscription = userSubscriptionRepository.save(newSubscription);
            log.info("UserSubscription 저장 완료 - subscriptionId: {}", savedSubscription.getId());

            log.info("구독 결제 완료: 사용자={}, 플랜={}, 금액={}", username, planType, request.getAmount());

            return PaymentConfirmResponse.builder()
                    .planType(planType)
                    .status("ACTIVE")
                    .startDate(startDate)
                    .endDate(endDate)
                    .paymentKey(request.getPaymentKey())
                    .orderId(request.getOrderId())
                    .amount(request.getAmount())
                    .build();

        } catch (org.springframework.dao.DataIntegrityViolationException e) {
            log.warn("중복 결제 시도 - orderId: {}", request.getOrderId());
            throw new RuntimeException("이미 처리된 주문입니다.");
        } catch (org.springframework.dao.CannotAcquireLockException e) {
            log.warn("데드락 발생 - orderId: {}, 중복 결제 시도로 판단", request.getOrderId());
            throw new RuntimeException("이미 처리된 주문입니다.");
        } catch (Exception e) {
            log.error("결제 승인 처리 중 오류 발생", e);
            throw new RuntimeException("결제 승인 처리 중 오류가 발생했습니다.");
        }
    }

    private String extractPlanTypeFromOrderId(String orderId) {
        // orderId 형식: subscription_basic_1234567890 또는 subscription_plus_1234567890
        if (orderId.contains("_basic_")) {
            return "basic";
        } else if (orderId.contains("_plus_")) {
            return "plus";
        }
        return "basic"; // 기본값
    }

    private SubscriptionPlan createDefaultPlan(String planType) {
        SubscriptionPlan plan = new SubscriptionPlan();
        plan.setName(planType);
        
        // 플랜 정보는 이미 데이터베이스에서 조회했으므로 별도 설정 불필요
        plan.setDurationDays(30);
        return subscriptionPlanRepository.save(plan);
    }
}
