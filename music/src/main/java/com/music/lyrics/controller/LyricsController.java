package com.music.lyrics.controller;

import com.music.lyrics.dto.LyricsDto;
import com.music.lyrics.service.LyricsService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/lyrics")
@RequiredArgsConstructor
public class LyricsController {

    private final LyricsService lyricsService;

    @PostMapping
    public ResponseEntity<LyricsDto.Response> create(@RequestBody LyricsDto.Request request) {
        return ResponseEntity.ok(lyricsService.createLyrics(request));
    }

    @GetMapping("/{songId}")
    public ResponseEntity<LyricsDto.Response> read(@PathVariable Long songId) {
        return ResponseEntity.ok(lyricsService.getLyricsBySongId(songId));
    }

    @PutMapping("/{songId}")
    public ResponseEntity<LyricsDto.Response> update(@PathVariable Long songId,
                                                     @RequestBody LyricsDto.Request request) {
        return ResponseEntity.ok(lyricsService.updateLyrics(songId, request));
    }
}
