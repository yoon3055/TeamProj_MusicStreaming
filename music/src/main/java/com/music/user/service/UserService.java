package com.music.user.service;

import com.music.jwt.JwtUtil;
import com.music.user.dto.PasswordChangeDto;
import com.music.user.dto.PasswordUpdateDto;
import com.music.user.dto.UserCreateDto;
import com.music.user.dto.UserDto;
import com.music.user.dto.UserLoginDto;
import com.music.user.entity.Role;
import com.music.user.entity.SocialType;
import com.music.user.entity.User;
import com.music.user.repository.UserRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import  java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
@Transactional
public class UserService {

    private static final String SUCCESS = "success";
    private static final String FAIL = "fail";
    private static final String DELETED = "이미 삭제됨";
    private static final String NONE = "사용자 없음";
    private static final String PW_FAIL = "비밀번호 틀림";
    private static final String PRESENT = "이미 가입된 사용자";

    // @Value("${s3.url}")
    // private String bucketUrl;

    @Autowired
    private UserRepository userRepository;
    @Autowired
    private JwtUtil jwtUtil;
    @Autowired
    private PasswordEncoder passwordEncoder;
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

    // // 회원가입
    // @Transactional
    // public Map<String, Object> create2(UserCreateDto userCreateDto) {
    //     // 데이터베이스에서 가져오는것
    //     Optional<User> user = userRepository.findByEmail(userCreateDto.getEmail());
    //     Map<String, Object> resultMap = new HashMap<>();

    //     // 유저가 존재하는것
    //     if(user.isPresent()) {
    //         System.out.println("regist : 이미 가입된 사용자");
    //         resultMap.put("result", PRESENT);
    //     } else { // 유저가 없는것
    //         System.out.println("===== registUser =====");
    //         userCreateDto.setPassword(passwordEncoder.encode(userCreateDto.getPassword())); // 비밀번호 암호화
    //         userRepository.save(userCreateDto.toEntity());
    //         resultMap.put("result", userCreateDto);
    //     }
    //     return resultMap;
    // }

        // db 여러 작업을 묶는것
 // 회원가입
    @Transactional
    public Map<String, Object> registUser(UserDto userDto) {
        // 데이터베이스에서 유저를 가져오는것
        Optional<User> user = userRepository.findByEmail(userDto.getEmail());
        Map<String, Object> resultMap = new HashMap<>();
        // 유저가 있는것
        if(user.isPresent()) {
            System.out.println("regist : 이미 가입된 사용자");
            resultMap.put("result", PRESENT);
        // 유저가 없는것
        // 유저를 만들어주는것
        } else {
            System.out.println("===== registUser =====");
            userDto.setPassword(passwordEncoder.encode(userDto.getPassword())); // 비밀번호 암호화
            // admin@music.com으로 가입하면 ADMIN 역할 부여
            if ("admin@music.com".equals(userDto.getEmail())) {
                userDto.setRole(Role.ADMIN);
                System.out.println("관리자 계정으로 가입: " + userDto.getEmail());
            } else {
                userDto.setRole(Role.USER);
            }
            userRepository.save(userDto.toEntity());
            resultMap.put("result", userDto);
        }
        return resultMap;
    }



    // public User login(UserLoginDto userLoginDto){
    //     Optional<User> optMember = userRepository.findByEmail(userLoginDto.getEmail());
    //     if(!optMember.isPresent()){
    //         throw new IllegalArgumentException("email이 존재하지 않습니다.");
    //     }

    //     User user = optMember.get();
    //     if(!passwordEncoder.matches(userLoginDto.getPassword(), user.getPassword())){
    //         throw new IllegalArgumentException("password가 일치하지 않습니다.");
    //     }
    //     return user;
    // }

        // 로그인
        public Map<String, Object> login(String email, String pw) {

            // 디버깅을 위한 로그 추가
            System.out.println("===== 로그인 시도 =====");
            System.out.println("입력된 이메일: [" + email + "]");
            System.out.println("이메일 길이: " + email.length());
            System.out.println("입력된 비밀번호 길이: " + (pw != null ? pw.length() : "null"));

            // 데이터베이스에서 유저를 가져오는것
            Optional<User> user = userRepository.findByEmail(email);
    
            // 디버깅을 위한 로그 추가
            System.out.println("DB 조회 결과: " + (user.isPresent() ? "사용자 발견" : "사용자 없음"));
            if (user.isPresent()) {
                System.out.println("DB에서 찾은 이메일: [" + user.get().getEmail() + "]");
                System.out.println("DB 비밀번호 존재 여부: " + (user.get().getPassword() != null));
            }
    
            // 해당 email의 회원이 존재하며, 입력받은 비밀번호가 db에 저장된 비밀번호(암호화된)와 matches 되면 로그인
            Map<String, Object> result = new HashMap<>();
            if(user.isPresent()) {
                UserDto userDto = user.get().toDto();
    
                // 비밀번호가 일치하지 않는것
                if(!passwordEncoder.matches(pw, user.get().getPassword())) {
                    result.put("type", FAIL);
                    result.put("result", PW_FAIL);
                    System.out.println("login : 비밀번호 틀림");
                } else {
                    // 인증 성공 시 auth-token만 발급
                    System.out.println("===== 로그인 성공 =====");
                    String role = userDto.getRole().toString(); // Role enum을 String으로 변환
                    String authToken = jwtUtil.createAuthToken(email, role);
                    System.out.println("JWT 토큰에 포함된 역할: " + role);
                    
                    result.put("type", SUCCESS);
                    result.put("result", userDto);
                    result.put("authToken", authToken);
                    result.put("id", userDto.getId());
                    result.put("email", userDto.getEmail());
                    result.put("nickname", userDto.getNickname());
                    result.put("profileImage", userDto.getProfileImage());
                    result.put("role", userDto.getRole());
                }
            } else {
                result.put("type", FAIL);
                result.put("result", NONE);
                System.out.println("login : " + email + "에 해당하는 사용자 없음");
            }
            return result;
        }

