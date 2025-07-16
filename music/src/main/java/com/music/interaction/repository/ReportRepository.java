package com.music.interaction.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.time.LocalDateTime;
import com.music.interaction.entity.Report;

// @Repository 어노테이션은 이 인터페이스가 레파지토리임을 스프링에게 알려줍니다.
// JpaRepository<엔티티 타입, 엔티티의 ID 타입>을 상속받아 기본적인 CRUD 기능을 제공받습니다.
@Repository
public interface ReportRepository extends JpaRepository<Report, Long> {

    // 특정 사용자가 제출한 모든 신고 기록을 최신순으로 조회하는 메서드
    List<Report> findByUserIdOrderByCreatedAtDesc(Long userId);

    // 특정 신고 대상 타입(예: 'comment', 'song', 'user')의 모든 신고 기록을 조회하는 메서드
    List<Report> findByTargetTypeOrderByCreatedAtDesc(String targetType);

    // 특정 신고 대상 ID를 가진 모든 신고 기록을 조회하는 메서드
    List<Report> findByTargetIdOrderByCreatedAtDesc(Long targetId);

    // 특정 신고 대상 타입과 ID를 가진 모든 신고 기록을 조회하는 메서드
    List<Report> findByTargetTypeAndTargetIdOrderByCreatedAtDesc(String targetType, Long targetId);

    // 특정 기간 내에 접수된 모든 신고 기록을 조회하는 메서드
    List<Report> findByCreatedAtBetween(LocalDateTime startDateTime, LocalDateTime endDateTime);

    // 신고 사유(reason)에 특정 키워드가 포함된 신고 기록을 검색하는 메서드 (대소문자 구분 없이)
    List<Report> findByReasonContainingIgnoreCase(String keyword);

    // 특정 사용자가 특정 대상(타입과 ID)을 신고한 기록이 있는지 확인하는 메서드
    boolean existsByUserIdAndTargetTypeAndTargetId(Long userId, String targetType, Long targetId);

    // 특정 대상(타입과 ID)에 대한 총 신고 건수를 세는 메서드
    long countByTargetTypeAndTargetId(String targetType, Long targetId);
}
