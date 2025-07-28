package com.music.user.controller;

import com.music.common.auth.JwtTokenProvider;
import com.music.user.dto.*;
import com.music.user.entity.SocialType;
import com.music.user.entity.User;
import com.music.user.service.GoogleService;
import com.music.user.service.MailService;
import com.music.user.service.UserService;

import io.swagger.v3.oas.annotations.Operation;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/user")
public class UserController {
    private final UserService userService;
    private final JwtTokenProvider jwtTokenProvider;
    private final GoogleService googleService;
    private final MailService mailService;

    private static final String SUCCESS = "success";
    private static final String FAIL = "fail";
    private static final String UNAUTHORIZED = "unauthorized";
    private static final String DELETED = "이미 삭제됨";
    private static final String NONE = "사용자 없음";
    private static final String PW_FAIL = "비밀번호 틀림";
    private static final String PRESENT = "이미 가입된 사용자";
    private static final String EXPIRED = "token expired";

    public UserController(UserService userService,
                          JwtTokenProvider jwtTokenProvider,
                          GoogleService googleService,
                          MailService mailService) {  // 생성자 파라미터 추가
        this.userService = userService;
        this.jwtTokenProvider = jwtTokenProvider;
        this.googleService = googleService;
        this.mailService = mailService;  // 필드 초기화
    }


    // @PostMapping("/create")
    public ResponseEntity<?> userCreate(@RequestBody UserCreateDto userCreateDto){


        User user = userService.create(userCreateDto);
        return new ResponseEntity<>(user.getId(), HttpStatus.CREATED);


    }

    @PostMapping("/create")
    public ResponseEntity<?> userCreate2(@RequestBody UserCreateDto userCreateDto){

        try {
            // 중복 확인하는것
            Map<String, Object> resultMap = userService.create2(userCreateDto);
            if(resultMap.get("result").equals(PRESENT)) { // 이미 가입된 사용자
                return new ResponseEntity<String>(PRESENT, HttpStatus.NOT_ACCEPTABLE);
            } else { // 회원가입 성공
                return new ResponseEntity<String>(SUCCESS, HttpStatus.ACCEPTED);
            }
        } catch (Exception e) {
            e.printStackTrace();
            return new ResponseEntity<String>(FAIL, HttpStatus.OK);
        }
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

    // 비밀번호 찾기 (임시 비밀번호 발급 후 이메일 전송)
    @Operation(summary = "비밀번호 찾기", description = "임시 비밀번호 발급 후 이메일 전송 (JWT 인증x)")
    @PostMapping("/sendPw")
    public ResponseEntity<String> sendPwEmail(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        String tmpPw = userService.getTmpPw();
        String result = userService.updatePw(tmpPw, email);

        if(result.equals(SUCCESS)) {
            // 전송
            MailDto mailDto = mailService.createMail(tmpPw, email);
//            log.info("생성된 mailDto : {}", mailDto.getToAddress() + mailDto.getFromAddress() + mailDto.getTitle());
            mailService.sendMail(mailDto);

//            log.info("임시 비밀번호 전송 완료");
            return new ResponseEntity<String>(SUCCESS, HttpStatus.OK);
        } else {
            return new ResponseEntity<String>(FAIL, HttpStatus.OK);
        }
        
    }





























}

