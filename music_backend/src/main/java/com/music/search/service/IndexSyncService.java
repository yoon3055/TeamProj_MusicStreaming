package com.music.search.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Slf4j
@Service
public class IndexSyncService {

    public boolean sync(String type, Long id) {
        switch (type.toLowerCase()) {
            case "song":
                log.info("🎵 곡 인덱싱 요청: ID={}", id);
                // TODO: 검색 엔진 연동 로직 추가
                break;
            case "album":
                log.info("💿 앨범 인덱싱 요청: ID={}", id);
                // TODO: 검색 엔진 연동 로직 추가
                break;
            case "artist":
                log.info("🎤 아티스트 인덱싱 요청: ID={}", id);
                // TODO: 검색 엔진 연동 로직 추가
                break;
            default:
                log.warn("🚫 지원되지 않는 인덱스 타입: {}", type);
                return false;
        }

        return true;
    }
}
