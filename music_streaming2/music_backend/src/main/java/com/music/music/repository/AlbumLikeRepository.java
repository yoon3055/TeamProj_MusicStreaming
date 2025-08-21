package com.music.music.repository;

import com.music.music.entity.Album;
import com.music.music.entity.AlbumLike;
import com.music.user.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface AlbumLikeRepository extends JpaRepository<AlbumLike, Long> {

    Optional<AlbumLike> findByUserAndAlbum(User user, Album album);

    long countByAlbumId(Long albumId);

    boolean existsByUserIdAndAlbumId(Long userId, Long albumId);
}
