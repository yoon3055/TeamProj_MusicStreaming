package com.music.interaction.controller;

import com.music.interaction.dto.CommentDto;
import com.music.interaction.dto.LikeDto;
import com.music.interaction.dto.ReportDto;
import com.music.interaction.service.InteractionService;
import io.swagger.v3.oas.annotations.Operation;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
public class InteractionController {

    private final InteractionService interactionService;

    // ===== 댓글 =====

    @Operation(summary = "댓글 작성", description = "곡에 대한 댓글을 작성합니다.")
    @PostMapping("/api/songs/{songId}/comments")
    public ResponseEntity<CommentDto.Response> addComment(
            @PathVariable Long songId,
            @RequestBody CommentDto.Request request) {
        request.setSongId(songId);
        return ResponseEntity.ok(interactionService.addComment(request));
    }

    @Operation(summary = "댓글 목록 조회", description = "특정 곡에 달린 모든 댓글을 조회합니다.")
    @GetMapping("/api/songs/{songId}/comments")
    public ResponseEntity<List<CommentDto.SongCommentResponse>> getComments(@PathVariable Long songId) {
        return ResponseEntity.ok(interactionService.getCommentsBySong(songId));
    }

    @Operation(summary = "댓글 수정", description = "특정 댓글의 내용을 수정합니다.")
    @PutMapping("/api/comments/{commentId}")
    public ResponseEntity<CommentDto.Response> updateComment(
            @PathVariable Long commentId,
            @RequestBody CommentDto.UpdateRequest request) {
        return ResponseEntity.ok(interactionService.updateComment(commentId, request));
    }

    @Operation(summary = "댓글 삭제", description = "특정 댓글을 삭제합니다.")
    @DeleteMapping("/api/comments/{commentId}")
    public ResponseEntity<Void> deleteComment(@PathVariable Long commentId) {
        interactionService.deleteComment(commentId);
        return ResponseEntity.noContent().build();
    }

    // ===== 좋아요 =====

    @Operation(summary = "좋아요 토글", description = "좋아요를 추가하거나 취소합니다.")
    @PostMapping("/api/likes")
    public ResponseEntity<?> toggleLike(@RequestBody LikeDto.Request request) {
        LikeDto.Response response = interactionService.toggleLike(request);
        return (response == null)
                ? ResponseEntity.ok("좋아요 취소됨")
                : ResponseEntity.ok(response);
    }

    @Operation(summary = "곡 좋아요한 사용자 목록", description = "특정 곡을 좋아요한 사용자 목록을 조회합니다.")
    @GetMapping("/api/songs/{songId}/likes/users")
    public ResponseEntity<List<LikeDto.SimpleResponse>> getLikes(@PathVariable Long songId) {
        return ResponseEntity.ok(interactionService.getLikesBySong(songId));
    }

    @Operation(summary = "곡 좋아요 수 조회", description = "특정 곡의 좋아요 수를 조회합니다.")
    @GetMapping("/api/songs/{id}/likes/count")
    public ResponseEntity<Long> countLikesBySong(@PathVariable Long songId) {
        return ResponseEntity.ok(interactionService.countLikesBySongId(songId));
    }

    @Operation(summary = "아티스트 좋아요 수 조회", description = "특정 아티스트의 좋아요 수를 조회합니다.")
    @GetMapping("/api/artists/{artistId}/likes/count")
    public ResponseEntity<Long> countLikesByArtist(@PathVariable Long artistId) {
        return ResponseEntity.ok(interactionService.countLikesByArtistId(artistId));
    }

    @Operation(summary = "좋아요 수 증가", description = "좋아요 수를 수동으로 증가시킵니다 (admin/internal용).")
    @PostMapping("/api/likes/{targetType}/{targetId}/increase")
    public ResponseEntity<?> increaseLikeCount(
            @PathVariable String targetType,
            @PathVariable Long targetId) {
        boolean success = interactionService.increaseLikeCount(targetType, targetId);
        return success
                ? ResponseEntity.ok("좋아요 수가 증가했습니다.")
                : ResponseEntity.badRequest().body("지원하지 않는 타입입니다.");
    }

    // ===== 신고 =====

    @Operation(summary = "신고 추가", description = "댓글, 곡 등 특정 대상에 대해 신고를 추가합니다.")
    @PostMapping("/api/reports")
    public ResponseEntity<ReportDto.Response> addReport(@RequestBody ReportDto.Request request) {
        return ResponseEntity.ok(interactionService.addReport(request));
    }

    @Operation(summary = "신고 목록 조회", description = "특정 대상(곡, 댓글 등)에 대한 신고 목록을 조회합니다.")
    @GetMapping("/api/reports/{targetType}/{targetId}")
    public ResponseEntity<List<ReportDto.SimpleResponse>> getReports(
            @PathVariable String targetType,
            @PathVariable Long targetId) {
        return ResponseEntity.ok(interactionService.getReportsByTarget(targetType, targetId));
    }
}
