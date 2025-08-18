package com.music.user.admin.dto;

import com.music.user.entity.Role;
import com.music.user.entity.User;
import lombok.*;

import java.time.LocalDateTime;

public class UserAdminDto {

    @Data
    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class UserResponse {
        private Long id;
        private String email;
        private String nickname;
        private String role;
        private String subscriptionPlan;
        private LocalDateTime createdAt;

        public static UserResponse from(User user) {
            return UserResponse.builder()
                    .id(user.getId())
                    .email(user.getEmail())
                    .nickname(user.getNickname())
                    .role(user.getRole().name()) // ENUM → String
                    .subscriptionPlan("Free") // 기본값
                    .build();
        }

        public static UserResponse from(User user, String subscriptionPlan) {
            return UserResponse.builder()
                    .id(user.getId())
                    .email(user.getEmail())
                    .nickname(user.getNickname())
                    .role(user.getRole().name())
                    .subscriptionPlan(subscriptionPlan != null ? subscriptionPlan : "Free")
                    .build();
        }
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class UpdateRequest {
        private String nickname;
        private Role role;
    }

}
