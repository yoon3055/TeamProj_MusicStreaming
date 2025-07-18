package com.music.security;

import org.springframework.security.core.GrantedAuthority;

import java.io.Serializable;
import java.util.Collection;

public interface UserDetails extends Serializable {

    /**
     * 사용자의 권한 목록을 반환합니다.
     * User 클래스의 roles를 GrantedAuthority 컬렉션으로 변환하여 반환합니다.
     */
    Collection<? extends GrantedAuthority> getAuthorities();

    /**
     * 사용자의 비밀번호를 반환합니다.
     */
    String getPassword();

    /**
     * 사용자의 식별자를 반환합니다.
     * User 클래스에서는 email을 사용자 식별자로 사용합니다.
     */
    String getUsername();

    /**
     * 계정이 만료되지 않았는지를 반환합니다.
     * User 클래스에서는 항상 true를 반환합니다.
     */
    boolean isAccountNonExpired();

    /**
     * 계정이 잠기지 않았는지를 반환합니다.
     * User 클래스에서는 항상 true를 반환합니다.
     */
    boolean isAccountNonLocked();

    /**
     * 자격 증명(비밀번호)이 만료되지 않았는지를 반환합니다.
     * User 클래스에서는 항상 true를 반환합니다.
     */
    boolean isCredentialsNonExpired();

    /**
     * 계정이 활성화되어 있는지를 반환합니다.
     * User 클래스에서는 isVerified 필드값을 반환합니다.
     */
    boolean isEnabled();
}