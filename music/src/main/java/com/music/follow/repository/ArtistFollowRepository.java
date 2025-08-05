package com.music.follow.repository;

import com.music.follow.entity.ArtistFollow;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ArtistFollowRepository extends JpaRepository<ArtistFollow, Long> {
    long countByArtistId(Long artistId);

    Optional<ArtistFollow> findByUserIdAndArtistId(Long userId, Long artistId);

    boolean existsByUserIdAndArtistId(Long userId, Long artistId);
}
