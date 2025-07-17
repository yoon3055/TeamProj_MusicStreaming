package com.music.user.service;

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
    public void registerUser(SignupRequest request) {
        // 이메일 중복 검사
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("이미 사용 중인 이메일입니다.");
        }

        // 닉네임 중복 검사
        if (userRepository.existsByNickname(request.getNickname())) {
            throw new IllegalArgumentException("이미 사용 중인 닉네임입니다.");
        }

        // 비밀번호 암호화 및 저장
        User user = new User();
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setNickname(request.getNickname());
        user.setVerified(true); // 이메일 인증 생략 상태
        user.setCreatedAt(LocalDateTime.now());

        userRepository.save(user);
    }

    /**
     * 로그인 로직
     */
    public User login(LoginRequest request) {
        // 이메일로 사용자 조회
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 이메일입니다."));

        // 비밀번호 검증
        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new IllegalArgumentException("비밀번호가 일치하지 않습니다.");
        }

        //  isVerified 확인은 만들어야

        return user; // 콘트롤러에서 응답 메시지로 활용 가능 닉넴 등
    }

    // =============================================================================================

    // private final UswerDao dao;
    private final PasswordEncoder encoder;
    //	private final BCryptPasswordEncoder encoder;
    private final AuthenticationManager authenticationManager;

    private final JwtTokenUtil jwtTokenUtil;
    private final UserDetailsService userDetailsService;

    public HttpStatus checkIdDuplicate(String id) {
        isExistUserId(id);
        return HttpStatus.OK;
    }

    @Transactional
    public JoinResponse join(JoinRequest req) {

        saveMember(req);
        authenticate(req.getId(), req.getPwd());

        return new JoinResponse(req.getId());
    }

    private void saveMember(JoinRequest req) {
        // 아이디 중복 확인
        isExistUserId(req.getId());

        // 패스워드 일치 확인
        checkPwd(req.getPwd(), req.getCheckPwd());

        // 회원 정보 생성
        String encodedPwd = encoder.encode(req.getPwd());
        CreateMemberParam param = new CreateMemberParam(req, encodedPwd);

        Integer result = dao.createMember(param);
        if (result == 0) {
            throw new MemberException("회원 등록을 실패했습니다.", HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    public LoginResponse login(LoginRequest req) {
        authenticate(req.getId(), req.getPwd());

        final UserDetails userDetails = userDetailsService.loadUserByUsername(req.getId());
        final String token = jwtTokenUtil.generateToken(userDetails);

        System.out.println("인증 성공 토큰 출력 : " + token);
        System.out.println("아이디 출력 : " + req.getId());

        return new LoginResponse(token, req.getId());
    }

    private void authenticate(String id, String pwd) {
        try {
            authenticationManager.authenticate(new UsernamePasswordAuthenticationToken(id, pwd));
        } catch (DisabledException e) {
            throw new MemberException("인증되지 않은 아이디입니다.", HttpStatus.BAD_REQUEST);
        } catch (BadCredentialsException e) {
            throw new MemberException("비밀번호가 일치하지 않습니다.", HttpStatus.BAD_REQUEST);
        }
    }

    private void isExistUserId(String id) {
        Integer result = dao.isExistUserId(id);
        if (result == 1) {
            throw new MemberException("이미 사용중인 아이디입니다.", HttpStatus.BAD_REQUEST);
        }
    }

    private void checkPwd(String pwd, String checkPwd) {
        if (!pwd.equals(checkPwd)) {
            throw new MemberException("비밀번호가 일치하지 않습니다.", HttpStatus.BAD_REQUEST);
        }
    }
}
