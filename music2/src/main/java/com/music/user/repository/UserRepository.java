package com.music.user.repository;

import com.music.user.entity.User; // User 엔티티 클래스의 경로를 정확히 지정해주세요.
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional; // findByEmail의 결과가 없을 경우를 대비해 Optional 반환

@Repository // 이 인터페이스가 스프링의 데이터 접근 계층 컴포넌트임을 나타냅니다.
public interface UserRepository extends JpaRepository<User, Long> {

    // JpaRepository는 기본적인 CRUD(Create, Read, Update, Delete) 메서드를 제공합니다.
    // 예를 들어, save(), findById(), findAll(), delete() 등이 이미 포함되어 있습니다.

    // 추가적으로 필요한 쿼리 메서드는 스프링 데이터 JPA의 쿼리 메서드 규칙에 따라 정의할 수 있습니다.

    // 1. email로 사용자 조회 (unique 제약 조건이 있으므로 단일 결과 예상)
    // Optional을 반환하여 결과가 없을 경우(null)에 대한 안전한 처리를 유도합니다.
    Optional<User> findByEmail(String email);

    // 2. nickname으로 사용자 조회 (nickname은 unique 제약 조건이 없으므로 여러 결과가 나올 수 있다면 List<User> 반환)
    // 현재 엔티티에는 nickname에 unique 제약 조건이 없으므로 List로 정의하는 것이 더 안전합니다.
    List<User> findByNickname(String nickname);

    // 3. email과 password로 사용자 조회 (로그인 등에서 사용 가능)
    Optional<User> findByEmailAndPassword(String email, String password);

    // 4. email 인증 여부로 사용자 조회
    List<User> findByIsVerified(boolean isVerified);

    // 필요한 경우 사용자 정의 쿼리도 가능 (예: JPQL 또는 Native Query)
    // @Query("SELECT u FROM User u WHERE u.email = :email")
    // User findByEmailCustom(@Param("email") String email);
}