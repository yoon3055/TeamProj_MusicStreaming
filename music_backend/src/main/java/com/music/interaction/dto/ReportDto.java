package com.music.interaction.dto;

import com.music.interaction.entity.Report;
import com.music.user.entity.User;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;
import java.time.LocalDateTime;

public class ReportDto {

    @Getter @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class Request {
        private Long userId;
        private String targetType;
        private Long targetId;
        private String reason;
    }

    @Getter @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class Response {
        private Long id;
        private UserInfo reporter;
        private String targetType;
        private Long targetId;
        private String reason;
        private LocalDateTime createdAt;

        public static Response from(Report report) {
            return Response.builder()
                    .id(report.getId())
                    .reporter(UserInfo.from(report.getUser()))
                    .targetType(report.getTargetType())
                    .targetId(report.getTargetId())
                    .reason(report.getReason())
                    .createdAt(report.getCreatedAt())
                    .build();
        }
    }

    @Getter @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UserInfo {
        private Long id;
        private String nickname;

        public static UserInfo from(User user) {
            return new UserInfo(
                    user.getId(),
                    user.getNickname()
            );
        }
    }

    @Getter @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class SimpleResponse {
        private Long id;
        private String targetType;
        private Long targetId;
        private LocalDateTime createdAt;

        public static SimpleResponse from(Report report) {
            return SimpleResponse.builder()
                    .id(report.getId())
                    .targetType(report.getTargetType())
                    .targetId(report.getTargetId())
                    .createdAt(report.getCreatedAt())
                    .build();
        }
    }
}