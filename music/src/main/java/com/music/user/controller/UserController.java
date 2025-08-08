package com.music.user.controller;
import com.music.jwt.JwtUtil;
import com.music.user.dto.*;
import com.music.user.dto.PasswordChangeDto;
import com.music.user.entity.SocialType;
import com.music.user.entity.User;
import com.music.user.service.GoogleService;
import com.music.user.service.MailService;
import com.music.user.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import jakarta.servlet.http.HttpServletRequest;
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
@RequestMapping("/api/users")  // :흰색_확인_표시: 통일된 URL Prefix
public class UserController {
    @Autowired private UserService userService;
    @Autowired private JwtUtil jwtUtil;
    @Autowired private MailService mailService;
    private static final String SUCCESS = "success";
    private static final String FAIL = "fail";
    private static final String UNAUTHORIZED = "unauthorized";
    private static final String DELETED = "이미 삭제됨";
    private static final String NONE = "사용자 없음";
    private static final String PW_FAIL = "비밀번호 틀림";
    private static final String PRESENT = "이미 가입된 사용자";
    private static final String EXPIRED = "token expired";
    // :흰색_확인_표시: 회원가입
    @Operation(summary = "회원가입", description = "회원 정보 저장 (JWT 인증x)")
    @PostMapping("/register")
    public ResponseEntity<String> register(@RequestBody UserDto userDto) throws Exception {
        Map<String, Object> resultMap = userService.registUser(userDto);
        if (PRESENT.equals(resultMap.get("result"))) {
            return ResponseEntity.status(HttpStatus.NOT_ACCEPTABLE).body(PRESENT);
        }
        return ResponseEntity.status(HttpStatus.CREATED).body(SUCCESS);
    }
    // :흰색_확인_표시: 로그인
    @Operation(summary = "로그인", description = "이메일/비밀번호 기반 로그인 (JWT 인증x)")
    @PostMapping("/login")
    public ResponseEntity<Map<String, Object>> login(@RequestBody UserDto userDto) throws Exception {
        Map<String, Object> resultLogin = userService.login(userDto.getEmail(), userDto.getPassword());
        Map<String, Object> resultMap = new HashMap<>();
        if (FAIL.equals(resultLogin.get("type"))) {
            String result = (String) resultLogin.get("result");
            resultMap.put("result", result);
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(resultMap);
        }
        resultMap.put("jwt-auth-token", resultLogin.get("authToken"));
        resultMap.put("id", resultLogin.get("id"));
        resultMap.put("email", resultLogin.get("email"));
        resultMap.put("nickname", resultLogin.get("nickname"));
        resultMap.put("profileImage", resultLogin.get("profileImage"));
        resultMap.put("role", resultLogin.get("role"));
        resultMap.put("result", SUCCESS);
        return ResponseEntity.status(HttpStatus.ACCEPTED).body(resultMap);
    }
    // :흰색_확인_표시: 로그아웃
    @Operation(summary = "로그아웃", description = "토큰을 무효화합니다.")
    @PostMapping("/logout")
    public ResponseEntity<String> logout(@RequestAttribute("email") String email) {
        userService.logout(email);
        return ResponseEntity.ok(SUCCESS);
    }
    // :흰색_확인_표시: 비밀번호 찾기 (임시 발급)
    @Operation(summary = "비밀번호 찾기", description = "임시 비밀번호 이메일 전송 (JWT 인증x)")
    @PostMapping("/send-password")
    public ResponseEntity<String> sendTemporaryPassword(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        String tmpPw = userService.getTmpPw();
        String result = userService.updatePw(tmpPw, email);
        if (SUCCESS.equals(result)) {
            MailDto mailDto = mailService.createMail(tmpPw, email);
            mailService.sendMail(mailDto);
            return ResponseEntity.ok(SUCCESS);
        }
        return ResponseEntity.ok(FAIL);
    }
    // :흰색_확인_표시: 내 프로필 조회
    @Operation(summary = "내 정보 조회", description = "JWT 토큰 기반 사용자 정보 반환")
    @GetMapping("/me")
    public ResponseEntity<UserDto> getMyInfo(@RequestAttribute("email") String email) throws Exception {
        return ResponseEntity.ok(userService.getUser(email));
    }
    // :흰색_확인_표시: 닉네임 변경
    @Operation(summary = "닉네임 변경", description = "로그인한 사용자의 닉네임을 수정합니다.")
    @PutMapping("/nickname")
    public ResponseEntity<String> updateNickname(@RequestBody Map<String, String> request,
                                                 HttpServletRequest httpRequest) {
        String email = (String) httpRequest.getAttribute("email");
        String newNickname = request.get("nickname");
        if (newNickname == null || newNickname.isBlank()) {
            return ResponseEntity.badRequest().body("닉네임이 비어있습니다.");
        }
        String result = userService.updateNickname(newNickname, email);
        return result.equals(SUCCESS) ? ResponseEntity.ok(SUCCESS) : ResponseEntity.badRequest().body(result);
    }
    // :흰색_확인_표시: 프로필 전체 수정
    @Operation(summary = "회원 정보 수정", description = "이메일 기반 사용자 정보 수정")
    @PutMapping
    public ResponseEntity<String> updateUser(@RequestBody UserDto userDto,
                                             @RequestAttribute("email") String email) throws Exception {
        Map<String, Object> resultMap = userService.updateUser(userDto, email);
        return resultMap.get("result").equals(NONE)
                ? ResponseEntity.status(HttpStatus.NOT_ACCEPTABLE).body(NONE)
                : ResponseEntity.ok(SUCCESS);
    }
    // :흰색_확인_표시: 비밀번호 변경
    @Operation(summary = "비밀번호 변경", description = "기존 비밀번호 기반 변경")
    @PostMapping("/password")
    public ResponseEntity<Map<String, Object>> changePassword(
            @RequestBody PasswordChangeDto passwordChangeDto,
            @RequestAttribute("email") String email) {
        Map<String, Object> resultMap = userService.changePassword(passwordChangeDto, email);
        String result = (String) resultMap.get("result");
        if (SUCCESS.equals(result)) return ResponseEntity.ok(resultMap);
        if (NONE.equals(result)) return ResponseEntity.status(HttpStatus.NOT_FOUND).body(resultMap);
        return ResponseEntity.badRequest().body(resultMap);
    }
    // :흰색_확인_표시: 이메일 중복 확인
    @Operation(summary = "이메일 중복 확인", description = "가입된 이메일인지 확인 (JWT 인증x)")
    @GetMapping("/check-email")
    public ResponseEntity<String> checkEmail(@RequestParam String email) throws Exception {
        return userService.getUser(email) == null
                ? ResponseEntity.status(HttpStatus.ACCEPTED).body(NONE)
                : ResponseEntity.status(HttpStatus.NOT_ACCEPTABLE).body(PRESENT);
    }
    // :흰색_확인_표시: 닉네임으로 유저 검색
    @Operation(summary = "닉네임으로 검색", description = "특정 닉네임을 포함하는 사용자 목록 조회")
    @GetMapping("/search")
    public ResponseEntity<List<UserDto>> searchUser(@RequestParam String nickname) throws Exception {
        return ResponseEntity.ok(userService.searchUser(nickname));
    }
    // :흰색_확인_표시: 모든 유저 조회 (관리자용)
    @Operation(summary = "전체 유저 조회", description = "모든 사용자 정보를 반환합니다.")
    @GetMapping
    public ResponseEntity<List<UserDto>> getAllUsers() throws Exception {
        return ResponseEntity.ok(userService.getAllUser());
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