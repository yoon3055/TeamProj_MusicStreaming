package com.music.follow.service;

import com.music.artist.entity.Artist;
import com.music.artist.repository.ArtistRepository;
import com.music.follow.dto.FollowDto.ArtistFollowRequest;
import com.music.follow.dto.FollowDto.ArtistFollowResponse;
import com.music.follow.entity.ArtistFollow;
import com.music.follow.repository.ArtistFollowRepository;
import com.music.user.entity.User;
import com.music.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class ArtistFollowService {

    private final ArtistFollowRepository followRepository;
    private final UserRepository userRepository;
    private final ArtistRepository artistRepository;

    /**
     * 유저 → 아티스트 팔로우 토글 (추가/해제)
     */
    public ArtistFollowResponse toggleFollow(ArtistFollowRequest request) {
        User user = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new RuntimeException("User not found"));

        Artist artist = artistRepository.findById(request.getArtistId())
                .orElseThrow(() -> new RuntimeException("Artist not found"));

        Optional<ArtistFollow> existing = followRepository.findByUserIdAndArtistId(user.getId(), artist.getId());

        if (existing.isPresent()) {
            followRepository.delete(existing.get());
            return null; // 언팔로우
        }

        LocalDateTime now = LocalDateTime.now();
        System.out.println("=== ArtistFollowService 디버깅 ===");
        System.out.println("followedAt 값: " + now);
        ArtistFollow follow = new ArtistFollow(user, artist, now);
        System.out.println("생성된 ArtistFollow의 followedAt: " + follow.getFollowedAt());
        followRepository.save(follow);

        return ArtistFollowResponse.from(follow);
    }

    /**
     * 아티스트 팔로워 수 조회
     */
    public long countFollowers(Long artistId) {
        return followRepository.countByArtistId(artistId);
    }
}
