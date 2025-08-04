package com.music.playlist.repository;

import com.music.playlist.entity.Playlist;
import org.springframework.data.domain.Page;          // ★ 추가
import org.springframework.data.domain.Pageable;      // ★ 추가
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface PlaylistRepository extends JpaRepository<Playlist, Long> {

    /* 1) 특정 사용자의 모든 플레이리스트 */
    List<Playlist> findByUserId(Long userId);

    /* 2) 특정 사용자의 공개 플레이리스트 */
    List<Playlist> findByUserIdAndIsPublicTrue(Long userId);

    /* 3) 공개 플레이리스트 제목 검색 */
    List<Playlist> findByTitleContainingIgnoreCaseAndIsPublicTrue(String title);

    /* 4) 특정 사용자의 제목 검색 */
    List<Playlist> findByUserIdAndTitleContainingIgnoreCase(Long userId, String title);

    /* 5) 생성일 기간 검색 */
    List<Playlist> findByCreatedAtBetween(LocalDateTime startDateTime, LocalDateTime endDateTime);

    /* 6) 공개 플레이리스트 + 페이징 검색 */
    Page<Playlist> findByTitleContainingIgnoreCaseAndIsPublicTrue(String keyword, Pageable pageable);
}
