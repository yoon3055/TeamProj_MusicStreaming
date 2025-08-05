package com.music.artist.controller;

import com.music.artist.dto.ArtistDto;
import com.music.artist.service.ArtistService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/artists")
@RequiredArgsConstructor
public class ArtistController {

    private final ArtistService artistService;

    // ✅ 아티스트 생성
    @PostMapping
    public ResponseEntity<ArtistDto.Response> create(@RequestBody ArtistDto.Request request) {
        return ResponseEntity.ok(artistService.createArtist(request));
    }

    // ✅ 전체 조회
    @GetMapping
    public ResponseEntity<List<ArtistDto.Response>> getAll() {
        return ResponseEntity.ok(artistService.getAllArtists());
    }

    // ✅ 단건 조회
    @GetMapping("/{id}")
    public ResponseEntity<ArtistDto.Response> getOne(@PathVariable Long id) {
        return ResponseEntity.ok(artistService.getArtistById(id));
    }

    // ✅ 수정
    @PutMapping("/{id}")
    public ResponseEntity<ArtistDto.Response> update(@PathVariable Long id, @RequestBody ArtistDto.Request request) {
        return ResponseEntity.ok(artistService.updateArtist(id, request));
    }

    // ✅ 삭제
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        artistService.deleteArtist(id);
        return ResponseEntity.noContent().build();
    }

    // ✅ 좋아요 토글
    @PostMapping("/{id}/like")
    public ResponseEntity<Boolean> toggleLike(
            @PathVariable Long id,
            @RequestParam Long userId
    ) {
        boolean liked = artistService.toggleLike(userId, id);
        return ResponseEntity.ok(liked); // true = 좋아요 추가됨, false = 해제됨
    }

    // ✅ 좋아요 여부 확인
    @GetMapping("/{id}/like")
    public ResponseEntity<Boolean> isLiked(
            @PathVariable Long id,
            @RequestParam Long userId
    ) {
        boolean isLiked = artistService.isLikedByUser(userId, id);
        return ResponseEntity.ok(isLiked);
    }

    // ✅ 좋아요 수 조회
    @GetMapping("/{id}/like-count")
    public ResponseEntity<Long> getLikeCount(@PathVariable Long id) {
        long count = artistService.getLikeCount(id);
        return ResponseEntity.ok(count);
    }
}
