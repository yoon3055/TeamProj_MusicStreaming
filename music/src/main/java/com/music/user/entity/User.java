package com.music.user.entity;

import com.music.user.dto.PasswordUpdateDto;
import jakarta.persistence.*;
import lombok.*;

@Builder
@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@Entity
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String nickname;
    private String profileImage;

    @Column(nullable = false, unique = true)
    private String email;

    private String password;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private Role role = Role.USER;

    @Enumerated(EnumType.STRING)
    private SocialType socialType;

    private String socialId;

    // Entity -> DTO 변환
    public PasswordUpdateDto toDto() {
        return PasswordUpdateDto.builder()
                .id(this.id)
                .email(this.email).build();
    }


}