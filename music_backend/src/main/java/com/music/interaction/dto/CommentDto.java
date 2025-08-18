package com.music.interaction.dto;

import com.music.interaction.entity.Comment;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;

import java.time.LocalDateTime;

public class CommentDto {

    @Getter @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class Request {
        private String content;
        private Long userId;
        private Long songId;
    }

    @Getter @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class Response {
        private Long id;
        private String content;
        private String userNickname;  // User의 닉네임을 표시
        private String songTitle;     // Song의 제목을 표시
        private LocalDateTime createdAt;

        public static Response from(Comment comment) {
            return Response.builder()
                    .id(comment.getId())
                    .content(comment.getContent())
                    .userNickname(comment.getUser().getNickname())
                    .songTitle(comment.getSong().getTitle())
                    .createdAt(comment.getCreatedAt())
                    .build();
        }
    }

    @Getter @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class UpdateRequest {
        private String content;
    }

    @Getter @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ListResponse {
        private Long id;
        private String content;
        private String userNickname;
        private String userProfileImage;  // 사용자 프로필 이미지 추가
        private LocalDateTime createdAt;

        public static ListResponse from(Comment comment) {
            return ListResponse.builder()
                    .id(comment.getId())
                    .content(comment.getContent())
                    .userNickname(comment.getUser().getNickname())
                    .userProfileImage(comment.getUser().getProfileImage())
                    .createdAt(comment.getCreatedAt())
                    .build();
        }
    }

    @Getter @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class SongCommentResponse {
        private Long id;
        private String content;
        private Long userId;
        private String userNickname;
        private String userProfileImage;
        private LocalDateTime createdAt;

        public static SongCommentResponse from(Comment comment) {
            return SongCommentResponse.builder()
                    .id(comment.getId())
                    .content(comment.getContent())
                    .userId(comment.getUser().getId())
                    .userNickname(comment.getUser().getNickname())
                    .userProfileImage(comment.getUser().getProfileImage())
                    .createdAt(comment.getCreatedAt())
                    .build();
        }
    }
}