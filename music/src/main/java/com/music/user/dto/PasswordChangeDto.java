package com.music.user.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PasswordChangeDto {
    private String currentPassword;
    private String newPassword;
    private String confirmPassword;
}
