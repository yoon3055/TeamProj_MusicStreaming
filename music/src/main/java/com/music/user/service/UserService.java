package com.music.user.service;


import com.music.user.dto.UserCreateDto;
import com.music.user.dto.UserLoginDto;
import com.music.user.entity.SocialType;
import com.music.user.entity.User;
import com.music.user.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
@Transactional
public class UserService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public UserService(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public User create(UserCreateDto userCreateDto){
        User user = User.builder()
                .email(userCreateDto.getEmail())
                .password(passwordEncoder.encode(userCreateDto.getPassword()))
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
        if(!passwordEncoder.matches(userLoginDto.getPassword(), user.getPassword())){
            throw new IllegalArgumentException("password가 일치하지 않습니다.");
        }
        return user;
    }

    public User getMemberBySocialId(String socialId){
        User user = userRepository.findBySocialId(socialId).orElse(null);
        return user;
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
}
