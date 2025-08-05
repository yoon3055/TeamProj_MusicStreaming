package com.music.artist.controller;

import com.music.artist.dto.ArtistDto;
import com.music.artist.service.ArtistService;
import io.swagger.v3.oas.annotations.Operation;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/artists")
@RequiredArgsConstructor
public class ArtistController {

    private final ArtistService artistService;

    @Operation(summary = "아티스트 생성", description = "새로운 아티스트 정보를 등록합니다.")
    @PostMapping
    public ResponseEntity<ArtistDto.Response> create(@RequestBody ArtistDto.Request request) {
        return ResponseEntity.ok(artistService.createArtist(request));
    }

    @Operation(summary = "전체 아티스트 조회", description = "모든 아티스트 목록을 조회합니다.")
    @GetMapping
    public ResponseEntity<List<ArtistDto.Response>> getAll() {
        return ResponseEntity.ok(artistService.getAllArtists());
    }

    @Operation(summary = "단일 아티스트 조회", description = "ID로 특정 아티스트의 상세 정보를 조회합니다.")
    @GetMapping("/{id}")
    public ResponseEntity<ArtistDto.Response> getOne(@PathVariable Long id) {
        return ResponseEntity.ok(artistService.getArtistById(id));
    }

    @Operation(summary = "아티스트 정보 수정", description = "아티스트 정보를 수정합니다.")
    @PutMapping("/{id}")
    public ResponseEntity<ArtistDto.Response> update(@PathVariable Long id, @RequestBody ArtistDto.Request request) {
        return ResponseEntity.ok(artistService.updateArtist(id, request));
    }

    @Operation(summary = "아티스트 삭제", description = "ID로 특정 아티스트를 삭제합니다.")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        artistService.deleteArtist(id);
        return ResponseEntity.noContent().build();
    }

    @Operation(summary = "아티스트 좋아요 토글", description = "사용자가 아티스트를 좋아요/좋아요 해제를 수행합니다.")
    @PostMapping("/{id}/like")
    public ResponseEntity<Boolean> toggleLike(
            @PathVariable Long id,
            @RequestParam Long userId
    ) {
        boolean liked = artistService.toggleLike(userId, id);
        return ResponseEntity.ok(liked); // true = 좋아요 추가됨, false = 해제됨
    }

    @Operation(summary = "아티스트 좋아요 여부 확인", description = "해당 사용자가 특정 아티스트를 좋아요했는지 확인합니다.")
    @GetMapping("/{id}/like")
    public ResponseEntity<Boolean> isLiked(
            @PathVariable Long id,
            @RequestParam Long userId
    ) {
        boolean isLiked = artistService.isLikedByUser(userId, id);
        return ResponseEntity.ok(isLiked);
    }

    @Operation(summary = "아티스트 좋아요 수 조회", description = "특정 아티스트의 총 좋아요 수를 조회합니다.")
    @GetMapping("/{id}/like-count")
    public ResponseEntity<Long> getLikeCount(@PathVariable Long id) {
        long count = artistService.getLikeCount(id);
        return ResponseEntity.ok(count);
    }
}
