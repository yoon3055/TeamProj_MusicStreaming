package com.music.search.controller;

import com.music.search.service.IndexSyncService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/search/index")
@RequiredArgsConstructor
public class IndexSyncController {

    private final IndexSyncService indexSyncService;

    @PostMapping("/sync/{type}/{id}")
    public ResponseEntity<String> syncByTypeAndId(@PathVariable String type, @PathVariable Long id) {
        boolean success = indexSyncService.sync(type, id);
        return success
                ? ResponseEntity.ok("인덱스 동기화 완료: " + type + " ID=" + id)
                : ResponseEntity.badRequest().body("지원되지 않는 타입입니다: " + type);
    }
}
