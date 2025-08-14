package com.music.music.controller;

import com.music.music.entity.Song;
import com.music.music.service.SongService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/songs")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Song", description = "노래 관련 공개 API")
@org.springframework.stereotype.Component
public class SongController {

    private final SongService songService;

    @GetMapping("")
    @Operation(summary = "모든 노래 목록 조회", description = "플레이리스트 생성 등에 사용할 수 있는 모든 노래 목록을 조회합니다.")
    public ResponseEntity<List<Song>> getAllSongs() {
        try {
            log.info("=== [SONG_CONTROLLER] GET /api/songs 요청 받음 ===");
            List<Song> songs = songService.getAllSongs();
            log.info("노래 목록 조회 성공: {}개", songs.size());
            return ResponseEntity.ok(songs);
        } catch (Exception e) {
            log.error("노래 목록 조회 중 오류 발생", e);
            throw e;
        }
    }

    @GetMapping("/paged")
    @Operation(summary = "페이지네이션된 노래 목록 조회", description = "페이지 단위로 노래 목록을 조회합니다.")
    public ResponseEntity<Page<Song>> getSongsPaged(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        try {
            Pageable pageable = PageRequest.of(page, size);
            Page<Song> songs = songService.getSongsPaged(pageable);
            log.info("페이지네이션된 노래 목록 조회 성공: 페이지 {}, 크기 {}", page, size);
            return ResponseEntity.ok(songs);
        } catch (Exception e) {
            log.error("페이지네이션된 노래 목록 조회 중 오류 발생", e);
            throw e;
        }
    }

    @GetMapping("/{id}")
    @Operation(summary = "노래 상세 조회", description = "특정 노래의 상세 정보를 조회합니다.")
    public ResponseEntity<Song> getSongById(@PathVariable Long id) {
        try {
            Song song = songService.getSongById(id);
            return ResponseEntity.ok(song);
        } catch (Exception e) {
            log.error("노래 상세 조회 중 오류 발생: songId={}", id, e);
            throw e;
        }
    }

    @GetMapping("/search")
    @Operation(summary = "노래 검색", description = "제목이나 아티스트명으로 노래를 검색합니다.")
    public ResponseEntity<List<Song>> searchSongs(
            @RequestParam String keyword) {
        try {
            List<Song> songs = songService.searchSongs(keyword);
            log.info("노래 검색 성공: 키워드='{}', 결과 {}개", keyword, songs.size());
            return ResponseEntity.ok(songs);
        } catch (Exception e) {
            log.error("노래 검색 중 오류 발생: keyword={}", keyword, e);
            throw e;
        }
    }
}
