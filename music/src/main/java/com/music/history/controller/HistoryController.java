package com.music.history.controller;

import com.music.history.dto.HistoryDto;
import com.music.history.service.HistoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import jakarta.validation.Valid;
import java.net.URI;
import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/histories")
@RequiredArgsConstructor
public class HistoryController {
    private final HistoryService historyService;

    /** 1) 재생 기록 생성 */
    @PostMapping
    public ResponseEntity<HistoryDto.Response> recordPlay(
            @Valid @RequestBody HistoryDto.Request req) {

        HistoryDto.Response created = historyService.recordPlay(req);

        URI location = ServletUriComponentsBuilder.fromCurrentRequest()
                .path("/{id}")
                .buildAndExpand(created.getId())
                .toUri();

        return ResponseEntity.created(location).body(created);
    }

    /** 2) 사용자별 전체 재생 기록 */
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<HistoryDto.SimpleResponse>> listByUser(
            @PathVariable Long userId) {

        return ResponseEntity.ok(historyService.getHistoryByUser(userId));
    }

    /** 3) 사용자별 최근 N개 재생 기록 */
    @GetMapping("/user/{userId}/recent")
    public ResponseEntity<List<HistoryDto.SimpleResponse>> listRecentByUser(
            @PathVariable Long userId,
            @RequestParam(defaultValue = "10") int limit) {

        return ResponseEntity.ok(
                historyService.getRecentHistoryByUser(userId, limit));
    }

    /** 4) 곡별 전체 재생 기록 */
    @GetMapping("/song/{songId}")
    public ResponseEntity<List<HistoryDto.SimpleResponse>> listBySong(
            @PathVariable Long songId) {

        return ResponseEntity.ok(historyService.getHistoryBySong(songId));
    }

    /** 5) 사용자별 기간 내 재생 기록 */
    @GetMapping("/user/{userId}/between")
    public ResponseEntity<List<HistoryDto.SimpleResponse>> listByUserBetween(
            @PathVariable Long userId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME)
                LocalDateTime start,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME)
                LocalDateTime end) {

        return ResponseEntity.ok(
                historyService.getHistoryByUserBetween(userId, start, end));
    }
}
