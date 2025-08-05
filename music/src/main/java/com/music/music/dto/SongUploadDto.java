package com.music.music.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.web.multipart.MultipartFile;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "음악 파일 업로드 DTO")
public class SongUploadDto {

    @Schema(description = "업로드할 음악 파일")
    private MultipartFile file;

    @Schema(description = "곡 제목", required = true)
    private String title;

    @Schema(description = "장르")
    private String genre;

    @Schema(description = "업로드한 관리자 이메일")
    private String uploadedBy;
}
