package com.music.user.controller;

import com.music.common.auth.JwtTokenProvider;
import com.music.user.dto.*;
import com.music.user.entity.SocialType;
import com.music.user.entity.User;
import com.music.user.service.GoogleService;
import com.music.user.service.UserService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/user")
public class UserController {
    private final UserService userService;
    private final JwtTokenProvider jwtTokenProvider;
    private final GoogleService googleService;

    public UserController(UserService userService, JwtTokenProvider jwtTokenProvider, GoogleService googleService) {
        this.userService = userService;
        this.jwtTokenProvider = jwtTokenProvider;
        this.googleService = googleService;
    }

    @PostMapping("/create")
    public ResponseEntity<?> userCreate(@RequestBody UserCreateDto userCreateDto){
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
        return new ResponseEntity<>(loginInfo, HttpStatus.OK);
    }

    @PostMapping("/google/doLogin")
    public ResponseEntity<?> googleLogin(@RequestBody RedirectDto redirectDto){
//        accesstoken 발급
        AccessTokenDto accessTokenDto = googleService.getAccessToken(redirectDto.getCode());
//        사용자정보 얻기
        GoogleProfileDto googleProfileDto = googleService.getGoogleProfile(accessTokenDto.getAccess_token());
//        회원가입이 되어 있지 않다면 회원가입
        User originalUser = userService.getMemberBySocialId(googleProfileDto.getSub());
        if(originalUser == null){
            originalUser = userService.createOauth(googleProfileDto.getSub(), googleProfileDto.getEmail(), SocialType.GOOGLE);
        }
//        회원가입돼 있는 회원이라면 토큰발급
        String jwtToken = jwtTokenProvider.createToken(originalUser.getEmail(), originalUser.getRole().toString());

        Map<String, Object> loginInfo = new HashMap<>();
        loginInfo.put("id", originalUser.getId());
        loginInfo.put("token", jwtToken);
        return new ResponseEntity<>(loginInfo, HttpStatus.OK);
    }
}

