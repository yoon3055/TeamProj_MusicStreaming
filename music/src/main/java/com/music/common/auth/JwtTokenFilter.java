//package com.music.common.auth;
//
//import io.jsonwebtoken.Claims;
//import io.jsonwebtoken.Jwts;
//import jakarta.servlet.*;
//import jakarta.servlet.http.HttpServletRequest;
//import jakarta.servlet.http.HttpServletResponse;
//
//import org.springframework.beans.factory.annotation.Autowired;
//import org.springframework.beans.factory.annotation.Value;
//import org.springframework.http.HttpStatus;
//import org.springframework.security.authentication.AuthenticationServiceException;
//import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
//import org.springframework.security.core.Authentication;
//import org.springframework.security.core.GrantedAuthority;
//import org.springframework.security.core.authority.SimpleGrantedAuthority;
//import org.springframework.security.core.context.SecurityContextHolder;
//import org.springframework.security.core.userdetails.User;
//import org.springframework.security.core.userdetails.UserDetails;
//import org.springframework.stereotype.Component;
//
//import java.io.IOException;
//import java.util.ArrayList;
//import java.util.List;
//
//// extends GenericFilter
//// extends OncePerRequestFilter // 나중에 이걸로 바꿔보기
//@Component
//public class JwtTokenFilter extends GenericFilter {
//
//    @Value("${jwt.secret}")
//    private String secretKey;
//
//    @Override
//    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain) throws IOException, ServletException {
//
//        HttpServletRequest httpServletRequest = (HttpServletRequest)request;
//        HttpServletResponse httpServletResponse = (HttpServletResponse)response;
//        String token = httpServletRequest.getHeader("Authorization");
//
//
//        try {
//
//            if(token !=null){
//                if(!token.substring(0, 7).equals("Bearer ")){
//                    throw new AuthenticationServiceException("Bearer 형식 아닙니다.");
//                }
//                String jwtToken = token.substring(7);
//
////            token 검증 및 claims(payload) 추출
//                Claims claims = Jwts.parserBuilder()
//                        .setSigningKey(secretKey)
//                        .build()
//                        .parseClaimsJws(jwtToken)
//                        .getBody();
//
//
////            Authentication객체 생성
//                List<GrantedAuthority> authorities = new ArrayList<>();
//                authorities.add(new SimpleGrantedAuthority("ROLE_" + claims.get("role")));
//                UserDetails userDetails = new User(claims.getSubject(), "", authorities);
//                Authentication authentication = new UsernamePasswordAuthenticationToken(userDetails, jwtToken, userDetails.getAuthorities());
//
//                // 시큐리티 컨텍스트 홀더 // 보안 정보를 저장하는것
//                // 겟 컨텍스트 // 보안 정보를 가져오는것
//                // 셋 어덴티케이션 // 보안정보를 저장하는것
//                SecurityContextHolder.getContext().setAuthentication(authentication);
//            }
//            chain.doFilter(request, response);
//
//
//        } catch (Exception e){
//            e.printStackTrace();
//            httpServletResponse.setStatus(HttpStatus.UNAUTHORIZED.value());
//            httpServletResponse.setContentType("application/json");
//            httpServletResponse.getWriter().write("invalid token");
//        }
//
//
//    }
//
//
//
//
//
//
//}