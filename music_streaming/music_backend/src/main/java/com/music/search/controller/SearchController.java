package com.music.search.controller;

import com.music.music.entity.Song;
import com.music.music.service.SongService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/search")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Search", description = "통합 검색 API")
public class SearchController {

    private final SongService songService;

    @GetMapping("")
    @Operation(summary = "음악 검색", description = "노래 제목이나 아티스트명으로 음악을 검색합니다.")
    public ResponseEntity<List<Song>> searchMusic(@RequestParam("q") String q) {
        try {
            log.info("=== [SEARCH_CONTROLLER] GET /api/search 요청 받음 ===");
            log.info("검색 키워드: {}", q);
            
            List<Song> songs = songService.searchSongs(q);
            log.info("검색 결과: {}개", songs.size());
            
            return ResponseEntity.ok(songs);
        } catch (Exception e) {
            log.error("음악 검색 중 오류 발생: keyword={}", q, e);
            throw e;
        }
    }
}
