package com.music.admin.controller;

import com.music.interaction.dto.CommentDto;
import com.music.interaction.entity.Comment;
import com.music.interaction.repository.CommentRepository;
import com.music.interaction.service.InteractionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequiredArgsConstructor
@RequestMapping("/admin/comments")
public class AdminCommentController {

    private final CommentRepository commentRepository;
    private final InteractionService interactionService;

    // 전체 댓글 조회
    @GetMapping
    public ResponseEntity<List<CommentDto.Response>> getAllComments() {
        List<Comment> comments = commentRepository.findAllByOrderByCreatedAtDesc();
        List<CommentDto.Response> response = comments.stream()
                .map(CommentDto.Response::from)
                .collect(Collectors.toList());
        return ResponseEntity.ok(response);
    }

    // 댓글 수정
    @PutMapping("/{commentId}")
    public ResponseEntity<CommentDto.Response> updateComment(
            @PathVariable Long commentId,
            @RequestBody CommentDto.UpdateRequest request) {
        return ResponseEntity.ok(interactionService.updateComment(commentId, request));
    }

    // 댓글 삭제
    @DeleteMapping("/{commentId}")
    public ResponseEntity<Void> deleteComment(@PathVariable Long commentId) {
        interactionService.deleteComment(commentId);
        return ResponseEntity.noContent().build();
    }
}
