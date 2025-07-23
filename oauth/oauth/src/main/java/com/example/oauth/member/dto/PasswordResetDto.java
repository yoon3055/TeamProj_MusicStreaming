package com.example.oauth.member.dto;

import lombok.Data;

@Data
public class PasswordResetDto {
    private String email;
    private String newPassword;
    private String token;
}