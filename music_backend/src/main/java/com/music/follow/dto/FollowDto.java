package com.music.follow.dto;

import com.music.artist.entity.Artist;
import com.music.follow.entity.ArtistFollow;
import com.music.follow.entity.UserFollow;
import com.music.user.entity.User;
import lombok.*;

import java.time.LocalDateTime;

public class FollowDto {

    // ================= 유저 → 아티스트 =================
    @Getter @Setter
    @NoArgsConstructor @AllArgsConstructor @Builder
    public static class ArtistFollowRequest {
        private Long userId;
        private Long artistId;
    }

    @Getter @Setter
    @NoArgsConstructor @AllArgsConstructor @Builder
    public static class ArtistFollowResponse {
        private Long id;
        private Long userId;
        private Long artistId;
        private LocalDateTime followedAt;

        public static ArtistFollowResponse from(ArtistFollow follow) {
            return ArtistFollowResponse.builder()
                    .id(follow.getId())
                    .userId(follow.getUser().getId())
                    .artistId(follow.getArtist().getId())
                    .followedAt(follow.getFollowedAt())
                    .build();
        }
    }

    // ================= 유저 → 유저 =================
    @Getter @Setter
    @NoArgsConstructor @AllArgsConstructor @Builder
    public static class UserFollowRequest {
        private Long followerId;
        private Long followingId;
    }

    @Getter @Setter
    @NoArgsConstructor @AllArgsConstructor @Builder
    public static class UserFollowResponse {
        private Long id;
        private UserInfo follower;
        private UserInfo following;

        public static UserFollowResponse from(UserFollow follow) {
            return UserFollowResponse.builder()
                    .id(follow.getId())
                    .follower(UserInfo.from(follow.getFollower()))
                    .following(UserInfo.from(follow.getFollowing()))
                    .build();
        }
    }

    // 공통 유저 정보 DTO
    @Getter @Setter
    @NoArgsConstructor @AllArgsConstructor
    public static class UserInfo {
        private Long id;
        private String nickname;
        private String profileImage;

        public static UserInfo from(User user) {
            return new UserInfo(user.getId(), user.getNickname(), user.getProfileImage());
        }
    }

    // 유저 기준 팔로잉 목록 응답
    @Getter @Setter
    @NoArgsConstructor @AllArgsConstructor @Builder
    public static class FollowingListResponse {
        private Long id;
        private UserInfo following;

        public static FollowingListResponse from(UserFollow follow) {
            return FollowingListResponse.builder()
                    .id(follow.getId())
                    .following(UserInfo.from(follow.getFollowing()))
                    .build();
        }
    }

    // 유저 기준 팔로워 목록 응답
    @Getter @Setter
    @NoArgsConstructor @AllArgsConstructor @Builder
    public static class FollowerListResponse {
        private Long id;
        private UserInfo follower;

        public static FollowerListResponse from(UserFollow follow) {
            return FollowerListResponse.builder()
                    .id(follow.getId())
                    .follower(UserInfo.from(follow.getFollower()))
                    .build();
        }
    }
}
