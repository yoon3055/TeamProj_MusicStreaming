package com.music.interaction.controller;

import com.music.interaction.dto.CommentDto;
import com.music.interaction.dto.LikeDto;
import com.music.interaction.dto.ReportDto;
import com.music.interaction.service.InteractionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/interactions")
public class InteractionController {

    private final InteractionService interactionService;

    // ===== 📌 댓글(Comment) =====

    // 댓글 작성
    @PostMapping("/comments")
    public ResponseEntity<CommentDto.Response> addComment(@RequestBody CommentDto.Request request) {
        return ResponseEntity.ok(interactionService.addComment(request));
    }

    // 특정 곡의 댓글 목록 조회
    @GetMapping("/comments/{songId}")
    public ResponseEntity<List<CommentDto.SongCommentResponse>> getComments(@PathVariable Long songId) {
        return ResponseEntity.ok(interactionService.getCommentsBySong(songId));
    }

    // 댓글 수정
    @PutMapping("/comments/{commentId}")
    public ResponseEntity<CommentDto.Response> updateComment(
            @PathVariable Long commentId,
            @RequestBody CommentDto.UpdateRequest request
    ) {
        return ResponseEntity.ok(interactionService.updateComment(commentId, request));
    }

    // 댓글 삭제
    @DeleteMapping("/comments/{commentId}")
    public ResponseEntity<Void> deleteComment(@PathVariable Long commentId) {
        interactionService.deleteComment(commentId);
        return ResponseEntity.noContent().build();
    }

    // ===== ❤️ 좋아요(Like) =====

    // 좋아요 토글
    @PostMapping("/likes")
    public ResponseEntity<?> toggleLike(@RequestBody LikeDto.Request request) {
        LikeDto.Response response = interactionService.toggleLike(request);
        return (response == null)
                ? ResponseEntity.ok("좋아요 취소됨")
                : ResponseEntity.ok(response);
    }

    // 특정 곡의 좋아요한 사용자 목록
    @GetMapping("/likes/{songId}")
    public ResponseEntity<List<LikeDto.SimpleResponse>> getLikes(@PathVariable Long songId) {
        return ResponseEntity.ok(interactionService.getLikesBySong(songId));
    }

    // 곡 좋아요 수 조회
    @GetMapping("/likes/count/song/{songId}")
    public ResponseEntity<Long> countLikesBySong(@PathVariable Long songId) {
        return ResponseEntity.ok(interactionService.countLikesBySongId(songId));
    }

    // 앨범 좋아요 수 조회
    @GetMapping("/likes/count/album/{albumId}")
    public ResponseEntity<Long> countLikesByAlbum(@PathVariable Long albumId) {
        return ResponseEntity.ok(interactionService.countLikesByAlbumId(albumId));
    }

    // 아티스트 좋아요 수 조회
    @GetMapping("/likes/count/artist/{artistId}")
    public ResponseEntity<Long> countLikesByArtist(@PathVariable Long artistId) {
        return ResponseEntity.ok(interactionService.countLikesByArtistId(artistId));
    }
    
 // ===== 📈 좋아요 수 증가 (Admin or Internal Sync용) =====

    @PostMapping("/likes/count/{targetType}/{targetId}")
    public ResponseEntity<?> increaseLikeCount(
            @PathVariable String targetType,
            @PathVariable Long targetId
    ) {
        boolean success = interactionService.increaseLikeCount(targetType, targetId);
        return success
                ? ResponseEntity.ok("좋아요 수가 증가했습니다.")
                : ResponseEntity.badRequest().body("지원하지 않는 타입입니다.");
    }


    // ===== 🚨 신고(Report) =====

    // 신고 추가
    @PostMapping("/reports")
    public ResponseEntity<ReportDto.Response> addReport(@RequestBody ReportDto.Request request) {
        return ResponseEntity.ok(interactionService.addReport(request));
    }

    // 신고 목록 조회
    @GetMapping("/reports/{targetType}/{targetId}")
    public ResponseEntity<List<ReportDto.SimpleResponse>> getReports(
            @PathVariable String targetType,
            @PathVariable Long targetId
    ) {
        return ResponseEntity.ok(interactionService.getReportsByTarget(targetType, targetId));
    }
}
