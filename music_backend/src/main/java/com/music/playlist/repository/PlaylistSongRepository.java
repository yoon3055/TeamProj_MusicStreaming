package com.music.playlist.repository;

import com.music.playlist.entity.PlaylistSong;
import com.music.playlist.entity.PlaylistSongId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PlaylistSongRepository
        extends JpaRepository<PlaylistSong, PlaylistSongId> {

    /* 순서 asc 로 트랙 목록 */
    List<PlaylistSong> findByPlaylistIdOrderBySongOrderAsc(Long playlistId);

    /* 중복 체크 */
    boolean existsByPlaylistIdAndSongId(Long playlistId, Long songId);

    /* 트랙 한 곡 삭제 */
    void deleteByPlaylistIdAndSongId(Long playlistId, Long songId);
    
    /* 플레이리스트의 모든 트랙 삭제 */
    void deleteByPlaylistId(Long playlistId);
}
