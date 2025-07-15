package com.music.repository;

import com.music.entity.PlaylistSong;
import com.music.entity.PlaylistSongId;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

// @Repository 어노테이션은 이 인터페이스가 레파지토리임을 스프링에게 알려줍니다.
// JpaRepository<엔티티 타입, 복합 키 클래스 타입>을 상속받습니다.
@Repository
public interface PlaylistSongRepository extends JpaRepository<PlaylistSong, PlaylistSongId> {

    // 특정 플레이리스트에 속한 모든 곡들을 순서대로 조회하는 메서드
    // playlistId는 PlaylistSongId의 구성 요소이므로 직접 접근 가능합니다.
    List<PlaylistSong> findByPlaylistIdOrderByOrderAsc(Long playlistId);

    // 특정 플레이리스트에 특정 곡이 존재하는지 확인하는 메서드
    // 복합 키를 기반으로 존재 여부를 확인합니다.
    boolean existsByPlaylistIdAndSongId(Long playlistId, Long songId);

    // 특정 플레이리스트에서 특정 곡을 제거하기 위한 메서드
    // 복합 키를 기반으로 삭제 대상을 찾습니다.
    void deleteByPlaylistIdAndSongId(Long playlistId, Long songId);

    // 특정 플레이리스트에 있는 특정 순서의 곡을 조회 (Optional을 반환)
    Optional<PlaylistSong> findByPlaylistIdAndOrder(Long playlistId, Integer order);

    // 특정 곡이 포함된 모든 플레이리스트-곡 관계를 조회
    List<PlaylistSong> findBySongId(Long songId);
}