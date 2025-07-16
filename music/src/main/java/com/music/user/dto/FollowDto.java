package com.music.user.dto;

import com.music.user.entity.Follow;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;

public class FollowDto {

    @Getter @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class Request {
        private Long followerId;
        private Long followingId;
    }

    @Getter @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class Response {
        private Long id;
        private UserInfo follower;
        private UserInfo following;

        public static Response from(Follow follow) {
            return Response.builder()
                    .id(follow.getId())
                    .follower(new UserInfo(
                            follow.getFollower().getId(),
                            follow.getFollower().getNickname(),
                            follow.getFollower().getProfileImage()))
                    .following(new UserInfo(
                            follow.getFollowing().getId(),
                            follow.getFollowing().getNickname(),
                            follow.getFollowing().getProfileImage()))
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
    }

    @Getter @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class FollowerListResponse {
        private Long id;
        private UserInfo follower;

        public static FollowerListResponse from(Follow follow) {
            return FollowerListResponse.builder()
                    .id(follow.getId())
                    .follower(new UserInfo(
                            follow.getFollower().getId(),
                            follow.getFollower().getNickname(),
                            follow.getFollower().getProfileImage()))
                    .build();
        }
    }

    @Getter @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class FollowingListResponse {
        private Long id;
        private UserInfo following;

        public static FollowingListResponse from(Follow follow) {
            return FollowingListResponse.builder()
                    .id(follow.getId())
                    .following(new UserInfo(
                            follow.getFollowing().getId(),
                            follow.getFollowing().getNickname(),
                            follow.getFollowing().getProfileImage()))
                    .build();
        }
    }
}