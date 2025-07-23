package com.example.oauth.member.dto;

import lombok.Data;

@Data
public class DeleteAccountDto {
    private String email;
    private String password;
}