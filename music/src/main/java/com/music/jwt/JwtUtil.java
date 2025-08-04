package com.music.jwt;

import io.jsonwebtoken.*;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import java.util.Date;
import java.util.Map;
import java.util.UUID;

// jwt 유틸 // jwt 토큰을 만드는것
@Component
@Slf4j
public class JwtUtil {

    // 시크릿 키
    @Value("${jwt.secret}")
    private String salt;

    // 토큰 만료 시간
    @Value("${jwt.expmin}")
    private Long expireMin;




    public String createAuthToken(String email) {
        return create(email, "authToken", expireMin);
    }





    // public String createRefreshToken() {
    //     // 인증 정보는 유지하지 않고, 유효 기간을 auth-token의 5배로 설정
    //     return create(null, "refreshToken", expireMin * 15);
    // }

    public String createRefreshToken(String email) {
        // 사용자 이메일을 포함하여 고유한 리프레시 토큰 생성
        return create(email, "refreshToken", expireMin * 15);
    }





    // 서브젝트 // 토큰 설명
    // 로그인 성공 시 사용자 정보를 기반으로 jwt 토큰을 생성해서 반환
    private String create(String email, String subject, long expireMin) {
        final JwtBuilder builder = Jwts.builder();

        // Header 설정
        builder.setSubject(subject).setExpiration(new Date(System.currentTimeMillis() + 1000 * 60 * expireMin));

        // 클레임 // 담는것
        // 담고 싶은 정보 설정
        if(email != null) {
            builder.claim("user", email);
            // 고유성을 보장하기 위해 추가 정보 포함
            builder.claim("iat", System.currentTimeMillis()); // 발급 시간
            builder.claim("jti", UUID.randomUUID().toString()); // 고유 토큰 ID
            builder.claim("emailHash", email.hashCode()); // 이메일 해시값
        }

        // signature - secret key를 이용한 암호화
        builder.signWith(SignatureAlgorithm.HS256, salt.getBytes());

        // 스트링 한줄로 만드는것
        // 마지막 직렬화 처리
        final String jwt = builder.compact();
        log.debug("토큰 발행 : {}", jwt);
        return jwt;
    }


    // 서명 확인 // 구조 확인 // 만료시간 확인

    // 셋 사이닝 키 // 서명 키를 설정하는것
    // 겟 바이트스 // 바이트 배열로 바꾸는것

    // 파스 // 해석하는것
    // 클레임스 // 토큰 정보 // 토큰 안에 들어있는 정보
    // Jwts // 외부라이브러리 클래스

    // 토큰 정보를 가져오는것
    // jwt 토큰을 분석해서 필요한 정보 반환
    public Map<String, Object>  checkAndGetClaims(final String jwt) {
        Jws<Claims> claims = Jwts.parser().setSigningKey(salt.getBytes()).parseClaimsJws(jwt);
        log.trace("claims : {}", claims);
        log.trace("salt : " + salt + " expireMin" + expireMin);
        log.trace("claims.getBody() : " + claims.getBody());
        return claims.getBody();
    }





}
