package com.music.follow.repository;

import com.music.follow.entity.ArtistFollow;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ArtistFollowRepository extends JpaRepository<ArtistFollow, Long> {
    long countByArtistId(Long artistId);

    Optional<ArtistFollow> findByUserIdAndArtistId(Long userId, Long artistId);

    boolean existsByUserIdAndArtistId(Long userId, Long artistId);
    
    List<ArtistFollow> findByUserId(Long userId);
    
    @Query("SELECT af FROM ArtistFollow af JOIN FETCH af.artist WHERE af.user.id = :userId")
    List<ArtistFollow> findByUserIdWithArtist(@Param("userId") Long userId);
}
