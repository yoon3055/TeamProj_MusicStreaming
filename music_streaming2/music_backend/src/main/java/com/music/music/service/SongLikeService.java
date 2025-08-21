package com.music.music.service;

import com.music.music.entity.Song;
import com.music.music.entity.SongLike;
import com.music.music.repository.SongLikeRepository;
import com.music.music.repository.SongRepository;
import com.music.user.entity.User;
import com.music.user.repository.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class SongLikeService {

    private final SongLikeRepository likeRepo;
    private final SongRepository songRepo;
    private final UserRepository userRepo;

    /**
     * 곡 좋아요 토글 (좋아요 → 해제 / 해제 → 좋아요)
     */
    @Transactional
    public boolean toggleLike(Long userId, Long songId) {
        User user = userRepo.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("User not found"));
        Song song = songRepo.findById(songId)
                .orElseThrow(() -> new EntityNotFoundException("Song not found"));

        return likeRepo.findByUserAndSong(user, song)
                .map(like -> {
                    likeRepo.delete(like);
                    return false; // 좋아요 해제됨
                })
                .orElseGet(() -> {
                    likeRepo.save(SongLike.builder().user(user).song(song).build());
                    return true; // 좋아요 추가됨
                });
    }

    /**
     * 곡의 총 좋아요 수 조회
     */
    @Transactional(readOnly = true)
    public long getLikeCount(Long songId) {
        Song song = songRepo.findById(songId)
                .orElseThrow(() -> new EntityNotFoundException("Song not found"));
        return likeRepo.countBySong(song);
    }

    /**
     * 사용자가 해당 곡을 좋아요 했는지 여부
     */
    @Transactional(readOnly = true)
    public boolean isLikedByUser(Long userId, Long songId) {
        User user = userRepo.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("User not found"));
        Song song = songRepo.findById(songId)
                .orElseThrow(() -> new EntityNotFoundException("Song not found"));
        return likeRepo.existsByUserAndSong(user, song);
    }
}
