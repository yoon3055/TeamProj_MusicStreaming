package com.music.music.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;

import com.music.music.entity.Song;


// @Repository 어노테이션은 이 인터페이스가 레파지토리임을 스프링에게 알려줍니다.
// JpaRepository<엔티티 타입, 엔티티의 ID 타입>을 상속받아 기본적인 CRUD 기능을 제공받습니다.
@Repository
public interface SongRepository extends JpaRepository<Song, Long> {

    // 곡 제목으로 곡을 조회하는 메서드
    // 제목은 중복될 수 있으므로 List를 반환합니다.
    List<Song> findByTitle(String title);

    // 특정 앨범에 속한 모든 곡을 조회하는 메서드 (현재 Song 엔티티에 albumId 필드가 없어 주석 처리)
    // List<Song> findByAlbumId(Long albumId);

    // 특정 아티스트의 모든 곡을 조회하는 메서드 (Artist 엔티티의 ID로 조회)
    List<Song> findByArtistId(Long artistId);
    
    // 특정 아티스트의 모든 곡을 조회하는 메서드 (Artist 객체로 조회) - 대안
    @Query("SELECT s FROM Song s WHERE s.artist.id = :artistId")
    List<Song> findSongsByArtistId(@Param("artistId") Long artistId);

    // 특정 장르에 속하는 모든 곡을 조회하는 메서드
    List<Song> findByGenre(String genre);

    // 제목에 특정 문자열을 포함하는 곡을 검색하는 메서드 (대소문자 구분 없이)
    List<Song> findByTitleContainingIgnoreCase(String title);

    // 아티스트명에 특정 문자열을 포함하는 곡을 검색하는 메서드 (대소문자 구분 없이)
    List<Song> findByArtist_NameContainingIgnoreCase(String artistName);

    // 장르에 특정 문자열을 포함하는 곡을 검색하는 메서드 (대소문자 구분 없이)
    List<Song> findByGenreContainingIgnoreCase(String genre);

    // 제목 또는 아티스트명에 특정 문자열을 포함하는 곡을 검색하는 메서드 (대소문자 구분 없이)
    List<Song> findByTitleContainingIgnoreCaseOrArtist_NameContainingIgnoreCase(String title, String artistName);

    // 특정 아티스트의 특정 장르 곡을 조회하는 메서드
    List<Song> findByArtistIdAndGenre(Long artistId, String genre);

    // 특정 앨범에 속하며 제목에 특정 문자열을 포함하는 곡을 조회하는 메서드 (현재 Song 엔티티에 albumId 필드가 없어 주석 처리)
    // List<Song> findByAlbumIdAndTitleContainingIgnoreCase(Long albumId, String title);

    // 모든 곡을 ID 기준 내림차순으로 조회하는 메서드 (createdAt 필드가 없어 id로 대체)
    List<Song> findAllByOrderByIdDesc();

    // 관리자 통계를 위한 메서드들
    @Query("SELECT s.genre, COUNT(s) FROM Song s WHERE s.genre IS NOT NULL GROUP BY s.genre")
    List<Object[]> countByGenreGroupBy();

    @Query("SELECT a.name, COUNT(s) FROM Song s JOIN s.artist a GROUP BY a.name ORDER BY COUNT(s) DESC LIMIT 7")
    List<Object[]> countByArtistGroupByTop7();

}
