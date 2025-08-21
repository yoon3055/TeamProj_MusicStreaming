package com.music.music.controller;

import com.music.music.dto.SongUploadDto;
import com.music.music.service.MusicUploadService;
import com.music.user.entity.Role;
import com.music.user.entity.User;
import com.music.user.repository.UserRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MaxUploadSizeExceededException;
import org.springframework.web.multipart.MultipartFile;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/admin/music")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Music Upload", description = "관리자 음악 파일 업로드 API")
public class MusicUploadController {

    private final MusicUploadService musicUploadService;
    private final UserRepository userRepository;

    @PostMapping("/upload")
    @Operation(summary = "음악 파일 업로드", description = "관리자가 음악 파일을 업로드합니다.")
    public ResponseEntity<Map<String, Object>> uploadMusic(
            @RequestAttribute("email") String email,
            @RequestParam("file") MultipartFile file,
            @RequestParam("title") String title,
            @RequestParam(value = "genre", required = false) String genre,
            @RequestParam(value = "artistId", required = false) Long artistId) {
        
        // 받은 파라미터들을 로그로 출력
        log.info("=== 음악 업로드 파라미터 확인 ===");
        log.info("Email: {}", email);
        log.info("File name: {}", file != null ? file.getOriginalFilename() : "null");
        log.info("Title: '{}'", title);
        log.info("Genre: '{}'", genre);
        log.info("Artist ID: {}", artistId);
        log.info("================================");
        
        Map<String, Object> response = new HashMap<>();
        
        try {
            // 1. 관리자 권한 체크
            Optional<User> userOpt = userRepository.findByEmail(email);
            if (userOpt.isEmpty()) {
                log.warn("사용자를 찾을 수 없음: {}", email);
                response.put("success", false);
                response.put("message", "사용자를 찾을 수 없습니다.");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
            }

            User user = userOpt.get();
            if (user.getRole() != Role.ADMIN) {
                log.warn("관리자 권한 없음: {} (role: {})", email, user.getRole());
                response.put("success", false);
                response.put("message", "관리자 권한이 필요합니다.");
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(response);
            }

            // 2. 파일 검증
            if (file.isEmpty()) {
                response.put("success", false);
                response.put("message", "파일이 선택되지 않았습니다.");
                return ResponseEntity.badRequest().body(response);
            }

            // 3. 파일 형식 검증
            String contentType = file.getContentType();
            if (contentType == null || !isValidAudioFormat(contentType)) {
                response.put("success", false);
                response.put("message", "지원하지 않는 파일 형식입니다. (MP3, WAV, FLAC만 지원)");
                return ResponseEntity.badRequest().body(response);
            }

            // 4. 파일 크기 검증 (200MB 제한)
            long maxSize = 200 * 1024 * 1024; // 200MB
            if (file.getSize() > maxSize) {
                response.put("success", false);
                response.put("message", "파일 크기가 너무 큽니다. (최대 200MB)");
                return ResponseEntity.badRequest().body(response);
            }

            // 5. DTO 생성
            SongUploadDto uploadDto = SongUploadDto.builder()
                    .file(file)
                    .title(title)
                    .genre(genre)
                    .artistId(artistId)
                    .uploadedBy(email)
                    .build();

            // 6. 음악 파일 업로드 처리
            Long songId = musicUploadService.uploadMusic(uploadDto);

            log.info("음악 파일 업로드 성공: {} by {}", title, email);
            response.put("success", true);
            response.put("message", "음악 파일이 성공적으로 업로드되었습니다.");
            response.put("songId", songId);
            
            return ResponseEntity.ok(response);

        } catch (MaxUploadSizeExceededException e) {
            log.warn("파일 크기 제한 초과: {}", e.getMessage());
            response.put("success", false);
            response.put("message", "파일 크기가 너무 큽니다. 최대 200MB까지 업로드 가능합니다.");
            return ResponseEntity.status(HttpStatus.PAYLOAD_TOO_LARGE).body(response);
        } catch (Exception e) {
            log.error("음악 파일 업로드 중 오류 발생", e);
            response.put("success", false);
            response.put("message", "서버 오류가 발생했습니다: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    @GetMapping("/formats")
    @Operation(summary = "지원 파일 형식 조회", description = "업로드 가능한 음악 파일 형식을 조회합니다.")
    public ResponseEntity<Map<String, Object>> getSupportedFormats() {
        Map<String, Object> response = new HashMap<>();
        response.put("supportedFormats", new String[]{"audio/mpeg", "audio/wav", "audio/flac"});
        response.put("maxFileSize", "200MB");
        return ResponseEntity.ok(response);
    }

    @GetMapping("/list")
    @Operation(summary = "업로드된 음악 파일 목록 조회", description = "관리자가 업로드한 모든 음악 파일 목록을 조회합니다.")
    public ResponseEntity<Map<String, Object>> getMusicList(
            @RequestAttribute("email") String email) {
        
        Map<String, Object> response = new HashMap<>();
        
        try {
            // 관리자 권한 체크
            Optional<User> userOpt = userRepository.findByEmail(email);
            if (userOpt.isEmpty() || userOpt.get().getRole() != Role.ADMIN) {
                response.put("success", false);
                response.put("message", "관리자 권한이 필요합니다.");
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(response);
            }

            // 음악 파일 목록 조회
            var songs = musicUploadService.getAllSongs();
            
            response.put("success", true);
            response.put("songs", songs);
            response.put("message", "음악 파일 목록을 성공적으로 조회했습니다.");
            
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            log.error("음악 파일 목록 조회 중 오류 발생", e);
            response.put("success", false);
            response.put("message", "서버 오류가 발생했습니다: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    @DeleteMapping("/{songId}")
    @Operation(summary = "음악 파일 삭제", description = "관리자가 업로드된 음악 파일을 삭제합니다.")
    public ResponseEntity<Map<String, Object>> deleteMusic(
            @RequestAttribute("email") String email,
            @PathVariable("songId") Long songId) {
        
        Map<String, Object> response = new HashMap<>();
        
        try {
            // 관리자 권한 체크
            Optional<User> userOpt = userRepository.findByEmail(email);
            if (userOpt.isEmpty() || userOpt.get().getRole() != Role.ADMIN) {
                response.put("success", false);
                response.put("message", "관리자 권한이 필요합니다.");
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(response);
            }

            boolean deleted = musicUploadService.deleteMusic(songId);
            
            if (deleted) {
                log.info("음악 파일 삭제 성공: songId={} by {}", songId, email);
                response.put("success", true);
                response.put("message", "음악 파일이 삭제되었습니다.");
            } else {
                response.put("success", false);
                response.put("message", "음악 파일을 찾을 수 없습니다.");
                return ResponseEntity.notFound().build();
            }
            
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            log.error("음악 파일 삭제 중 오류 발생", e);
            response.put("success", false);
            response.put("message", "서버 오류가 발생했습니다: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    @GetMapping("/download/{songId}")
    @Operation(summary = "음악 파일 다운로드", description = "음악 파일을 다운로드합니다.")
    public ResponseEntity<?> downloadMusic(
            @RequestAttribute("email") String email,
            @PathVariable("songId") Long songId) {
        
        try {
            // 사용자 인증 확인 (관리자가 아니어도 다운로드 가능)
            Optional<User> userOpt = userRepository.findByEmail(email);
            if (userOpt.isEmpty()) {
                Map<String, Object> response = new HashMap<>();
                response.put("success", false);
                response.put("message", "사용자를 찾을 수 없습니다.");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
            }

            // 음악 파일 다운로드
            return musicUploadService.downloadMusic(songId);

        } catch (Exception e) {
            log.error("음악 파일 다운로드 중 오류 발생", e);
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "서버 오류가 발생했습니다: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    /**
     * 유효한 오디오 파일 형식인지 검증
     */
    private boolean isValidAudioFormat(String contentType) {
        return contentType.equals("audio/mpeg") ||  // MP3
               contentType.equals("audio/wav") ||   // WAV
				contentType.equals("audio/flac"); // FLAC
	}
}
