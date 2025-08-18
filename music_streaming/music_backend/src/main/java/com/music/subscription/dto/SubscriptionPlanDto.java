package com.music.subscription.dto;

import com.music.subscription.entity.SubscriptionPlan;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;
import java.math.BigDecimal;

public class SubscriptionPlanDto {

    @Getter @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class Request {
        private String name;
        private BigDecimal price;
        private Integer durationDays;
        private String description;
    }

    @Getter @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class Response {
        private Long id;
        private String name;
        private BigDecimal price;
        private Integer durationDays;
        private String description;

        public static Response from(SubscriptionPlan plan) {
            return Response.builder()
                    .id(plan.getId())
                    .name(plan.getName())
                    .price(plan.getPrice())
                    .durationDays(plan.getDurationDays())
                    .description(plan.getDescription())
                    .build();
        }
    }

    @Getter @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class UpdateRequest {
        private String name;
        private BigDecimal price;
        private Integer durationDays;
        private String description;
    }

    @Getter @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class SimpleResponse {
        private Long id;
        private String name;
        private BigDecimal price;
        private Integer durationDays;

        public static SimpleResponse from(SubscriptionPlan plan) {
            return SimpleResponse.builder()
                    .id(plan.getId())
                    .name(plan.getName())
                    .price(plan.getPrice())
                    .durationDays(plan.getDurationDays())
                    .build();
        }
    }
}