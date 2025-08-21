package com.music.user.dto;

import com.music.user.entity.User;
import com.music.user.entity.VerificationToken;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;
import java.time.LocalDateTime;

public class VerificationTokenDto {

    @Getter @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class Request {
        private Long userId;
        private String token;
        private LocalDateTime expiresAt;
    }

    @Getter @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class Response {
        private Long id;
        private UserInfo user;
        private String token;
        private LocalDateTime expiresAt;
        private LocalDateTime createdAt;
        private boolean isUsed;

        public static Response from(VerificationToken verificationToken) {
            return Response.builder()
                    .id(verificationToken.getId())
                    .user(UserInfo.from(verificationToken.getUser()))
                    .token(verificationToken.getToken())
                    .expiresAt(verificationToken.getExpiresAt())
                    .createdAt(verificationToken.getCreatedAt())
                    .isUsed(verificationToken.isUsed())
                    .build();
        }
    }

    @Getter @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UserInfo {
        private Long id;
        private String email;

        public static UserInfo from(User user) {
            return new UserInfo(
                    user.getId(),
                    user.getEmail()
            );
        }
    }

    @Getter @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ValidationRequest {
        private String token;
    }

    @Getter @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class SimpleResponse {
        private Long id;
        private String userEmail;
        private boolean isUsed;
        private LocalDateTime expiresAt;

        public static SimpleResponse from(VerificationToken verificationToken) {
            return SimpleResponse.builder()
                    .id(verificationToken.getId())
                    .userEmail(verificationToken.getUser().getEmail())
                    .isUsed(verificationToken.isUsed())
                    .expiresAt(verificationToken.getExpiresAt())
                    .build();
        }
    }
}