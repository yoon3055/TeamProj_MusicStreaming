package com.music.repository;

import com.music.entity.Like;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;
import java.time.LocalDateTime;

// @Repository 어노테이션은 이 인터페이스가 레파지토리임을 스프링에게 알려줍니다.
// JpaRepository<엔티티 타입, 엔티티의 ID 타입>을 상속받아 기본적인 CRUD 기능을 제공받습니다.
@Repository
public interface LikeRepository extends JpaRepository<Like, Long> {

    // 특정 사용자가 '좋아요'를 표시한 모든 곡을 조회하는 메서드
    List<Like> findByUserId(Long userId);

    // 특정 곡에 '좋아요'를 표시한 모든 사용자 기록을 조회하는 메서드
    List<Like> findBySongId(Long songId);

    // 특정 사용자가 특정 곡에 '좋아요'를 표시했는지 여부를 확인하는 메서드
    // user_id와 song_id 조합이 UNIQUE이므로 Optional을 반환합니다.
    Optional<Like> findByUserIdAndSongId(Long userId, Long songId);

    // 특정 사용자가 특정 곡에 '좋아요'를 표시했는지 boolean 값으로 확인하는 메서드
    boolean existsByUserIdAndSongId(Long userId, Long songId);

    // 특정 사용자가 '좋아요'를 표시한 곡의 수를 세는 메서드
    long countByUserId(Long userId);

    // 특정 곡에 '좋아요'를 표시한 총 횟수를 세는 메서드
    long countBySongId(Long songId);

    // 특정 사용자가 특정 기간 내에 '좋아요'를 표시한 곡들을 조회하는 메서드
    List<Like> findByUserIdAndLikedAtBetween(Long userId, LocalDateTime startDateTime, LocalDateTime endDateTime);
}
