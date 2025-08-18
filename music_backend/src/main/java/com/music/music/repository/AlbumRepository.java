package com.music.music.repository;


import com.music.music.entity.Album;
import com.music.artist.entity.Artist;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface AlbumRepository extends JpaRepository<Album, Long> {

    // 앨범 제목으로 검색
    List<Album> findByTitleContainingIgnoreCase(String title);

    // 특정 아티스트의 앨범 검색
    List<Album> findByArtistId(Long artistId);

    // 특정 발매일 이후의 앨범 검색
    List<Album> findByReleaseDateAfter(LocalDate date);

    // 특정 발매일 이전의 앨범 검색
    List<Album> findByReleaseDateBefore(LocalDate date);

    // 앨범 제목과 아티스트 ID로 검색
    List<Album> findByTitleContainingIgnoreCaseAndArtistId(String title, Long artistId);
    
    // 앨범 제목과 아티스트로 검색 (업로드용)
    Optional<Album> findByTitleAndArtist(String title, Artist artist);
}
