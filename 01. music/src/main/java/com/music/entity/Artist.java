package com.music.entity;

import jakarta.persistence.*;

@Entity
public class Artist {

    @Id // 기본 키(Primary Key)임을 나타냅니다.
    @GeneratedValue(strategy = GenerationType.IDENTITY) // ID 자동 생성을 데이터베이스에 위임합니다.
    private Long id; // BIGINT (PK)

    @Column(nullable = false, length = 255) // VARCHAR(255), NULL 불가능
    private String name; // 아티스트 이름

    @Column(columnDefinition = "TEXT") // TEXT 타입에 매핑되도록 합니다. NULL 가능
    private String bio; // 아티스트 소개 (긴 텍스트)

    @Column(name = "image_url", length = 500) // VARCHAR(500), NULL 가능
    private String imageUrl; // 아티스트 이미지 URL

    // Lombok을 사용하면 아래 생성자, Getter, Setter 코드를 자동으로 생성할 수 있어 편리합니다.
    // @NoArgsConstructor, @AllArgsConstructor, @Getter, @Setter 어노테이션 사용 권장


}
