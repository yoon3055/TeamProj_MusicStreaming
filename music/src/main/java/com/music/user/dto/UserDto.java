package com.music.user.dto;

import com.music.user.entity.Role;
import com.music.user.entity.User;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.*;
import lombok.experimental.SuperBuilder;

import java.time.LocalDateTime;

@Schema(description = "회원")
@Data
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
public class UserDto {

    @Schema(description = "아이디 (auto_increment)")
    private Long id;

    @Schema(description = "닉네임")
    private String nickname;

    @Schema(description = "이메일")
    private String email;

    @Schema(description = "비밀번호")
    private String password;

    @Schema(description = "프로필 이미지")
    private String profileImage;

    @Schema(description = "access 토큰")
    private String authToken; // 사용자 인증 정보 토큰

    @Schema(description = "refresh 토큰")
    private String refreshToken; // authToken 갱신을 위한 토큰

    @Schema(description = "사용자 역할")
    private Role role;

    // List<Entity> -> List<DTO> 변환을 위함
    public UserDto(User user) {
        this.id = user.getId();
        this.nickname = user.getNickname();
        this.email = user.getEmail();
        this.password = user.getPassword();
        this.profileImage = user.getProfileImage();
        this.refreshToken = user.getRefreshToken();
        this.role = user.getRole();
    }

    public User updateUser(long id, UserDto userDto) {
        return User.builder()
                .id(id)
                .nickname(userDto.getNickname())
                .email(userDto.getEmail())
                .password(userDto.getPassword())
                .profileImage(userDto.getProfileImage())
                .refreshToken(userDto.getRefreshToken())
                .role(userDto.getRole()).build();
    }

    // DTO -> Entity 변환
    public User toEntity() {
        return User.builder()
                    .id(this.id)
                    .nickname(this.nickname)
                    .email(this.email)
                    .password(this.password)
                    .profileImage(this.profileImage)
                    .refreshToken(this.refreshToken)
                    .role(this.role).build();
    }
}
