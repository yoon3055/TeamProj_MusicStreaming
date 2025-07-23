package com.example.oauth.member.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true) //없는 필드는 자동무시
public class GoogleProfileDto {
    private String sub;
    private String email;
    private String picture;
}
