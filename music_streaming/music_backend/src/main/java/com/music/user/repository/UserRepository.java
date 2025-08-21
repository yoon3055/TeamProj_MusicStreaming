package com.music.user.repository;

import com.music.user.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional; // Optional은 결과가 없을 수도 있는 경우에 사용됩니다.   

// @Repository 어노테이션은 이 인터페이스가 레파지토리임을 스프링에게 알려줍니다.
// JpaRepository를 상속받아 기본적인 CRUD(Create, Read, Update, Delete) 기능을 제공받습니다.
// JpaRepository<엔티티 타입, 엔티티의 ID 타입>
@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    // email로 사용자 찾기
    Optional<User> findByEmail(String email);
    Optional<User> findBySocialId(String socialId);
    
 // 🔍 이메일 또는 닉네임이 키워드에 포함된 사용자 검색
    List<User> findByEmailContainingIgnoreCaseOrNicknameContainingIgnoreCase(String email, String nickname);

    // 이메일 존재 여부 확인
    boolean existsByEmail(String email);

    // 닉네임 존재 여부 확인
    boolean existsByNickname(String nickname);


}

