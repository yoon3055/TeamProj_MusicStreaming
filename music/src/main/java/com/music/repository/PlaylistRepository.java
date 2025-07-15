package com.music.repository;



import com.music.entity.Playlist;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;
import java.time.LocalDateTime;

// @Repository 어노테이션은 이 인터페이스가 레파지토리임을 스프링에게 알려줍니다.
// JpaRepository<엔티티 타입, 엔티티의 ID 타입>을 상속받아 기본적인 CRUD 기능을 제공받습니다.
@Repository
public interface PlaylistRepository extends JpaRepository<Playlist, Long> {

    // 특정 사용자가 생성한 모든 재생목록을 조회하는 메서드
    List<Playlist> findByUserId(Long userId);

    // 특정 사용자가 생성한 재생목록 중 공개(isPublic = true) 상태인 재생목록을 조회하는 메서드
    List<Playlist> findByUserIdAndIsPublicTrue(Long userId);

    // 제목에 특정 문자열을 포함하는 공개(isPublic = true) 재생목록을 검색하는 메서드 (대소문자 구분 없이)
    List<Playlist> findByTitleContainingIgnoreCaseAndIsPublicTrue(String title);

    // 특정 사용자가 생성한 재생목록 중 제목에 특정 문자열을 포함하는 재생목록을 검색하는 메서드 (대소문자 구분 없이)
    List<Playlist> findByUserIdAndTitleContainingIgnoreCase(Long userId, String title);

    // 생성일 기준으로 특정 기간 내에 생성된 재생목록을 조회하는 메서드
    List<Playlist> findByCreatedAtBetween(LocalDateTime startDateTime, LocalDateTime endDateTime);
}