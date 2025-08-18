package com.music.music.service;

import com.music.music.entity.Album;
import com.music.music.entity.AlbumLike;
import com.music.music.repository.AlbumLikeRepository;
import com.music.music.repository.AlbumRepository;
import com.music.user.entity.User;
import com.music.user.repository.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AlbumLikeService {

    private final AlbumLikeRepository likeRepo;
    private final AlbumRepository albumRepo;
    private final UserRepository userRepo;

    /**
     * ✅ 앨범 좋아요 토글
     */
    @Transactional
    public boolean toggleLike(Long userId, Long albumId) {
        Album album = albumRepo.findById(albumId)
                .orElseThrow(() -> new EntityNotFoundException("앨범 없음"));
        User user = userRepo.getReferenceById(userId);

        return likeRepo.findByUserAndAlbum(user, album)
                .map(like -> {
                    likeRepo.delete(like);
                    return false;
                })
                .orElseGet(() -> {
                    likeRepo.save(AlbumLike.builder()
                            .user(user)
                            .album(album)
                            .build());
                    return true;
                });
    }

    /**
     * ✅ 앨범 좋아요 수 조회
     */
    public long getLikeCount(Long albumId) {
        return likeRepo.countByAlbumId(albumId);
    }

    /**
     * ✅ 특정 사용자의 앨범 좋아요 여부
     */
    public boolean isLikedByUser(Long userId, Long albumId) {
        return likeRepo.existsByUserIdAndAlbumId(userId, albumId);
    }
}
