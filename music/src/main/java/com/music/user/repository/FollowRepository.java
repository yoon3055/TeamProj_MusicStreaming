package com.music.user.repository;

import com.music.user.entity.Follow;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;



// @Repository 어노테이션은 이 인터페이스가 레파지토리임을 스프링에게 알려줍니다.
// JpaRepository<엔티티 타입, 엔티티의 ID 타입>을 상속받아 기본적인 CRUD 기능을 제공받습니다.
@Repository
public interface FollowRepository extends JpaRepository<Follow, Long> {

    // 특정 사용자가 팔로우하는 모든 관계(내가 팔로우하는 사람 목록)를 조회
    List<Follow> findByFollowerId(Long followerId);

    // 특정 사용자를 팔로우하는 모든 관계(나를 팔로우하는 사람 목록)를 조회
    List<Follow> findByFollowingId(Long followingId);

    // 특정 사용자가 다른 특정 사용자를 팔로우하는 관계가 존재하는지 확인
    // follower_id와 following_id 조합은 UNIQUE이므로 Optional을 반환합니다.
    Optional<Follow> findByFollowerIdAndFollowingId(Long followerId, Long followingId);

    // 특정 사용자가 다른 특정 사용자를 팔로우하는 관계가 존재하는지 boolean 값으로 확인
    boolean existsByFollowerIdAndFollowingId(Long followerId, Long followingId);

    // 특정 사용자가 팔로우하는 총 사용자 수를 세는 메서드
    long countByFollowerId(Long followerId);

    // 특정 사용자를 팔로우하는 총 사용자 수를 세는 메서드
    long countByFollowingId(Long followingId);

    // 특정 사용자가 다른 특정 사용자를 언팔로우하기 위한 메서드 (삭제)
    void deleteByFollowerIdAndFollowingId(Long followerId, Long followingId);
}
