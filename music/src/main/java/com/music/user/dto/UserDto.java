package com.music.user.dto;

import com.music.user.entity.User;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;

import java.time.LocalDateTime;

public class UserDto {

    @Getter @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class SignUpRequest {
        @Email(message = "올바른 이메일 형식이 아닙니다")
        private String email;

        @NotBlank(message = "비밀번호는 필수입니다")
        private String password;

        @NotBlank(message = "닉네임은 필수입니다")
        private String nickname;

        private String profileImage;
    }


    @Getter @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class LoginRequest {
        @Email(message = "올바른 이메일 형식이 아닙니다")
        private String email;

        @NotBlank(message = "비밀번호는 필수입니다")
        private String password;
    }


    @Getter @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class Response {
        private Long id;
        private String email;
        private String nickname;
        private String profileImage;
        private boolean isVerified;
        private LocalDateTime createdAt;

        public static Response from(User user) {
            return Response.builder()
                    .id(user.getId())
                    .email(user.getEmail())
                    .nickname(user.getNickname())
                    .profileImage(user.getProfileImage())
                    .isVerified(user.isVerified())
                    .createdAt(user.getCreatedAt())
                    .build();
        }
    }

    @Getter @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UserInfo {
        private Long id;
        private String nickname;
        private String profileImage;

        public static UserInfo from(User user) {
            return new UserInfo(
                    user.getId(),
                    user.getNickname(),
                    user.getProfileImage()
            );
        }
    }



    @Getter @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class UpdateRequest {
        private String nickname;
        private String profileImage;
        // 이메일은 수정 불가능하도록 제외
    }


    @Getter @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class SimpleResponse {
        private Long id;
        private String nickname;
        private String profileImage;

        public static SimpleResponse from(User user) {
            return SimpleResponse.builder()
                    .id(user.getId())
                    .nickname(user.getNickname())
                    .profileImage(user.getProfileImage())
                    .build();
        }
    }


    @Getter @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class PasswordChangeRequest {
        private String currentPassword;
        private String newPassword;
        private String newPasswordConfirm;
    }
}