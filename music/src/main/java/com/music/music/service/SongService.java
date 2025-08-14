package com.music.music.service;

import com.music.music.entity.Song;
import com.music.music.repository.SongRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
@org.springframework.stereotype.Component
public class SongService {

    private final SongRepository songRepository;

    /**
     * 모든 노래 목록 조회
     */
    public List<Song> getAllSongs() {
        log.debug("모든 노래 목록 조회 시작");
        List<Song> songs = songRepository.findAll();
        log.debug("노래 목록 조회 완료: {}개", songs.size());
        return songs;
    }

    /**
     * 페이지네이션된 노래 목록 조회
     */
    public Page<Song> getSongsPaged(Pageable pageable) {
        log.debug("페이지네이션된 노래 목록 조회 시작: page={}, size={}", 
                 pageable.getPageNumber(), pageable.getPageSize());
        Page<Song> songs = songRepository.findAll(pageable);
        log.debug("페이지네이션된 노래 목록 조회 완료: {}개", songs.getContent().size());
        return songs;
    }

    /**
     * ID로 노래 조회
     */
    public Song getSongById(Long id) {
        log.debug("노래 상세 조회 시작: songId={}", id);
        Song song = songRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("노래를 찾을 수 없습니다: " + id));
        log.debug("노래 상세 조회 완료: {}", song.getTitle());
        return song;
    }

    /**
     * 키워드로 노래 검색 (제목 또는 아티스트명)
     */
    public List<Song> searchSongs(String keyword) {
        log.debug("노래 검색 시작: keyword={}", keyword);
        List<Song> songs = songRepository.findByTitleContainingIgnoreCaseOrArtist_NameContainingIgnoreCase(
                keyword, keyword);
        log.debug("노래 검색 완료: {}개", songs.size());
        return songs;
    }

    /**
     * 아티스트별 노래 목록 조회
     */
    public List<Song> getSongsByArtist(String artist) {
        log.debug("아티스트별 노래 목록 조회 시작: artist={}", artist);
        List<Song> songs = songRepository.findByArtist_NameContainingIgnoreCase(artist);
        log.debug("아티스트별 노래 목록 조회 완료: {}개", songs.size());
        return songs;
    }

    /**
     * 장르별 노래 목록 조회
     */
    public List<Song> getSongsByGenre(String genre) {
        log.debug("장르별 노래 목록 조회 시작: genre={}", genre);
        List<Song> songs = songRepository.findByGenreContainingIgnoreCase(genre);
        log.debug("장르별 노래 목록 조회 완료: {}개", songs.size());
        return songs;
    }
}
