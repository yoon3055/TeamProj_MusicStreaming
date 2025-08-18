package com.music.interaction.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.time.LocalDateTime;
import org.springframework.data.domain.Pageable; // 페이징 처리를 위해 import
import com.music.interaction.entity.Comment;

// @Repository 어노테이션은 이 인터페이스가 레파지토리임을 스프링에게 알려줍니다.
// JpaRepository<엔티티 타입, 엔티티의 ID 타입>을 상속받아 기본적인 CRUD 기능을 제공받습니다.
@Repository
public interface CommentRepository extends JpaRepository<Comment, Long> {

    // 특정 곡에 달린 모든 댓글을 최신순으로 조회하는 메서드
    List<Comment> findBySongIdOrderByCreatedAtDesc(Long songId);

    // 특정 곡에 달린 댓글을 최신순으로 페이징하여 조회하는 메서드
    List<Comment> findBySongIdOrderByCreatedAtDesc(Long songId, Pageable pageable);

    // 특정 사용자가 작성한 모든 댓글을 최신순으로 조회하는 메서드
    List<Comment> findByUserIdOrderByCreatedAtDesc(Long userId);

    // 특정 사용자가 특정 곡에 작성한 댓글을 조회하는 메서드
    // 한 사용자가 한 곡에 여러 댓글을 달 수 있다고 가정하고 List를 반환합니다.
    List<Comment> findByUserIdAndSongIdOrderByCreatedAtDesc(Long userId, Long songId);

    // 특정 기간 내에 작성된 모든 댓글을 조회하는 메서드
    List<Comment> findByCreatedAtBetween(LocalDateTime startDateTime, LocalDateTime endDateTime);

    // 댓글 내용(content)에 특정 문자열이 포함된 댓글을 검색하는 메서드 (대소문자 구분 없이)
    List<Comment> findByContentContainingIgnoreCase(String content);
    
    List<Comment> findAllByOrderByCreatedAtDesc();

    // 특정 곡에 달린 댓글의 총 개수를 세는 메서드
    long countBySongId(Long songId);

    // 특정 사용자가 작성한 댓글의 총 개수를 세는 메서드
    long countByUserId(Long userId);
    

}
