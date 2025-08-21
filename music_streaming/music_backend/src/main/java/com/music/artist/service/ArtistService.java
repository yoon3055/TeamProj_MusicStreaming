package com.music.artist.service;

import com.music.artist.dto.ArtistDto;
import com.music.artist.entity.Artist;
import com.music.artist.entity.ArtistLike;
import com.music.artist.repository.ArtistRepository;
import com.music.artist.repository.ArtistLikeRepository;
import com.music.user.entity.User;
import com.music.user.repository.UserRepository;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ArtistService {

    private final ArtistRepository artistRepository;
    private final ArtistLikeRepository artistLikeRepository;
    private final UserRepository userRepository;

    // ✅ 아티스트 생성
    public ArtistDto.Response createArtist(ArtistDto.Request request) {
        Artist artist = Artist.builder()
                .name(request.getName())
                .profileImage(request.getProfileImage())
                .genre(request.getGenre())
                .description(request.getDescription())
                .createdAt(LocalDateTime.now())
                .build();
        artistRepository.save(artist);
        return ArtistDto.Response.from(artist);
    }

    // ✅ 전체 아티스트 조회
    public List<ArtistDto.Response> getAllArtists() {
        return artistRepository.findAll().stream()
                .map(ArtistDto.Response::from)
                .collect(Collectors.toList());
    }

    // ✅ ID로 아티스트 조회
    public ArtistDto.Response getArtistById(Long id) {
        Artist artist = artistRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Artist not found"));
        return ArtistDto.Response.from(artist);
    }

    // ✅ 아티스트 정보 수정
    public ArtistDto.Response updateArtist(Long id, ArtistDto.Request request) {
        Artist artist = artistRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Artist not found"));

        artist.setName(request.getName());
        artist.setProfileImage(request.getProfileImage());
        artist.setGenre(request.getGenre());
        artist.setDescription(request.getDescription());

        return ArtistDto.Response.from(artist);
    }

    // ✅ 아티스트 삭제
    public void deleteArtist(Long id) {
        artistRepository.deleteById(id);
    }

    // ✅ 좋아요 토글
    @Transactional
    public boolean toggleLike(Long userId, Long artistId) {
        Artist artist = artistRepository.findById(artistId)
                .orElseThrow(() -> new RuntimeException("Artist not found"));
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        return artistLikeRepository.findByUserIdAndArtistId(userId, artistId)
                .map(existing -> {
                    artistLikeRepository.delete(existing);
                    artist.setLikeCount(artist.getLikeCount() - 1);
                    return false; // 좋아요 해제됨
                })
                .orElseGet(() -> {
                    ArtistLike artistLike = ArtistLike.builder()
                            .user(user)
                            .artist(artist)
                            .createdAt(LocalDateTime.now())
                            .build();
                    artistLikeRepository.save(artistLike);
                    artist.setLikeCount(artist.getLikeCount() + 1);
                    return true; // 좋아요 추가됨
                });
    }

    // ✅ 유저가 해당 아티스트 좋아요했는지 확인
    public boolean isLikedByUser(Long userId, Long artistId) {
        return artistLikeRepository.existsByUserIdAndArtistId(userId, artistId);
    }

    // ✅ 아티스트 좋아요 수 조회
    public long getLikeCount(Long artistId) {
        return artistLikeRepository.countByArtistId(artistId);
    }
}
