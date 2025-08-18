package com.music.follow.service;

import com.music.user.entity.User;
import com.music.follow.entity.UserFollow;
import com.music.follow.dto.FollowDto;
import com.music.follow.repository.UserFollowRepository;
import com.music.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserFollowService {

    private final UserFollowRepository followRepository;
    private final UserRepository userRepository;

    // 팔로우 토글
    public FollowDto.UserFollowResponse toggleFollow(FollowDto.UserFollowRequest request) {
        User follower = userRepository.findById(request.getFollowerId())
                .orElseThrow(() -> new RuntimeException("팔로우 요청자 없음"));
        User following = userRepository.findById(request.getFollowingId())
                .orElseThrow(() -> new RuntimeException("팔로우 대상 없음"));

        Optional<UserFollow> existing = followRepository.findByFollowerIdAndFollowingId(
                follower.getId(), following.getId());

        if (existing.isPresent()) {
            followRepository.delete(existing.get());
            return null; // 언팔로우됨
        }

        UserFollow follow = new UserFollow(follower, following);
        followRepository.save(follow);

        return FollowDto.UserFollowResponse.from(follow);
    }

    // 내가 팔로우한 사람들
    public List<FollowDto.FollowingListResponse> getFollowings(Long userId) {
        return followRepository.findByFollowerId(userId)
                .stream()
                .map(FollowDto.FollowingListResponse::from)
                .collect(Collectors.toList());
    }

    // 나를 팔로우하는 사람들
    public List<FollowDto.FollowerListResponse> getFollowers(Long userId) {
        return followRepository.findByFollowingId(userId)
                .stream()
                .map(FollowDto.FollowerListResponse::from)
                .collect(Collectors.toList());
    }
}
