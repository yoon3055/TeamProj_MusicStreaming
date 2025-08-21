package com.music.admin.controller;

import com.music.interaction.dto.CommentDto;
import com.music.interaction.entity.Comment;
import com.music.interaction.repository.CommentRepository;
import com.music.interaction.service.InteractionService;
import io.swagger.v3.oas.annotations.Operation;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/admin/comments") // ✅ 경로 수정
public class AdminCommentController {

    private final CommentRepository commentRepository;
    private final InteractionService interactionService;

    @Operation(
        summary = "전체 댓글 조회",
        description = "모든 댓글을 생성일 기준 내림차순으로 조회합니다. 관리자 전용 기능입니다."
    )
    @GetMapping
    public ResponseEntity<List<CommentDto.Response>> getAllComments() {
        List<Comment> comments = commentRepository.findAllByOrderByCreatedAtDesc();
        List<CommentDto.Response> response = comments.stream()
                .map(CommentDto.Response::from)
                .collect(Collectors.toList());
        return ResponseEntity.ok(response);
    }

    @Operation(
        summary = "댓글 수정",
        description = "관리자가 특정 댓글의 내용을 수정합니다."
    )
    @PutMapping("/{commentId}")
    public ResponseEntity<CommentDto.Response> updateComment(
            @PathVariable Long commentId,
            @RequestBody CommentDto.UpdateRequest request) {
        return ResponseEntity.ok(interactionService.updateComment(commentId, request));
    }

    @Operation(
        summary = "댓글 삭제",
        description = "관리자가 특정 댓글을 삭제합니다."
    )
    @DeleteMapping("/{commentId}")
    public ResponseEntity<Void> deleteComment(@PathVariable Long commentId) {
        interactionService.deleteComment(commentId);
        return ResponseEntity.noContent().build();
    }
}
