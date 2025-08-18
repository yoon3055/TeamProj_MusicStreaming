package com.music.history.controller;

import com.music.history.dto.HistoryDto;
import com.music.history.service.HistoryService;
import io.swagger.v3.oas.annotations.Operation;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.net.URI;
import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/histories")
@RequiredArgsConstructor
public class HistoryController {

    private final HistoryService historyService;

    @Operation(
        summary = "재생 기록 생성",
        description = "곡을 재생한 정보를 기록합니다. 사용자 ID, 곡 ID 등의 정보를 입력해야 합니다."
    )
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

    @Operation(
        summary = "사용자별 전체 재생 기록 조회",
        description = "특정 사용자의 전체 곡 재생 기록을 조회합니다."
    )
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<HistoryDto.SimpleResponse>> listByUser(
            @PathVariable Long userId) {
        return ResponseEntity.ok(historyService.getHistoryByUser(userId));
    }

    @Operation(
        summary = "사용자별 최근 재생 기록 조회",
        description = "특정 사용자의 최근 N개의 곡 재생 기록을 조회합니다."
    )
    @GetMapping("/user/{userId}/recent")
    public ResponseEntity<List<HistoryDto.SimpleResponse>> listRecentByUser(
            @PathVariable Long userId,
            @RequestParam(defaultValue = "10") int limit) {
        return ResponseEntity.ok(historyService.getRecentHistoryByUser(userId, limit));
    }

    @Operation(
        summary = "곡별 전체 재생 기록 조회",
        description = "특정 곡의 전체 재생 기록을 조회합니다."
    )
    @GetMapping("/song/{songId}")
    public ResponseEntity<List<HistoryDto.SimpleResponse>> listBySong(
            @PathVariable Long songId) {
        return ResponseEntity.ok(historyService.getHistoryBySong(songId));
    }

    @Operation(
        summary = "사용자별 기간 내 재생 기록 조회",
        description = "특정 사용자의 일정 기간 내 곡 재생 기록을 조회합니다."
    )
    @GetMapping("/user/{userId}/between")
    public ResponseEntity<List<HistoryDto.SimpleResponse>> listByUserBetween(
            @PathVariable Long userId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime start,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime end) {
        return ResponseEntity.ok(historyService.getHistoryByUserBetween(userId, start, end));
    }
}