            // 로그아웃
    @Transactional
    public void logout(String email) {
        System.out.println("===== logout =====");
        if(userRepository.findByEmail(email).isPresent()) {
            // saveRefreshToken(email, null);
        } else {
            System.out.println("logout : " + email + "에 해당하는 사용자 없음");
        }
    }

    // public User getMemberBySocialId(String socialId){
    //     User user = userRepository.findBySocialId(socialId).orElse(null);
    //     return user;
    // }

    // public User createOauth(String socialId, String email, SocialType socialType){
    //     User user = User.builder()
    //             .email(email)
    //             .socialType(socialType)
    //             .socialId(socialId)
    //             .build();
    //     userRepository.save(user);
    //     return user;
    // }

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
        if(userRepository.findByEmail(email).isPresent()) {
            System.out.println("===== updatePw =====");
            User user = userRepository.findByEmail(email).get();
            user.setPassword(passwordEncoder.encode(pw));
            userRepository.save(user);
            return SUCCESS;
        } else {
            System.out.println("updatePw : " + email + "에 해당하는 사용자 없음");
            return NONE;
        }
    }

    // 비밀번호 변경
    @Transactional
    public Map<String, Object> changePassword(PasswordChangeDto passwordChangeDto, String email) {
        Map<String, Object> resultMap = new HashMap<>();
        
        try {
            // 사용자 조회
            Optional<User> userOptional = userRepository.findByEmail(email);
            
            if (!userOptional.isPresent()) {
                resultMap.put("result", NONE);
                resultMap.put("message", "사용자를 찾을 수 없습니다.");
                return resultMap;
            }
            
            User user = userOptional.get();
            
            // 현재 비밀번호 확인
            if (!passwordEncoder.matches(passwordChangeDto.getCurrentPassword(), user.getPassword())) {
                resultMap.put("result", FAIL);
                resultMap.put("message", "현재 비밀번호가 일치하지 않습니다.");
                return resultMap;
            }
            
            // 새 비밀번호와 확인 비밀번호 일치 확인
            if (!passwordChangeDto.getNewPassword().equals(passwordChangeDto.getConfirmPassword())) {
                resultMap.put("result", FAIL);
                resultMap.put("message", "새 비밀번호와 확인 비밀번호가 일치하지 않습니다.");
                return resultMap;
            }
            
            // 새 비밀번호 암호화
            String encodedNewPassword = passwordEncoder.encode(passwordChangeDto.getNewPassword());
            
            // 비밀번호 업데이트
            user.setPassword(encodedNewPassword);
            userRepository.save(user);
            
            resultMap.put("result", SUCCESS);
            resultMap.put("message", "비밀번호가 성공적으로 변경되었습니다.");
            
        } catch (Exception e) {
            e.printStackTrace();
            resultMap.put("result", FAIL);
            resultMap.put("message", "비밀번호 변경 중 오류가 발생했습니다.");
        }
        
        return resultMap;
    }

    // 닉네임 수정
    public String updateNickname(String nickname, String email) {
        try {
            System.out.println("===== updateNickname 서비스 시작 =====");
            System.out.println("입력된 닉네임: " + nickname);
            System.out.println("입력된 이메일: " + email);
            
            if(userRepository.findByEmail(email).isPresent()) {
                System.out.println("===== updateNickname =====");
                User user = userRepository.findByEmail(email).get();
                System.out.println("사용자 찾음: " + user.getEmail());
                
                // 닉네임 중복 검사를 임시로 생략
                System.out.println("닉네임 중복 검사 생략 (테스트용)");
                
                user.setNickname(nickname);
                System.out.println("닉네임 설정 완료, 저장 시작");
                userRepository.save(user);
                System.out.println("닉네임 수정 완료: " + email + " -> " + nickname);
                return SUCCESS;
            } else {
                System.out.println("updateNickname : " + email + "에 해당하는 사용자 없음");
                return NONE;
            }
        } catch (Exception e) {
            System.out.println("updateNickname 서비스에서 예외 발생: " + e.getMessage());
            e.printStackTrace();
            return FAIL;
        }
    }

    // refreshToken 저장
    @Transactional
    public void saveRefreshToken(String email, String refreshToken) {

        // 데이터베이스에서 이메일로 유저를 가져오는것
        Optional<User> user = userRepository.findByEmail(email);

        // 유저가 있는것
        if(user.isPresent()) {
            System.out.println("===== saveRefreshToken =====");
            System.out.println("사용자 이메일: " + email);
            System.out.println("사용자 ID: " + user.get().getId());
            System.out.println("새로운 Refresh Token: " + refreshToken);
            System.out.println("기존 Refresh Token: " + user.get().getRefreshToken());
            
            UserDto userDto = user.get().toDto();
            userDto.setRefreshToken(refreshToken);
            User savedUser = userRepository.save(userDto.toEntity());
            
            System.out.println("저장 후 Refresh Token: " + savedUser.getRefreshToken());
            System.out.println("토큰 저장 완료 - 사용자: " + email);
       } else {
            System.out.println("saveRefreshToken : " + email + "에 해당하는 사용자 없음");
        }
    }

        // 프로필 수정
        @Transactional
        public Map<String, Object> updateUser(UserDto userDto, String email) {
    
            // 데이터베이스에 유저를 가져오는것
            Optional<User> user = userRepository.findByEmail(email);
            Map<String, Object> resultMap = new HashMap<>();
    
            // 유저가 있는것
            if(user.isPresent()) {
                System.out.println("===== updateUser =====");
                User existingUser = user.get();
    
                // 기존 사용자 정보를 유지하면서 필요한 필드만 업데이트
                if (userDto.getNickname() != null && !userDto.getNickname().trim().isEmpty()) {
                    existingUser.setNickname(userDto.getNickname());
                    System.out.println("닉네임 업데이트: " + userDto.getNickname());
                }
                
                if (userDto.getProfileImage() != null && !userDto.getProfileImage().trim().isEmpty()) {
                    existingUser.setProfileImage(userDto.getProfileImage());
                    System.out.println("프로필 이미지 업데이트 완료");
                }
    
                // 업데이트된 사용자 정보 저장
                User savedUser = userRepository.save(existingUser);
                
                resultMap.put("result", savedUser.toDto());
            } else {
                System.out.println("updateUser: " + email + "에 해당하는 사용자 없음");
                resultMap.put("result", NONE);
            }
            return resultMap;
        }

        
    // 회원 다건 조회
    public List<UserDto> getAllUser() {
        List<User> userList = userRepository.findAll();
        if(userList.size() > 0) {
            System.out.println("===== getAllUser =====");
            List<UserDto> userDtoList = new ArrayList<>();
            for(User u: userList) {
                UserDto userDto = u.toDto();

                // String image = userDto.getProfileImage();
                // if(image.length() < 3) {
                //     userDto.setProfileImage(image);
                // } else {
                //     userDto.setProfileImage(bucketUrl + "/" + image);
                // }

                userDtoList.add(userDto);
            }
            return userDtoList;
        } else  {
            System.out.println("getAllUser : 사용자 없음");
            return null;
        }
    }

        // email로 회원 단건 조회
        public UserDto getUser(String email) {
            if(userRepository.findByEmail(email).isPresent()) {
                System.out.println("===== getUser =====");
                UserDto userDto = userRepository.findByEmail(email).get().toDto();
    
                // String image = userDto.getProfileImage();
                // if(image.length() < 3) {
                //     userDto.setImage(image);
                // } else {
                //     userDto.setImage(bucketUrl + "/" + userDto.getImage());
                // }
    
                return userDto;
            } else {
                System.out.println("getUser : " + email + "에 해당하는 사용자 없음");
                return null;
            }
        }

            // 이름으로 회원 다건 조회
    public List<UserDto> searchUser(String nickname) {
        List<User> userList = userRepository.findByEmailContainingIgnoreCaseOrNicknameContainingIgnoreCase("", nickname);
        if(userList.size() > 0) {
            System.out.println("===== searchUser =====");
            List<UserDto> userDtoList = new ArrayList<>();
            for(User u: userList) {
                UserDto userDto = u.toDto();

                // String image = userDto.getProfileImage();
                // if(image.length() < 3) {
                //     userDto.setProfileImage(image);
                // } else {
                //     userDto.setProfileImage(bucketUrl + "/" + userDto.getProfileImage());
                // }

                userDtoList.add(userDto);
            }
            return userDtoList;
        } else {
            System.out.println("searchUser : " + nickname + "에 해당하는 사용자 없음");
            return null;
        }
    }
}
