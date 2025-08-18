package com.music.history.service;

import com.music.history.dto.HistoryDto;
import com.music.history.entity.History;
import com.music.history.repository.HistoryRepository;
import com.music.music.entity.Song;
import com.music.music.repository.SongRepository;
import com.music.user.entity.User;
import com.music.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class HistoryServiceImpl implements HistoryService {

    private final HistoryRepository historyRepository;
    private final SongRepository songRepository;
    private final UserRepository userRepository;

    @Override
    @Transactional
    public HistoryDto.Response recordPlay(HistoryDto.Request req) {
        // 1) User · Song 조회
        User user = userRepository.findById(req.getUserId())
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다: " + req.getUserId()));
        Song song = songRepository.findById(req.getSongId())
                .orElseThrow(() -> new IllegalArgumentException("곡을 찾을 수 없습니다: " + req.getSongId()));

        // 2) PlayedAt 기본값 처리
        LocalDateTime playedAt = req.getPlayedAt() != null
                ? req.getPlayedAt()
                : LocalDateTime.now();

        // 3) 엔티티 저장
        History entity = new History(user, song, playedAt);
        History saved = historyRepository.save(entity);

        // 4) DTO 변환
        return HistoryDto.Response.from(saved);
    }

    @Override
    public List<HistoryDto.SimpleResponse> getHistoryByUser(Long userId) {
        return historyRepository.findByUserIdOrderByPlayedAtDesc(userId)
                .stream()
                .map(HistoryDto.SimpleResponse::from)
                .collect(Collectors.toList());
    }

    @Override
    public List<HistoryDto.SimpleResponse> getRecentHistoryByUser(Long userId, int limit) {
        return historyRepository
                .findByUserIdOrderByPlayedAtDesc(userId, PageRequest.of(0, limit))
                .stream()
                .map(HistoryDto.SimpleResponse::from)
                .collect(Collectors.toList());
    }

    @Override
    public List<HistoryDto.SimpleResponse> getHistoryBySong(Long songId) {
        return historyRepository.findBySongIdOrderByPlayedAtDesc(songId)
                .stream()
                .map(HistoryDto.SimpleResponse::from)
                .collect(Collectors.toList());
    }

    @Override
    public List<HistoryDto.SimpleResponse> getHistoryByUserBetween(
            Long userId, LocalDateTime start, LocalDateTime end) {
        return historyRepository
                .findByUserIdAndPlayedAtBetween(userId, start, end)
                .stream()
                .map(HistoryDto.SimpleResponse::from)
                .collect(Collectors.toList());
    }
}
