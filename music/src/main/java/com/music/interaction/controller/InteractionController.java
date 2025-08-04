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

    // ===== COMMENT =====
    @PostMapping("/comments")
    public ResponseEntity<CommentDto.Response> addComment(@RequestBody CommentDto.Request request) {
        return ResponseEntity.ok(interactionService.addComment(request));
    }

    @GetMapping("/comments/{songId}")
    public ResponseEntity<List<CommentDto.SongCommentResponse>> getComments(@PathVariable Long songId) {
        return ResponseEntity.ok(interactionService.getCommentsBySong(songId));
    }

    @PutMapping("/comments/{commentId}")
    public ResponseEntity<CommentDto.Response> updateComment(@PathVariable Long commentId,
                                                             @RequestBody CommentDto.UpdateRequest request) {
        return ResponseEntity.ok(interactionService.updateComment(commentId, request));
    }

    @DeleteMapping("/comments/{commentId}")
    public ResponseEntity<Void> deleteComment(@PathVariable Long commentId) {
        interactionService.deleteComment(commentId);
        return ResponseEntity.noContent().build();
    }

    // ===== LIKE =====
    @PostMapping("/likes")
    public ResponseEntity<?> toggleLike(@RequestBody LikeDto.Request request) {
        LikeDto.Response response = interactionService.toggleLike(request);
        return (response == null) ?
                ResponseEntity.ok("좋아요 취소됨") :
                ResponseEntity.ok(response);
    }

    @GetMapping("/likes/{songId}")
    public ResponseEntity<List<LikeDto.SimpleResponse>> getLikes(@PathVariable Long songId) {
        return ResponseEntity.ok(interactionService.getLikesBySong(songId));
    }

    // ===== REPORT =====
    @PostMapping("/reports")
    public ResponseEntity<ReportDto.Response> addReport(@RequestBody ReportDto.Request request) {
        return ResponseEntity.ok(interactionService.addReport(request));
    }

    @GetMapping("/reports/{targetType}/{targetId}")
    public ResponseEntity<List<ReportDto.SimpleResponse>> getReports(@PathVariable String targetType,
                                                                      @PathVariable Long targetId) {
        return ResponseEntity.ok(interactionService.getReportsByTarget(targetType, targetId));
    }
}