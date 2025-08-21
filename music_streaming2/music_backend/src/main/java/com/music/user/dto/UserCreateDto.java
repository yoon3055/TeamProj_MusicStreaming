package com.music.user.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import com.music.user.entity.User;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserCreateDto {
    private String email;
    private String password;
    private String nickname;


    // DTO -> Entity 변환
    public User toEntity() {
        return User.builder()
                    .email(this.email)
                    .password(this.password)
                    .nickname(nickname).build();
    }

}
