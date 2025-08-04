package com.music.music.repository;

import com.music.music.entity.Artist;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;


// @Repository 어노테이션은 이 인터페이스가 레파지토리임을 스프링에게 알려줍니다.
// JpaRepository<엔티티 타입, 엔티티의 ID 타입>을 상속받아 기본적인 CRUD 기능을 제공받습니다.
@Repository
public interface ArtistRepository extends JpaRepository<Artist, Long> {

    // 아티스트 이름으로 아티스트를 조회하는 메서드
    // 이름이 UNIQUE 제약 조건이 없으므로, 같은 이름을 가진 여러 아티스트가 있을 수 있어 List를 반환합니다.
    List<Artist> findByName(String name);
    
    // 아티스트 이름으로 첫 번째 아티스트를 조회하는 메서드 (업로드용)
    Optional<Artist> findFirstByName(String name);

    // 특정 문자열을 포함하는 이름으로 아티스트를 검색하는 메서드 (예: 'BTS' 검색 시 '방탄소년단' 포함)
    List<Artist> findByNameContainingIgnoreCase(String name);

    // 아티스트 이름의 존재 여부를 확인하는 메서드 (중복 이름 체크 등)
    boolean existsByName(String name);

    // ID는 JpaRepository에서 findById()로 제공되지만, 가독성을 위해 명시적으로 쓸 수도 있습니다.
    // Optional<Artist> findById(Long id); // JpaRepository에 이미 정의되어 있음
}
