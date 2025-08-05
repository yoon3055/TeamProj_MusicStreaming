package com.music.music.repository;

import com.music.music.entity.Song;
import com.music.music.entity.SongLike;
import com.music.user.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface SongLikeRepository extends JpaRepository<SongLike, Long> {

    // 특정 유저가 특정 곡을 좋아요 했는지 여부
    Optional<SongLike> findByUserAndSong(User user, Song song);

    // 곡에 대한 좋아요 수
    Long countBySong(Song song);

    // 유저와 곡으로 좋아요 삭제
    void deleteByUserAndSong(User user, Song song);

    // 유저가 좋아요한 곡 존재 여부 (boolean)
    boolean existsByUserAndSong(User user, Song song);
}
