package com.music.subscription.service;

import com.music.subscription.dto.SubscriptionPlanDto;
import com.music.subscription.entity.SubscriptionPlan;
import com.music.subscription.repository.SubscriptionPlanRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SubscriptionPlanService {

    private final SubscriptionPlanRepository planRepo;

    /** 전체 요금제 조회 */
    public List<SubscriptionPlanDto.Response> getAllPlans() {
        return planRepo.findAll().stream()
                .map(SubscriptionPlanDto.Response::from)
                .collect(Collectors.toList());
    }

    /** 관리자용 전체 요금제 조회 (엔티티 반환) */
    public List<SubscriptionPlan> getAllPlansForAdmin() {
        return planRepo.findAll();
    }

    /** 관리자용 요금제 생성 (엔티티 직접 처리) */
    public SubscriptionPlan createPlan(SubscriptionPlan plan) {
        return planRepo.save(plan);
    }

    /** 관리자용 요금제 수정 (엔티티 직접 처리) */
    public SubscriptionPlan updatePlan(Long planId, SubscriptionPlan updatedPlan) {
        SubscriptionPlan plan = planRepo.findById(planId)
                .orElseThrow(() -> new EntityNotFoundException("요금제를 찾을 수 없습니다."));

        plan.setName(updatedPlan.getName());
        plan.setPrice(updatedPlan.getPrice());
        plan.setDurationDays(updatedPlan.getDurationDays());
        plan.setDescription(updatedPlan.getDescription());

        return planRepo.save(plan);
    }

    /** 요금제 생성 */
    public SubscriptionPlanDto.Response createPlan(SubscriptionPlanDto.Request request) {
        SubscriptionPlan plan = new SubscriptionPlan(
                request.getName(),
                request.getPrice(),
                request.getDurationDays(),
                request.getDescription()
        );
        return SubscriptionPlanDto.Response.from(planRepo.save(plan));
    }

    /** 요금제 수정 */
    public SubscriptionPlanDto.Response updatePlan(Long planId, SubscriptionPlanDto.UpdateRequest request) {
        SubscriptionPlan plan = planRepo.findById(planId)
                .orElseThrow(() -> new EntityNotFoundException("요금제를 찾을 수 없습니다."));

        plan.setName(request.getName());
        plan.setPrice(request.getPrice());
        plan.setDurationDays(request.getDurationDays());
        plan.setDescription(request.getDescription());

        return SubscriptionPlanDto.Response.from(planRepo.save(plan));
    }

    /** 요금제 삭제 */
    public void deletePlan(Long planId) {
        planRepo.deleteById(planId);
    }
}
