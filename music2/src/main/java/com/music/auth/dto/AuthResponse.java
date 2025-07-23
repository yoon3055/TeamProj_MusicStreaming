package com.music.auth.dto;

import lombok.Data;

@Data
public class AuthResponse {
    private String token;
    private String email;
}
