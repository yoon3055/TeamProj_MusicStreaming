package com.music.user.service;

import com.music.user.dto.UserDto;
import com.music.user.entity.User;
import com.music.jwt.JwtTokenUtil;
import com.music.user.repository.UserRepository;
import com.music.request.SignupRequest;
import com.music.request.LoginRequest;
import lombok.RequiredArgsConstructor;

import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.DisabledException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    /**
     * 회원가입 로직
     */
    @Transactional
    public UserDto.Response registerUser(UserDto.SignUpRequest requestDto) {
        // 이메일 중복 검사
        if (userRepository.existsByEmail(requestDto.getEmail())) {
            throw new IllegalArgumentException("이미 사용 중인 이메일입니다.");
        }

        // 닉네임 중복 검사
        if (userRepository.existsByNickname(requestDto.getNickname())) {
            throw new IllegalArgumentException("이미 사용 중인 닉네임입니다.");
        }

        // 비밀번호 암호화 및 User 엔티티 생성
        User user = User.builder()
                .email(requestDto.getEmail())
                .password(passwordEncoder.encode(requestDto.getPassword()))
                .nickname(requestDto.getNickname())
                .profileImage(requestDto.getProfileImage())
                .isVerified(true)
                .createdAt(LocalDateTime.now())
                .build();

        // 저장 후 Response DTO로 변환하여 반환
        return UserDto.Response.from(userRepository.save(user));
    }


    /**
     * 로그인 로직
     */
    @Transactional(readOnly = true)
    public UserDto.Response login(UserDto.LoginRequest requestDto) {
        User user = userRepository.findByEmail(requestDto.getEmail())
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 이메일입니다."));

        if (!passwordEncoder.matches(requestDto.getPassword(), user.getPassword())) {
            throw new IllegalArgumentException("비밀번호가 일치하지 않습니다.");
        }

        if (!user.isVerified()) {
            throw new IllegalArgumentException("이메일 인증이 필요합니다.");
        }

        return UserDto.Response.from(user);
    }

    // 추가적인 메서드들
    @Transactional
    public UserDto.Response updateUser(Long userId, UserDto.UpdateRequest requestDto) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));

        // 닉네임 변경 시 중복 체크
        if (requestDto.getNickname() != null &&
                !user.getNickname().equals(requestDto.getNickname()) &&
                userRepository.existsByNickname(requestDto.getNickname())) {
            throw new IllegalArgumentException("이미 사용 중인 닉네임입니다.");
        }

        // 필드 업데이트
        if (requestDto.getNickname() != null) {
            user.setNickname(requestDto.getNickname());
        }
        if (requestDto.getProfileImage() != null) {
            user.setProfileImage(requestDto.getProfileImage());
        }

        return UserDto.Response.from(user);
    }

    @Transactional(readOnly = true)
    public UserDto.Response getUserById(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));
        return UserDto.Response.from(user);
    }



    // =============================================================================================



}
