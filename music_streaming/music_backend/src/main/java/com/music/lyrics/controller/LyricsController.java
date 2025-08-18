package com.music.lyrics.controller;

import com.music.lyrics.dto.LyricsDto;
import com.music.lyrics.service.LyricsService;
import io.swagger.v3.oas.annotations.Operation;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/lyrics")
@RequiredArgsConstructor
public class LyricsController {

    private final LyricsService lyricsService;

    @Operation(
        summary = "가사 저장",
        description = "곡 ID에 해당하는 새로운 가사를 저장합니다."
    )
    @PostMapping
    public ResponseEntity<LyricsDto.Response> create(@RequestBody LyricsDto.Request request) {
        return ResponseEntity.ok(lyricsService.createLyrics(request));
    }

    @Operation(
        summary = "가사 조회",
        description = "특정 곡의 ID를 기반으로 등록된 가사를 조회합니다."
    )
    @GetMapping("/{songId}")
    public ResponseEntity<LyricsDto.Response> read(@PathVariable("songId") Long songId) {
        return ResponseEntity.ok(lyricsService.getLyricsBySongId(songId));
    }

    @Operation(
        summary = "가사 수정",
        description = "특정 곡의 ID를 기반으로 기존 가사를 수정합니다."
    )
    @PutMapping("/{songId}")
    public ResponseEntity<LyricsDto.Response> update(@PathVariable("songId") Long songId,
                                                     @RequestBody LyricsDto.Request request) {
        return ResponseEntity.ok(lyricsService.updateLyrics(songId, request));
    }
}
