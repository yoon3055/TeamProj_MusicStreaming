package com.music.user.controller;

import com.music.jwt.JwtUtil;
import com.music.user.dto.*;
import com.music.user.entity.SocialType;
import com.music.user.entity.User;
import com.music.user.service.GoogleService;
import com.music.user.service.MailService;
import com.music.user.service.UserService;

import io.swagger.v3.oas.annotations.Operation;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestAttribute;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/user")
public class UserController {


    private static final String SUCCESS = "success";
    private static final String FAIL = "fail";
    private static final String UNAUTHORIZED = "unauthorized";
    private static final String DELETED = "이미 삭제됨";
    private static final String NONE = "사용자 없음";
    private static final String PW_FAIL = "비밀번호 틀림";
    private static final String PRESENT = "이미 가입된 사용자";
    private static final String EXPIRED = "token expired";

    @Autowired
    private UserService userService;
    @Autowired
    private JwtUtil jwtUtil;
    // @Autowired
    // private ImageService imageService;
    @Autowired
    private MailService mailService;

    @Operation(summary = "회원가입", description = "회원 정보 저장 (JWT 인증x)")
    @PostMapping("/create")
    public ResponseEntity<String> regist(@RequestBody UserDto userDto) throws Exception {
        try {
            Map<String, Object> resultMap = userService.registUser(userDto);

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

        // 로그인
        @Operation(summary = "로그인", description = "회원 정보 저장 (JWT 인증x)")
        @PostMapping("/doLogin")
        public ResponseEntity<Map<String, Object>> login(@RequestBody UserDto userDto) throws Exception {
            Map<String, Object> resultMap = new HashMap<>();
            
            try {
                System.out.println("===== UserController 로그인 시작 =====");
                System.out.println("받은 이메일: [" + userDto.getEmail() + "]");
                System.out.println("받은 비밀번호 길이: " + (userDto.getPassword() != null ? userDto.getPassword().length() : "null"));
                
                Map<String, Object> resultLogin = userService.login(userDto.getEmail(), userDto.getPassword());

                // 로그인 실패
                if(resultLogin.get("type").equals(FAIL)) {
                    if(resultLogin.get("result").equals(NONE)) { // 사용자 없음
                        resultMap.put("result", NONE);
                    } else { // 비밀번호 틀림
                        resultMap.put("result", PW_FAIL);
                    }
                    return new ResponseEntity<Map<String, Object>>(resultMap, HttpStatus.UNAUTHORIZED);
                } else {
                    // 로그인 성공 - auth token만 사용
                    resultMap.put("jwt-auth-token", resultLogin.get("authToken"));
                    resultMap.put("id", resultLogin.get("id"));
                    resultMap.put("email", resultLogin.get("email"));
                    resultMap.put("nickname", resultLogin.get("nickname"));
                    resultMap.put("profileImage", resultLogin.get("profileImage"));
                    resultMap.put("role", resultLogin.get("role"));
                    resultMap.put("result", SUCCESS);

                    return new ResponseEntity<Map<String, Object>>(resultMap, HttpStatus.ACCEPTED);
                }
            } catch (Exception e) {
                System.err.println("===== 로그인 중 예외 발생 =====");
                System.err.println("에러 메시지: " + e.getMessage());
                e.printStackTrace();
                
                resultMap.put("result", "서버 오류");
                resultMap.put("error", e.getMessage());
                return new ResponseEntity<Map<String, Object>>(resultMap, HttpStatus.INTERNAL_SERVER_ERROR);
            }
        }

    // 로그아웃
    @Operation(summary = "로그아웃", description = "로그아웃하고 토큰 null로 변환")
    @PostMapping("/logout")
    public ResponseEntity<String> logout(@RequestAttribute String email) {
        try {
            // log.debug("logout : {}", email);
            userService.logout(email);
            return new ResponseEntity<String>(SUCCESS, HttpStatus.ACCEPTED);
        } catch (Exception e) {
            e.printStackTrace();
            return new ResponseEntity<>(FAIL, HttpStatus.OK);
        }
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

    // 비밀번호 수정
    @Operation(summary = "비밀번호 수정", description = "비밀번호 수정")
    @PostMapping("/pw_change")
    public ResponseEntity<String> updatePw(@RequestPart String pw, @RequestAttribute String email) {
        return new ResponseEntity<String>(userService.updatePw(pw, email), HttpStatus.OK);
    }

    // 닉네임 수정
    @Operation(summary = "닉네임 수정", description = "닉네임 수정")
    @PostMapping("/nickname_change")
    public ResponseEntity<String> updateNickname(@RequestBody Map<String, String> request, @RequestAttribute String email) {
        try {
            String newNickname = request.get("nickname");
            if (newNickname == null || newNickname.trim().isEmpty()) {
                return new ResponseEntity<String>("닉네임이 비어있습니다.", HttpStatus.BAD_REQUEST);
            }
            
            System.out.println("=== 닉네임 수정 요청 ===");
            System.out.println("이메일: " + email);
            System.out.println("새 닉네임: " + newNickname);
            
            String result = userService.updateNickname(newNickname, email);
            
            if (result.equals(SUCCESS)) {
                System.out.println("닉네임 수정 성공");
                return new ResponseEntity<String>(SUCCESS, HttpStatus.OK);
            } else {
                System.out.println("닉네임 수정 실패: " + result);
                return new ResponseEntity<String>(result, HttpStatus.BAD_REQUEST);
            }
        } catch (Exception e) {
            System.out.println("닉네임 수정 중 오류 발생: " + e.getMessage());
            e.printStackTrace();
            return new ResponseEntity<String>(FAIL, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // 프로필 수정
    @Operation(summary = "프로필 수정", description = "회원 정보 수정")
    @PostMapping
    public ResponseEntity<String> updateUser(@RequestBody UserDto userDto, @RequestAttribute String email) throws Exception {
        
        
        try {
            // 사용자가 입력한 정보를 서버에 저장하는것
            Map<String, Object> resultMap = userService.updateUser(userDto, email);


            if(resultMap.get("result").equals(NONE)) { // 존재하지 않는 사용자
                return new ResponseEntity<String>(NONE, HttpStatus.NOT_ACCEPTABLE);


            } else {
                return new ResponseEntity<String>(SUCCESS, HttpStatus.OK);
            }
        } catch (Exception e) {
            e.printStackTrace();
            return new ResponseEntity<String>(FAIL, HttpStatus.OK);
        }
    }

    // 전체 회원 조회
    @Operation(summary = "전체 회원 조회", description = "전체 회원 조회")
    @GetMapping("/get")
    public ResponseEntity<List<UserDto>> getAllUser() throws Exception {
        return new ResponseEntity<List<UserDto>>(userService.getAllUser(), HttpStatus.OK);
    }

    // email로 회원 조회
    @Operation(summary = "회원 조회", description = "email로 회원 단건 조회")
    @GetMapping()
    public ResponseEntity<UserDto> getUser(@RequestAttribute String email) throws Exception {
        try {
            System.out.println("=== 프로필 조회 디버깅 ===");
            System.out.println("요청된 이메일: " + email);
            
            UserDto userDto = userService.getUser(email);
            
            if (userDto == null) {
                System.out.println("사용자를 찾을 수 없음: " + email);
                return new ResponseEntity<>(HttpStatus.NOT_FOUND);
            }
            
            System.out.println("조회된 사용자: " + userDto.getEmail() + ", " + userDto.getNickname());
            System.out.println("사용자 역할: " + userDto.getRole());
            return new ResponseEntity<UserDto>(userDto, HttpStatus.OK);
            
        } catch (Exception e) {
            System.out.println("프로필 조회 중 오류 발생: " + e.getMessage());
            e.printStackTrace();
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // nickname으로 회원 조회
    @Operation(summary = "회원 조회", description = "nickname으로 단건 조회 (JWT 인증x)")
    @GetMapping("/search")
    public ResponseEntity<List<UserDto>> searchUser(@RequestParam String nickname) throws Exception {
        return new ResponseEntity<List<UserDto>>(userService.searchUser(nickname), HttpStatus.OK);
    }

    // email로 회원 조회
    @Operation(summary = "이메일 중복 검사", description = "email로 이메일 중복 검사")
    @GetMapping("/check")
    public ResponseEntity<String> checkEmail(@RequestParam String email) throws Exception {
        UserDto userDto = userService.getUser(email);
        // 기존에 가입된 사용자와 이메일 중복 검사
        if(userDto == null) {
            return new ResponseEntity<String>(NONE, HttpStatus.ACCEPTED);
        } else {
            return new ResponseEntity<String>(PRESENT, HttpStatus.NOT_ACCEPTABLE);
        }
    }

    // // 프로필 이미지를 파일로 업로드
    // @Operation(summary = "프로필 이미지 파일 업로드", description = "프로필 이미지를 파일로 업로드")
    // @PostMapping("/uploadFile")
    // public ResponseEntity<String> uploadFile(@RequestPart MultipartFile multipartFile, @RequestAttribute String email) throws Exception {
    //     try {
    //         String fileUrl = imageService.uploadImage(multipartFile, userService.getUser(email));
    //         if(fileUrl.equals(FAIL)) {
    //             return new ResponseEntity<String>(FAIL, HttpStatus.OK);
    //         } else {
    //             log.info("프로필 이미지 업로드 성공 -> url : " + fileUrl);
    //             return new ResponseEntity<String>(SUCCESS, HttpStatus.OK);
    //         }
    //     } catch (Exception e) {
    //         e.printStackTrace();
    //         return new ResponseEntity<String>(FAIL, HttpStatus.OK);
    //     }
    // }

    // // 프로필 이미지를 디폴트 이미지로 업로드
    // @Operation(summary = "프로필 이미지 디폴트 업로드", description = "프로필 이미지를 디폴트 이미지로 업로드")
    // @PostMapping("/uploadImage")
    // public ResponseEntity<String> uploadImage(@RequestPart String defaultImage, @RequestAttribute String email) throws Exception {
    //     try {
    //         String defaultImageNum = imageService.uploadDefaultImage(defaultImage, userService.getUser(email));
    //         if(defaultImageNum.equals(FAIL)) {
    //             return new ResponseEntity<String>(FAIL, HttpStatus.OK);
    //         } else {
    //             log.info("프로필 이미지 업로드 성공 -> num : " + defaultImageNum);
    //             return new ResponseEntity<String>(SUCCESS, HttpStatus.OK);
    //         }
    //     } catch(Exception e) {
    //         e.printStackTrace();
    //         return new ResponseEntity<String>(FAIL, HttpStatus.OK);
    //     }
    // }

    // // 프로필 이미지 삭제
    // @Operation(summary = "프로필 이미지 삭제", description = "프로필 이미지 삭제")
    // @DeleteMapping("/deleteImage")
    // public ResponseEntity<String> dropImage(@RequestAttribute String email) throws Exception {
    //     try {
    //         Long id = userService.getUser(email).getId();
    //         imageService.dropImage(id);
    //         log.info("{}의 프로필 이미지 삭제 성공", email);
    //         return new ResponseEntity<String>(SUCCESS, HttpStatus.OK);
    //     } catch(Exception e) {
    //         e.printStackTrace();
    //         return new ResponseEntity<String>(FAIL, HttpStatus.OK);
    //     }
    // }





























}
