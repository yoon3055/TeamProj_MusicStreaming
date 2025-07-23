package com.example.oauth.member.service;

import com.example.oauth.member.domain.User;
import com.example.oauth.member.domain.SocialType;
import com.example.oauth.member.dto.UserCreateDto;
import com.example.oauth.member.dto.UserLoginDto;
import com.example.oauth.member.repository.UserRepository;
import com.example.oauth.common.email.EmailService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

@Service
@Transactional
public class UserService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final EmailService emailService;
    private final Map<String, String> passwordResetTokens = new ConcurrentHashMap<>();

    public UserService(UserRepository userRepository, PasswordEncoder passwordEncoder, EmailService emailService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.emailService = emailService;
    }

    public User create(UserCreateDto userCreateDto){
        if (userRepository.findByEmail(userCreateDto.getEmail()).isPresent()) {
            throw new IllegalArgumentException("이미 존재하는 이메일입니다.");
        }
        if (userRepository.findByNickname(userCreateDto.getNickname()).isPresent()) {
            throw new IllegalArgumentException("이미 존재하는 닉네임입니다.");
        }

        User user = User.builder()
                .email(userCreateDto.getEmail())
                .password(passwordEncoder.encode(userCreateDto.getPassword()))
                .nickname(userCreateDto.getNickname())
                .build();
        userRepository.save(user);
        return user;
    }

    public User login(UserLoginDto userLoginDto){
        Optional<User> optMember = userRepository.findByEmail(userLoginDto.getEmail());
        if(!optMember.isPresent()){
            throw new IllegalArgumentException("email이 존재하지 않습니다.");
        }

        User user = optMember.get();

        if (user.getPassword() == null || user.getPassword().isEmpty()) {
            throw new IllegalArgumentException("소셜 로그인 회원입니다. 일반 로그인을 사용할 수 없습니다.");
        }

        if(!passwordEncoder.matches(userLoginDto.getPassword(), user.getPassword())){
            throw new IllegalArgumentException("password가 일치하지 않습니다.");
        }
        return user;
    }

    public User getMemberBySocialId(String socialId){
        return userRepository.findBySocialId(socialId).orElse(null);
    }

    public User createOauth(String socialId, String email, SocialType socialType){
        User user = User.builder()
                .email(email)
                .socialType(socialType)
                .socialId(socialId)
                .build();
        userRepository.save(user);
        return user;
    }

    public void deleteAccount(String email, String password) {
        User user = userRepository.findByEmail(email).orElseThrow(() -> new IllegalArgumentException("이메일이 존재하지 않습니다."));
        if (!passwordEncoder.matches(password, user.getPassword())) {
            throw new IllegalArgumentException("비밀번호가 일치하지 않습니다.");
        }
        user.setDeleted(true);
        userRepository.save(user);
    }

    public void resetPassword(String email, String token, String newPassword) {
        String savedToken = passwordResetTokens.get(email);
        if (savedToken == null || !savedToken.equals(token)) {
            throw new IllegalArgumentException("유효하지 않은 토큰입니다.");
        }
        User user = userRepository.findByEmail(email).orElseThrow(() -> new IllegalArgumentException("유저가 존재하지 않습니다."));
        user.setPassword(passwordEncoder.encode(newPassword));
        passwordResetTokens.remove(email);
        userRepository.save(user);
    }

    public void sendPasswordResetEmail(String email) {
        User user = userRepository.findByEmail(email).orElseThrow(() -> new IllegalArgumentException("해당 이메일로 가입된 사용자가 없습니다."));
        String token = UUID.randomUUID().toString();
        passwordResetTokens.put(email, token);

        String resetLink = "http://localhost:3000/reset-password?email=" + email + "&token=" + token;
        String message = "비밀번호를 재설정하려면 아래 링크를 클릭하세요:\n" + resetLink;

        emailService.sendEmail(email, "비밀번호 재설정", message);
    }

    public void registerUser(UserCreateDto userCreateDto) {
        // TODO Auto-generated method stub
        throw new UnsupportedOperationException("Unimplemented method 'registerUser'");
    }
}
