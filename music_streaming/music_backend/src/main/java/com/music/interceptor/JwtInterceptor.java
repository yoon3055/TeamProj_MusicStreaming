package com.music.interceptor;

import com.music.exception.AuthorizationException;
import com.music.jwt.JwtUtil;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import java.util.Map;
import java.util.StringTokenizer;

// jwt 인터셉터 // 사용자가 보낸 jwt 토큰을 확인하는것
@Component
@Slf4j
public class JwtInterceptor implements HandlerInterceptor {

    @Autowired
    private JwtUtil jwtUtil;


    // jwt 토큰을 확인하는것
    
    // 리퀘스트 // 사용자가 보내는것
    // 리스판스 // 서버가 보내는것
    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {
        log.info("JWT 인터셉터 호출");

        log.info("[요청 URI] : {}", request.getRequestURI());

        // 겟 메서드 // 요청 방식을 알아내는것

        // preflight를 위한 OPTIONS 요청은 그냥 전달
        if(request.getMethod().equals("OPTIONS")) {
            // 요청을 받는것
            return true;
        }

        // 인증이 필요없는 경로들 (로그인, 회원가입 등)
        String requestURI = request.getRequestURI();
        log.info("요청 URI 체크: [{}]", requestURI);
        
        // 아티스트 관련 API는 인증 없이 접근 가능
        if (requestURI.equals("/api/artists") || requestURI.startsWith("/api/artists/")) {
            log.info("아티스트 API 인증 예외: {}", requestURI);
            return true;
        }
        
        // 곡 조회 관련 API는 인증 없이 접근 가능 (랭킹차트용, 아티스트별 곡 목록 등)
        if (requestURI.equals("/api/songs") || 
            requestURI.equals("/api/songs/paged") ||
            requestURI.startsWith("/api/songs/search") ||
            requestURI.startsWith("/api/songs/by-artist/") ||
            (requestURI.startsWith("/api/songs/") && requestURI.contains("/likes/count")) ||
            (requestURI.startsWith("/api/songs/") && !requestURI.contains("/likes") && request.getMethod().equals("GET"))) {
            log.info("곡 조회 API 인증 예외: {}", requestURI);
            return true;
        }
        
        // 검색 API는 인증 없이 접근 가능
        if (requestURI.startsWith("/api/search")) {
            log.info("검색 API 인증 예외: {}", requestURI);
            return true;
        }
        
        if (requestURI.equals("/user/doLogin") || 
            requestURI.equals("/user/create") || 
            requestURI.equals("/user/check") ||
            requestURI.startsWith("/user/sendPwEmail")) {
            log.info("인증 예외 경로: {}", requestURI);
            return true;
        }

        /*
         
        // 요청 라인
        POST /api/user/info HTTP/1.1 
        // 요청 헤더
        Host: api.example.com 
        Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
        Content-Type: application/json

        // 요청 바디
        {
        "name": "홍길동"
        }


         
         */

        // request의 헤더에서 Authorization으로 넘어온 것을 찾음 (== jwt-auth-token)
        // 어더라이제이션 // 권한을 확인하는것

        String authorization = request.getHeader("Authorization");
        log.info("=== JWT 인터셉터 디버깅 ===");
log.info("Authorization 헤더: [{}]", authorization);

        if(authorization == null || authorization.trim().isEmpty()){
            // 반환값이 다른것
            // 예외가 발생하는것 // 진행 안되는것
            throw new AuthorizationException();
        }

        StringTokenizer st = new StringTokenizer(authorization);
        if (!st.hasMoreTokens()) {
            throw new AuthorizationException();
        }
        
        String bearer = st.nextToken();
        if (!"Bearer".equals(bearer)) {
            throw new AuthorizationException();
        }
        
        if (!st.hasMoreTokens()) {
            throw new RuntimeException("인증 토큰 없음");
        }
        
        String authToken = st.nextToken();
        log.debug("경로 : {}, 토큰 : {}", request.getServletPath(), authToken);

        // 유효한 토큰이면 진행, 그렇지 않으면 예외를 발생
        if(authToken != null && !authToken.trim().isEmpty()) {
            try {
                log.info("JWT 토큰 검증 시작: {}", authToken.substring(0, Math.min(20, authToken.length())) + "...");
                Map<String, Object> info = jwtUtil.checkAndGetClaims(authToken);
                log.info("JWT 토큰에서 추출한 정보: {}", info);
                
                Object info_email = info.get("user");
                String email = (String)info_email;
                log.info("추출된 이메일: {}", email);
                
                if (email == null || email.trim().isEmpty()) {
                    log.error("JWT 토큰에서 이메일을 찾을 수 없음");
                    throw new RuntimeException("토큰에 사용자 정보가 없습니다");
                }
                
                // 역할 정보 추출
                Object info_role = info.get("role");
                String role = (String)info_role;
                log.info("추출된 역할: {}", role);
                
                // 관리자 API 접근 권한 확인
                if (isAdminApi(requestURI)) {
                    if (!"ADMIN".equals(role)) {
                        log.error("관리자 권한 없음 - 이메일: {}, 역할: {}, 요청 URI: {}", email, role, requestURI);
                        throw new RuntimeException("관리자 권한이 필요합니다");
                    }
                    log.info("관리자 권한 확인 완료 - 이메일: {}", email);
                }
                
                request.setAttribute("email", email);
                request.setAttribute("role", role);
                log.info("JWT 인증 성공 - 이메일: {}, 역할: {}", email, role);

                // 요청 받는것이 되는것
                return true;
            } catch (Exception e) {
                log.error("JWT 토큰 파싱 오류: {}", e.getMessage());
                e.printStackTrace();
                throw new RuntimeException("유효하지 않은 토큰: " + e.getMessage());
            }
        } else {
            log.error("인증 토큰이 비어있음");
            throw new RuntimeException("인증 토큰 없음");
        }
    }

    /**
     * 관리자 API 경로인지 확인하는 메서드
     * @param requestURI 요청 URI
     * @return 관리자 API인 경우 true, 아니면 false
     */
    private boolean isAdminApi(String requestURI) {
        // 관리자 음악 업로드/관리 API 경로들
        return requestURI.startsWith("/api/admin/music/") || 
               requestURI.equals("/api/admin/music/upload") ||
               requestURI.equals("/api/admin/music/list") ||
               requestURI.startsWith("/api/admin/music/delete/");
    }
}
