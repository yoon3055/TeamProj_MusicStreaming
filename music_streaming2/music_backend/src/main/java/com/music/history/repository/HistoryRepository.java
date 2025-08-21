package com.music.history.repository;

import com.music.history.entity.History;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.time.LocalDateTime;
import org.springframework.data.domain.Pageable; // 페이징 처리를 위해 import

// @Repository 어노테이션은 이 인터페이스가 레파지토리임을 스프링에게 알려줍니다.
// JpaRepository<엔티티 타입, 엔티티의 ID 타입>을 상속받아 기본적인 CRUD 기능을 제공받습니다.
@Repository
public interface HistoryRepository extends JpaRepository<History, Long> {

    // 특정 사용자의 모든 재생 기록을 최신순으로 조회하는 메서드
    List<History> findByUserIdOrderByPlayedAtDesc(Long userId);

    // 특정 사용자가 가장 최근에 재생한 N개의 곡 기록을 조회하는 메서드 (페이징 사용)
    // 예를 들어, `Pageable pageable = PageRequest.of(0, 10);` (첫 10개) 와 같이 사용
    List<History> findByUserIdOrderByPlayedAtDesc(Long userId, Pageable pageable);

    // 특정 곡의 모든 재생 기록을 최신순으로 조회하는 메서드
    List<History> findBySongIdOrderByPlayedAtDesc(Long songId);

    // 특정 사용자가 특정 기간 내에 재생한 곡 기록을 조회하는 메서드
    List<History> findByUserIdAndPlayedAtBetween(Long userId, LocalDateTime startDateTime, LocalDateTime endDateTime);

    // 특정 사용자가 특정 곡을 재생한 기록이 있는지 확인하는 메서드
    boolean existsByUserIdAndSongId(Long userId, Long songId);

    // 특정 사용자가 특정 곡을 총 몇 번 재생했는지 횟수를 세는 메서드
    long countByUserIdAndSongId(Long userId, Long songId);
}