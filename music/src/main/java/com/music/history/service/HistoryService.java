package com.music.history.service;

import com.music.history.dto.HistoryDto;
import java.time.LocalDateTime;
import java.util.List;

public interface HistoryService {

    /** 1) 재생 기록 남기기 */
    HistoryDto.Response recordPlay(HistoryDto.Request req);

    /** 2) 사용자별 전체 재생 기록 (최신순) */
    List<HistoryDto.SimpleResponse> getHistoryByUser(Long userId);

    /** 3) 사용자별 최근 N개 재생 기록 */
    List<HistoryDto.SimpleResponse> getRecentHistoryByUser(Long userId, int limit);

    /** 4) 곡별 전체 재생 기록 (최신순) */
    List<HistoryDto.SimpleResponse> getHistoryBySong(Long songId);

    /** 5) 사용자별 기간 내 재생 기록 */
    List<HistoryDto.SimpleResponse> getHistoryByUserBetween(
            Long userId, LocalDateTime start, LocalDateTime end);
}
