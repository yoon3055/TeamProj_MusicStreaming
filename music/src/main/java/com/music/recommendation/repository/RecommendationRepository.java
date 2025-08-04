package com.music.recommendation.repository;



import com.music.recommendation.entity.Recommendation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.time.LocalDateTime;

// @Repository 어노테이션은 이 인터페이스가 레파지토리임을 스프링에게 알려줍니다.
// JpaRepository<엔티티 타입, 엔티티의 ID 타입>을 상속받아 기본적인 CRUD 기능을 제공받습니다.
@Repository
public interface RecommendationRepository extends JpaRepository<Recommendation, Long> {

    // 특정 사용자에게 추천된 모든 곡 기록을 최신순으로 조회하는 메서드
    // user_id가 NULL일 수 있으므로, 해당 유저가 없는 경우도 처리합니다.
    List<Recommendation> findByUserIdOrderByRecommendedAtDesc(Long userId);

    // 특정 곡이 추천된 모든 기록을 조회하는 메서드
    List<Recommendation> findBySongIdOrderByRecommendedAtDesc(Long songId);

    // 사용자 로그인 없이 (user_id가 NULL인) 추천 기록을 조회하는 메서드
    List<Recommendation> findByUserIsNullOrderByRecommendedAtDesc();

    // 특정 사용자에게 특정 기간 내에 추천된 곡들을 조회하는 메서드
    List<Recommendation> findByUserIdAndRecommendedAtBetween(Long userId, LocalDateTime startDateTime, LocalDateTime endDateTime);

    // 특정 곡이 특정 기간 내에 추천된 기록을 조회하는 메서드
    List<Recommendation> findBySongIdAndRecommendedAtBetween(Long songId, LocalDateTime startDateTime, LocalDateTime endDateTime);

    // 특정 추천 이유(reason)를 가진 추천 기록을 조회하는 메서드
    List<Recommendation> findByReasonContainingIgnoreCase(String reason);
}
