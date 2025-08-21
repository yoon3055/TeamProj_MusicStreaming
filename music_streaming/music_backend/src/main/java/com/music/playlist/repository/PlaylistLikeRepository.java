package com.music.playlist.repository;

import com.music.playlist.entity.PlaylistLike;
import com.music.playlist.entity.PlaylistLikeId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PlaylistLikeRepository
        extends JpaRepository<PlaylistLike, PlaylistLikeId> {

    /* 좋아요 개수 집계용 - 이것만 커스텀 메서드로 남깁니다 */
    long countById_PlaylistId(Long playlistId);
    
    /* 플레이리스트의 모든 좋아요 삭제 */
    void deleteByPlaylistId(Long playlistId);
}
