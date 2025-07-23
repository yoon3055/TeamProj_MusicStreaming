package com.example.oauth.member.controller;

import com.example.oauth.common.auth.JwtTokenProvider;
import com.example.oauth.member.domain.User;
import com.example.oauth.member.domain.SocialType;
import com.example.oauth.member.dto.*;
import com.example.oauth.member.service.GoogleService;
import com.example.oauth.member.service.KakaoService;
import com.example.oauth.member.service.UserService;

import jakarta.validation.Valid;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/member")
public class UserController {
    private final UserService userService;
    private final JwtTokenProvider jwtTokenProvider;
//    private final GoogleService googleService;
//    private final KakaoService kakaoService;


    @PostMapping("/password/request")
    public ResponseEntity<?> requestPasswordReset(@RequestBody PasswordResetRequestDto dto) {
        userService.sendPasswordResetEmail(dto.getEmail());
        return ResponseEntity.ok("재설정 링크가 이메일로 전송되었습니다.");
    }

    @PostMapping("/password/reset")
    public ResponseEntity<?> resetPassword(@RequestBody PasswordResetDto dto) {
        userService.resetPassword(dto.getEmail(), dto.getToken(), dto.getNewPassword());
        return ResponseEntity.ok("비밀번호가 재설정되었습니다.");
    }

    @PostMapping("/delete")
    public ResponseEntity<?> deleteAccount(@RequestBody DeleteAccountDto dto) {
        userService.deleteAccount(dto.getEmail(), dto.getPassword());
        return ResponseEntity.ok("회원탈퇴 완료");
    }


    public UserController(UserService userService, JwtTokenProvider jwtTokenProvider) {
        this.userService = userService;
        this.jwtTokenProvider = jwtTokenProvider;
    }

//    public UserController(UserService userService, JwtTokenProvider jwtTokenProvider, GoogleService googleService, KakaoService kakaoService) {
//        this.userService = userService;
//        this.jwtTokenProvider = jwtTokenProvider;
//        this.googleService = googleService;
//        this.kakaoService = kakaoService;
//    }

    @PostMapping("/create")
    public ResponseEntity<?> memberCreate(@RequestBody @Valid UserCreateDto userCreateDto){
        User user = userService.create(userCreateDto);
        return new ResponseEntity<>(user.getId(), HttpStatus.CREATED);
    }

    @PostMapping("/doLogin")
    public ResponseEntity<?> doLogin(@RequestBody UserLoginDto userLoginDto){
//        email, password 일치한지 검증
        User user = userService.login(userLoginDto);

//        일치할 경우 jwt accesstoken 생성
        String jwtToken = jwtTokenProvider.createToken(user.getEmail(), user.getRole().toString());

        Map<String, Object> loginInfo = new HashMap<>();
        loginInfo.put("id", user.getId());
        loginInfo.put("token", jwtToken);
        loginInfo.put("nickname", user.getNickname());  // 추가
        loginInfo.put("role", user.getRole());          

        return new ResponseEntity<>(loginInfo, HttpStatus.OK);
    }

//    @PostMapping("/google/doLogin")
//    public ResponseEntity<?> googleLogin(@RequestBody RedirectDto redirectDto){
////        accesstoken 발급
//        AccessTokenDto accessTokenDto = googleService.getAccessToken(redirectDto.getCode());
////        사용자정보 얻기
//        GoogleProfileDto googleProfileDto = googleService.getGoogleProfile(accessTokenDto.getAccess_token());
////        회원가입이 되어 있지 않다면 회원가입
//        User originalUser = userService.getMemberBySocialId(googleProfileDto.getSub());
//        if(originalUser == null){
//            originalUser = userService.createOauth(googleProfileDto.getSub(), googleProfileDto.getEmail(), SocialType.GOOGLE);
//        }
////        회원가입돼 있는 회원이라면 토큰발급
//        String jwtToken = jwtTokenProvider.createToken(originalUser.getEmail(), originalUser.getRole().toString());
//
//        Map<String, Object> loginInfo = new HashMap<>();
//        loginInfo.put("id", originalUser.getId());
//        loginInfo.put("token", jwtToken);
//        loginInfo.put("nickname", originalUser.getNickname());  // 추가
//        loginInfo.put("role", originalUser.getRole());          // 추가
//
//        return new ResponseEntity<>(loginInfo, HttpStatus.OK);
//    }


//    @PostMapping("/kakao/doLogin")
//    public ResponseEntity<?> kakaoLogin(@RequestBody RedirectDto redirectDto){
//        AccessTokenDto accessTokenDto = kakaoService.getAccessToken(redirectDto.getCode());
//        KakaoProfileDto kakaoProfileDto  = kakaoService.getKakaoProfile(accessTokenDto.getAccess_token());
//        User originalUser = userService.getMemberBySocialId(kakaoProfileDto.getId());
//        if(originalUser == null){
//            originalUser = userService.createOauth(kakaoProfileDto.getId(), kakaoProfileDto.getKakao_account().getEmail(), SocialType.KAKAO);
//        }
//        String jwtToken = jwtTokenProvider.createToken(originalUser.getEmail(), originalUser.getRole().toString());
//
//        Map<String, Object> loginInfo = new HashMap<>();
//        loginInfo.put("id", originalUser.getId());
//        loginInfo.put("token", jwtToken);
//        loginInfo.put("nickname", originalUser.getNickname());  // 추가
//        loginInfo.put("role", originalUser.getRole());          // 추가
//        return new ResponseEntity<>(loginInfo, HttpStatus.OK);
//    }
}








