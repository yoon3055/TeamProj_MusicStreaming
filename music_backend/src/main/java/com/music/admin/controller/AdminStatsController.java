package com.music.admin.controller;

import com.music.admin.service.AdminStatsService;
import com.music.admin.dto.AdminStatsDto;
import io.swagger.v3.oas.annotations.Operation;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/admin")
public class AdminStatsController {

    private final AdminStatsService adminStatsService;

    @Operation(summary = "관리자 대시보드 통계", description = "관리자 대시보드에 필요한 모든 통계 정보를 조회합니다.")
    @GetMapping("/stats")
    public ResponseEntity<AdminStatsDto.StatsResponse> getStats() {
        return ResponseEntity.ok(adminStatsService.getStats());
    }
}
