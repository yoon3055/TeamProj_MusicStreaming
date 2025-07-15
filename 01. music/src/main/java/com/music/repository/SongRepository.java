package com.music.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;
import com.music.entity.Song;


// @Repository 어노테이션은 이 인터페이스가 레파지토리임을 스프링에게 알려줍니다.
// JpaRepository<엔티티 타입, 엔티티의 ID 타입>을 상속받아 기본적인 CRUD 기능을 제공받습니다.
@Repository
public interface SongRepository extends JpaRepository<Song, Long> {

    // 곡 제목으로 곡을 조회하는 메서드
    // 제목은 중복될 수 있으므로 List를 반환합니다.
    List<Song> findByTitle(String title);

    // 특정 앨범에 속한 모든 곡을 조회하는 메서드
    List<Song> findByAlbumId(Long albumId);

    // 특정 아티스트의 모든 곡을 조회하는 메서드
    List<Song> findByArtistId(Long artistId);

    // 특정 장르에 속하는 모든 곡을 조회하는 메서드
    List<Song> findByGenre(String genre);

    // 제목에 특정 문자열을 포함하는 곡을 검색하는 메서드 (대소문자 구분 없이)
    List<Song> findByTitleContainingIgnoreCase(String title);

    // 특정 아티스트의 특정 장르 곡을 조회하는 메서드
    List<Song> findByArtistIdAndGenre(Long artistId, String genre);

    // 특정 앨범에 속하며 제목에 특정 문자열을 포함하는 곡을 조회하는 메서드
    List<Song> findByAlbumIdAndTitleContainingIgnoreCase(Long albumId, String title);
}
