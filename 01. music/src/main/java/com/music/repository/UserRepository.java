package com.music.repository;

import com.music.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional; // Optional은 결과가 없을 수도 있는 경우에 사용됩니다.

// @Repository 어노테이션은 이 인터페이스가 레파지토리임을 스프링에게 알려줍니다.
// JpaRepository를 상속받아 기본적인 CRUD(Create, Read, Update, Delete) 기능을 제공받습니다.
// JpaRepository<엔티티 타입, 엔티티의 ID 타입>
@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    // email 필드는 UNIQUE 속성을 가지고 있으므로, 이메일을 통해 User를 조회하는 메서드를 추가하는 것이 일반적입니다.
    // Optional<User>를 반환하여 해당 이메일의 사용자가 없을 경우 null 대신 Optional.empty()를 반환하도록 합니다.
    Optional<User> findByEmail(String email);

    // 닉네임이 UNIQUE는 아니지만, 닉네임으로 조회하는 경우도 있을 수 있습니다.
    // 만약 닉네임이 UNIQUE라면 findByNickname(String nickname)을 사용할 수 있습니다.
    // 여기서는 여러 사용자가 같은 닉네임을 가질 수 있다고 가정하고 List를 반환합니다.
    // List<User> findByNickname(String nickname);

    // 이메일 존재 여부 확인 (회원가입 시 중복 체크 등)
    boolean existsByEmail(String email);

    // 닉네임 존재 여부 확인 (닉네임 중복 체크)
    boolean existsByNickname(String nickname);
}
