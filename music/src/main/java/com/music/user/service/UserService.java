package com.music.user.service;


import com.music.user.dto.PasswordUpdateDto;
import com.music.user.dto.UserCreateDto;
import com.music.user.dto.UserLoginDto;
import com.music.user.entity.SocialType;
import com.music.user.entity.User;
import com.music.user.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@Service
@Transactional
public class UserService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    private static final String SUCCESS = "success";
    private static final String FAIL = "fail";
    private static final String DELETED = "이미 삭제됨";
    private static final String NONE = "사용자 없음";
    private static final String PW_FAIL = "비밀번호 틀림";
    private static final String PRESENT = "이미 가입된 사용자";



    public UserService(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public User create(UserCreateDto userCreateDto){
        User user = User.builder()
                .email(userCreateDto.getEmail())
                .password(passwordEncoder.encode(userCreateDto.getPassword()))
                .nickname(userCreateDto.getNickname())
                .build();
        userRepository.save(user);
        return user;
    }

    // 회원가입
    @Transactional
    public Map<String, Object> create2(UserCreateDto userCreateDto) {
        // 데이터베이스에서 가져오는것
        Optional<User> user = userRepository.findByEmail(userCreateDto.getEmail());
        Map<String, Object> resultMap = new HashMap<>();

        // 유저가 존재하는것
        if(user.isPresent()) {
            System.out.println("regist : 이미 가입된 사용자");
            resultMap.put("result", PRESENT);
        } else { // 유저가 없는것
            System.out.println("===== registUser =====");
            userCreateDto.setPassword(passwordEncoder.encode(userCreateDto.getPassword())); // 비밀번호 암호화
            userRepository.save(userCreateDto.toEntity());
            resultMap.put("result", userCreateDto);
        }
        return resultMap;
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

    // 임시 비밀번호 생성
    public String getTmpPw() {
        char[] charSet = new char[] { '0', '1', '2', '3', '4', '5', '6', '7', '8', '9',
                'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N',
                'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'};
        String pw = "";

        // 문자 배열 길이의 값을 랜덤으로 10개 뽑아 조합
        int idx = 0;
        for(int i = 0; i < 10; i++) {
            idx = (int)(charSet.length * Math.random());
            pw += charSet[idx];
        }

        System.out.println("===== getTmpPw =====");
        return pw;
    }

    // 비밀번호 수정
    @Transactional
    public String updatePw(String pw, String email) {
        
        // 데이터베이스에서 찾는것
        Optional<User> user = userRepository.findByEmail(email);

        // 유저가 존재하는것
        if(user.isPresent()) {
            PasswordUpdateDto userDto = user.get().toDto();
            userDto.setPassword(passwordEncoder.encode(pw)); // 비밀번호 암호화
            userRepository.save(userDto.toEntity());
            return SUCCESS;


        } else { // 유저가 존재하지 않는것
            return NONE;
        }


    }
}
