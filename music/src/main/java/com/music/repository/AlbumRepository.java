package com.music.repository;


import com.music.entity.Album;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

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
}
