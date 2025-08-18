package com.music.user.admin.service;

import com.music.user.admin.dto.UserAdminDto;
import com.music.user.entity.Role;
import com.music.user.entity.User;
import com.music.user.repository.UserRepository;
import com.music.subscription.repository.UserSubscriptionRepository;

import lombok.Data;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import lombok.Setter;

import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserAdminService {

    private final UserRepository userRepository;
    private final UserSubscriptionRepository userSubscriptionRepository;

    public List<UserAdminDto.UserResponse> searchUsers(String keyword, String roleFilter) {
        List<User> users;

        // 키워드 검색
        if (keyword != null && !keyword.isBlank()) {
            users = userRepository.findByEmailContainingIgnoreCaseOrNicknameContainingIgnoreCase(keyword, keyword);
        } else {
            users = userRepository.findAll();
        }

        // 역할 필터링
        if (roleFilter != null && !roleFilter.equalsIgnoreCase("ALL")) {
            Role role = Role.valueOf(roleFilter.toUpperCase());
            users = users.stream()
                    .filter(u -> u.getRole() == role)
                    .collect(Collectors.toList());
        }

        return users.stream()
                .map(user -> {
                    // 사용자의 활성 구독 정보 조회
                    String subscriptionPlan = userSubscriptionRepository
                            .findByUserAndIsActive(user, true)
                            .map(subscription -> subscription.getSubscriptionPlan().getName())
                            .orElse("Free");
                    
                    return UserAdminDto.UserResponse.from(user, subscriptionPlan);
                })
                .collect(Collectors.toList());
    }

    public void deleteUser(Long id) {
        userRepository.deleteById(id);
    }

    public UserAdminDto.UserResponse updateUser(Long userId, UserAdminDto.UpdateRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));

        if (request.getNickname() != null) {
            user.setNickname(request.getNickname());
        }

        if (request.getRole() != null) {
            user.setRole(request.getRole());
        }

        return UserAdminDto.UserResponse.from(userRepository.save(user));
    }
}
