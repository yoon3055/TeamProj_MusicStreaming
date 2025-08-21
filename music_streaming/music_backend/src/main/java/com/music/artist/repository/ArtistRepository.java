package com.music.artist.repository;

import com.music.artist.entity.Artist;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ArtistRepository extends JpaRepository<Artist, Long> {
    Optional<Artist> findByName(String name);
    boolean existsByName(String name);
    Optional<Artist> findFirstByName(String name);
}


