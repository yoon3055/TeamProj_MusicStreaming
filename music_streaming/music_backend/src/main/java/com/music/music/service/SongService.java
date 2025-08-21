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

    /**
     * 아티스트 ID로 노래 목록 조회
     */
    public List<Song> getSongsByArtistId(Long artistId) {
        log.debug("아티스트 ID별 노래 목록 조회 시작: artistId={}", artistId);
        List<Song> songs = songRepository.findSongsByArtistId(artistId);
        log.debug("아티스트 ID별 노래 목록 조회 완료: {}개", songs.size());
        return songs;
    }

    /**
     * 최근 업로드된 노래 목록 조회 (ID 기준 최신순)
     */
    public List<Song> getRecentSongs(int days) {
        log.debug("최근 업로드된 노래 목록 조회 시작 (최신 {}개)", days * 3);
        // uploadDate 필드가 없으므로 ID 기준으로 최신 노래들을 조회
        List<Song> songs = songRepository.findAllByOrderByIdDesc();
        // 요청한 일수에 비례해서 노래 개수 제한 (일수 * 3개 정도)
        int limit = Math.min(days * 3, songs.size());
        List<Song> recentSongs = songs.subList(0, limit);
        log.debug("최근 노래 목록 조회 완료: {}개", recentSongs.size());
        return recentSongs;
    }
}
