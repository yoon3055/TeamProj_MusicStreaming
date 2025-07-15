package com.music.repository;

import com.music.entity.SongLyrics;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

// @Repository 어노테이션은 이 인터페이스가 레파지토리임을 스프링에게 알려줍니다.
// JpaRepository<엔티티 타입, 엔티티의 ID 타입>을 상속받아 기본적인 CRUD 기능을 제공받습니다.
@Repository
public interface SongLyricsRepository extends JpaRepository<SongLyrics, Long> {

    // 특정 곡의 모든 가사를 조회하는 메서드
    List<SongLyrics> findBySongId(Long songId);

    // 특정 곡의 특정 언어 가사를 조회하는 메서드
    // 한 곡에 한 언어의 가사는 하나만 존재한다고 가정하고 Optional을 반환합니다.
    Optional<SongLyrics> findBySongIdAndLanguage(Long songId, String language);

    // 특정 언어의 모든 가사를 조회하는 메서드
    List<SongLyrics> findByLanguage(String language);

    // 특정 곡에 대해 특정 언어의 가사가 존재하는지 확인하는 메서드
    boolean existsBySongIdAndLanguage(Long songId, String language);
}
