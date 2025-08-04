package com.music.user.repository;

import com.music.user.entity.VerificationToken;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;
import java.time.LocalDateTime;

// @Repository 어노테이션은 이 인터페이스가 레파지토리임을 스프링에게 알려줍니다.
// JpaRepository<엔티티 타입, 엔티티의 ID 타입>
@Repository
public interface VerificationTokenRepository extends JpaRepository<VerificationToken, Long> {

    // 토큰 값으로 VerificationToken을 조회하는 메서드
    // token 필드는 UNIQUE 속성을 가지고 있으므로, Optional<VerificationToken>을 반환합니다.
    Optional<VerificationToken> findByToken(String token);

    // 특정 사용자 ID와 사용 여부(isUsed)로 토큰을 조회하는 메서드
    // 예를 들어, 특정 사용자의 아직 사용되지 않은(isUsed=false) 토큰을 찾을 때 유용합니다.
    Optional<VerificationToken> findByUserIdAndIsUsed(Long userId, boolean isUsed);

    // 특정 사용자의 가장 최근에 생성된, 아직 사용되지 않은 유효한 토큰을 찾는 경우
    // expiresAt을 기준으로 최신 토큰을 찾고, isUsed가 false이며, 만료되지 않은 토큰을 조회
    Optional<VerificationToken> findTopByUserIdAndIsUsedFalseAndExpiresAtAfterOrderByCreatedAtDesc(Long userId, LocalDateTime now);

    // 만료된 토큰을 삭제하기 위한 메서드 (벌크 삭제 등)
    void deleteByExpiresAtBefore(LocalDateTime now);
}
