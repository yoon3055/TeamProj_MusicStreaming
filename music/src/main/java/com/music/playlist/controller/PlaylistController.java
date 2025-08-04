// src/main/java/com/music/playlist/controller/PlaylistController.java
package com.music.playlist.controller;

import com.music.playlist.dto.PlaylistDto;
import com.music.playlist.dto.PlaylistSongDto;
import com.music.playlist.service.PlaylistService;
import lombok.RequiredArgsConstructor;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/playlists")
@RequiredArgsConstructor
public class PlaylistController {
    private final PlaylistService playlistService;

    /** 1) 플레이리스트 생성 */
    @PostMapping
    public ResponseEntity<PlaylistDto.Response> create(
            @RequestAttribute String email,  // JWT에서 추출한 이메일
            @RequestBody PlaylistDto.Request req) {
        try {
            System.out.println("=== 플레이리스트 생성 디버깅 ===");
            System.out.println("JWT에서 추출한 이메일: " + email);
            System.out.println("요청 데이터 - 제목: " + req.getTitle() + ", 공개여부: " + req.isPublic());
            
            PlaylistDto.Response response = playlistService.createPlaylist(email, req);
            System.out.println("플레이리스트 생성 성공: " + response.getId());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            System.err.println("플레이리스트 생성 중 에러 발생: " + e.getMessage());
            e.printStackTrace();
            throw e;
        }
    }


    /** 2) 내 플레이리스트 목록 조회 */
    @GetMapping
    public ResponseEntity<List<PlaylistDto.SimpleResponse>> listMy(
            @RequestParam Long userId) {
        return ResponseEntity.ok(playlistService.listMyPlaylists(userId));
    }

    /** 3) 플레이리스트 상세 조회 */
    @GetMapping("/{id}")
    public ResponseEntity<PlaylistDto.Response> detail(
            @PathVariable Long id) {
        return ResponseEntity.ok(playlistService.getPlaylist(id));
    }

    /** 4) 플레이리스트 공개/비공개 상태 변경 */
    @PutMapping("/{id}/visibility")
    public ResponseEntity<PlaylistDto.Response> updateVisibility(
            @RequestAttribute String email,  // JWT에서 추출한 이메일
            @PathVariable Long id,
            @RequestBody PlaylistDto.VisibilityRequest req) {
        try {
            System.out.println("=== 플레이리스트 공개/비공개 변경 디버깅 ===");
            System.out.println("JWT에서 추출한 이메일: " + email);
            System.out.println("플레이리스트 ID: " + id + ", 새 공개상태: " + req.isPublic());
            
            PlaylistDto.Response response = playlistService.updateVisibility(id, email, req.isPublic());
            System.out.println("공개/비공개 변경 성공: " + response.getId());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            System.err.println("공개/비공개 변경 중 에러 발생: " + e.getMessage());
            e.printStackTrace();
            throw e;
        }
    }

    /** 5) 플레이리스트 수정 */
    @PutMapping("/{id}")
    public ResponseEntity<PlaylistDto.Response> update(
            @PathVariable Long id,
            @RequestBody PlaylistDto.Request req) {
        return ResponseEntity.ok(playlistService.updatePlaylist(id, req));
    }

    /** 6) 플레이리스트 삭제 */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(
            @PathVariable Long id) {
        playlistService.deletePlaylist(id);
        return ResponseEntity.noContent().build();
    }

    /** 6) 트랙 추가 */
    @PostMapping("/{id}/tracks")
    public ResponseEntity<Void> addTrack(
            @PathVariable("id") Long playlistId,
            @RequestBody PlaylistSongDto.Request req) {
        playlistService.addTrack(req);
        return ResponseEntity.ok().build();
    }

    /** 7) 트랙 목록 조회 */
    @GetMapping("/{id}/tracks")
    public ResponseEntity<List<PlaylistSongDto.Response>> listTracks(
            @PathVariable("id") Long playlistId) {
        return ResponseEntity.ok(playlistService.listTracks(playlistId));
    }

    /** 8) 트랙 삭제 */
    @DeleteMapping("/{playlistId}/tracks/{songId}")
    public ResponseEntity<Void> removeTrack(
            @PathVariable Long playlistId,
            @PathVariable Long songId) {
        playlistService.removeTrack(playlistId, songId);
        return ResponseEntity.noContent().build();
    }


    /* 10) 공개 플레이리스트 검색 */
    @GetMapping("/public")
    public ResponseEntity<Page<PlaylistDto.SimpleResponse>> searchPublic(
            @RequestParam String keyword,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        Pageable pageable = PageRequest.of(page, size);
        return ResponseEntity.ok(
                playlistService.searchPublic(keyword, pageable));
    }

    /* 11) 상세 + 조회수 증가 */
    @GetMapping("/{id}/detail")
    public ResponseEntity<PlaylistDto.Response> detailAndView(@PathVariable Long id) {
        return ResponseEntity.ok(playlistService.getPlaylistWithView(id));
    }

    /* 12) 좋아요 토글 */
    @PostMapping("/{id}/like")
    public ResponseEntity<Boolean> likeToggle(
            @PathVariable Long id,
            @RequestParam Long userId) {

        boolean nowLiked = playlistService.toggleLike(id, userId);
        return ResponseEntity.ok(nowLiked);   // true=like, false=unlike
    }

}
