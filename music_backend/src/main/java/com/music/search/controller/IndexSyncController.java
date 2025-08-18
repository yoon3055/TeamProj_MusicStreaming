package com.music.search.controller;

import com.music.search.service.IndexSyncService;
import io.swagger.v3.oas.annotations.Operation;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/indexes")
@RequiredArgsConstructor
public class IndexSyncController {

    private final IndexSyncService indexSyncService;

    @Operation(
        summary = "인덱스 동기화 요청",
        description = "Elasticsearch 또는 기타 인덱스 시스템과의 동기화를 수동으로 트리거합니다.\n\n" +
                      "`type`은 'song', 'album', 'artist' 등으로 지정하며,\n" +
                      "`id`는 해당 항목의 고유 ID입니다."
    )
    @PostMapping("/{type}/{id}/sync")
    public ResponseEntity<String> syncByTypeAndId(@PathVariable String type, @PathVariable Long id) {
        boolean success = indexSyncService.sync(type, id);
        return success
                ? ResponseEntity.ok("인덱스 동기화 완료: " + type + " ID=" + id)
                : ResponseEntity.badRequest().body("지원되지 않는 타입입니다: " + type);
    }
}
