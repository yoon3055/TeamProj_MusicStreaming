package com.music.artist.repository;

import com.music.artist.entity.ArtistLike;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ArtistLikeRepository extends JpaRepository<ArtistLike, Long> {
    
    List<ArtistLike> findByUserId(Long userId);
    
    Optional<ArtistLike> findByUserIdAndArtistId(Long userId, Long artistId);
    
    boolean existsByUserIdAndArtistId(Long userId, Long artistId);
    
    long countByArtistId(Long artistId);
    
    @Query("SELECT al FROM ArtistLike al JOIN FETCH al.artist WHERE al.user.id = :userId")
    List<ArtistLike> findByUserIdWithArtist(@Param("userId") Long userId);
}
