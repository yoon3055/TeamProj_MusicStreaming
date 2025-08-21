package com.music.subscription.dto;

import com.music.subscription.entity.SubscriptionPlan;
import com.music.user.entity.User;
import com.music.subscription.entity.UserSubscription;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class UserSubscriptionDto {

    @Getter @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class Request {
        private Long userId;
        private Long planId;
        private LocalDateTime startDate;
        private LocalDateTime endDate;
    }

    @Getter @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class Response {
        private Long id;
        private UserInfo user;
        private PlanInfo plan;
        private LocalDateTime startDate;
        private LocalDateTime endDate;
        private boolean isActive;

        public static Response from(UserSubscription subscription) {
            return Response.builder()
                    .id(subscription.getId())
                    .user(UserInfo.from(subscription.getUser()))
                    .plan(PlanInfo.from(subscription.getPlan()))
                    .startDate(subscription.getStartDate())
                    .endDate(subscription.getEndDate())
                    .isActive(subscription.getIsActive())
                    .build();
        }
    }

    @Getter @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UserInfo {
        private Long id;
        private String nickname;
        private String email;

        public static UserInfo from(User user) {
            return new UserInfo(
                    user.getId(),
                    user.getNickname(),
                    user.getEmail()
            );
        }
    }

    @Getter @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PlanInfo {
        private Long id;
        private String name;
        private BigDecimal price;

        public static PlanInfo from(SubscriptionPlan plan) {
            return new PlanInfo(
                    plan.getId(),
                    plan.getName(),
                    plan.getPrice()
            );
        }
    }

    @Getter @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class UpdateRequest {
        private Long planId;
        private LocalDateTime endDate;
        private boolean isActive;
    }

    @Getter @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class SimpleResponse {
        private Long id;
        private String userName;
        private String planName;
        private LocalDateTime endDate;
        private boolean isActive;

        public static SimpleResponse from(UserSubscription subscription) {
            return SimpleResponse.builder()
                    .id(subscription.getId())
                    .userName(subscription.getUser().getNickname())
                    .planName(subscription.getPlan().getName())
                    .endDate(subscription.getEndDate())
                    .isActive(subscription.getIsActive())
                    .build();
        }
    }
}