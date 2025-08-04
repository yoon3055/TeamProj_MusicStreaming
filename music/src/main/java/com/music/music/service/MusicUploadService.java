package com.music.music.service;

import com.music.music.dto.SongUploadDto;
import com.music.music.entity.Album;
import com.music.music.entity.Artist;
import com.music.music.entity.Song;
import com.music.music.repository.AlbumRepository;
import com.music.music.repository.ArtistRepository;
import com.music.music.repository.SongRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class MusicUploadService {

    private final SongRepository songRepository;
    private final ArtistRepository artistRepository;
    private final AlbumRepository albumRepository;

    // application.properties에서 설정할 파일 저장 경로
    @Value("${music.upload.path:uploads/music}")
    private String uploadPath;

    @Value("${music.base.url:http://localhost:8080}")
    private String baseUrl;

    /**
     * 음악 파일 업로드 처리
     */
    public Long uploadMusic(SongUploadDto uploadDto) throws IOException {
        log.info("음악 파일 업로드 시작: {}", uploadDto.getTitle());
        
        try {
            MultipartFile file = uploadDto.getFile();
            
            // 1. 파일 저장
            log.debug("파일 저장 시작: {}", file.getOriginalFilename());
            String savedFileName = saveFile(file);
            String audioUrl = baseUrl + "/uploads/music/" + savedFileName;
            log.debug("파일 저장 완료: {}", audioUrl);
            
            // 2. 아티스트 조회 또는 생성
            log.debug("아티스트 처리 시작: {}", uploadDto.getArtistName());
            Artist artist = findOrCreateArtist(uploadDto.getArtistName());
            log.debug("아티스트 처리 완료: {} (ID: {})", artist.getName(), artist.getId());
            
            // 3. 앨범 조회 또는 생성 (앨범명이 있는 경우)
            Album album = null;
            if (uploadDto.getAlbumName() != null && !uploadDto.getAlbumName().trim().isEmpty()) {
                log.debug("앨범 처리 시작: {}", uploadDto.getAlbumName());
                album = findOrCreateAlbum(uploadDto.getAlbumName(), artist);
                log.debug("앨범 처리 완료: {} (ID: {})", album.getTitle(), album.getId());
            }
            
            // 4. 파일 메타데이터 추출
            log.debug("메타데이터 추출 시작");
            String fileFormat = getFileFormat(file.getOriginalFilename());
            Integer duration = extractDuration(file); // 실제 구현에서는 오디오 라이브러리 사용
            log.debug("메타데이터 추출 완료: format={}, duration={}", fileFormat, duration);
            
            // 5. Song 엔티티 생성 및 저장
            log.debug("Song 엔티티 생성 및 저장 시작");
            Song song = Song.builder()
                    .title(uploadDto.getTitle())
                    .artist(artist)
                    .album(album)
                    .audioUrl(audioUrl)
                    .genre(uploadDto.getGenre())
                    .originalFileName(file.getOriginalFilename())
                    .fileSize(file.getSize())
                    .fileFormat(fileFormat)
                    .uploadedBy(uploadDto.getUploadedBy())
                    .duration(duration)
                    .build();
            
            Song savedSong = songRepository.save(song);
            log.info("음악 파일 업로드 완료: {} (ID: {})", savedSong.getTitle(), savedSong.getId());
            return savedSong.getId();
            
        } catch (IOException e) {
            log.error("파일 저장 중 IO 오류 발생: {}", e.getMessage(), e);
            throw new RuntimeException("파일 저장 중 오류가 발생했습니다: " + e.getMessage(), e);
        } catch (Exception e) {
            log.error("음악 파일 업로드 중 예상치 못한 오류 발생: {}", e.getMessage(), e);
            throw new RuntimeException("음악 파일 업로드 중 오류가 발생했습니다: " + e.getMessage(), e);
        }
    }

    /**
     * 음악 파일 삭제
     */
    public boolean deleteMusic(Long songId) {
        Optional<Song> songOpt = songRepository.findById(songId);
        if (songOpt.isEmpty()) {
            return false;
        }
        
        Song song = songOpt.get();
        
        try {
            // 1. 실제 파일 삭제
            deleteFile(song.getAudioUrl());
            
            // 2. 데이터베이스에서 삭제
            songRepository.delete(song);
            
            log.info("음악 파일 삭제 완료: {} (ID: {})", song.getTitle(), song.getId());
            return true;
            
        } catch (Exception e) {
            log.error("음악 파일 삭제 중 오류 발생: {}", e.getMessage());
            throw new RuntimeException("파일 삭제 중 오류가 발생했습니다.", e);
        }
    }

    /**
     * 파일을 서버에 저장
     */
    private String saveFile(MultipartFile file) throws IOException {
        try {
            // 업로드 디렉토리 생성
            Path uploadDir = Paths.get(uploadPath);
            log.debug("업로드 디렉토리 경로: {}", uploadDir.toAbsolutePath());
            
            if (!Files.exists(uploadDir)) {
                log.info("업로드 디렉토리가 존재하지 않아 생성합니다: {}", uploadDir.toAbsolutePath());
                Files.createDirectories(uploadDir);
                log.info("업로드 디렉토리 생성 완료: {}", uploadDir.toAbsolutePath());
            } else {
                log.debug("업로드 디렉토리 존재 확인: {}", uploadDir.toAbsolutePath());
            }
            
            // 고유한 파일명 생성 (UUID + 원본 확장자)
            String originalFilename = file.getOriginalFilename();
            if (originalFilename == null || !originalFilename.contains(".")) {
                log.error("유효하지 않은 파일명: {}", originalFilename);
                throw new IllegalArgumentException("유효하지 않은 파일명입니다: " + originalFilename);
            }
            
            String extension = originalFilename.substring(originalFilename.lastIndexOf("."));
            String savedFileName = UUID.randomUUID().toString() + extension;
            log.debug("생성된 파일명: {} -> {}", originalFilename, savedFileName);
            
            // 파일 저장
            Path filePath = uploadDir.resolve(savedFileName);
            log.info("=== 파일 저장 시작 ===");
            log.info("업로드 디렉토리 절대 경로: {}", uploadDir.toAbsolutePath());
            log.info("저장할 파일명: {}", savedFileName);
            log.info("최종 파일 저장 경로: {}", filePath.toAbsolutePath());
            log.info("원본 파일 크기: {} bytes", file.getSize());
            
            Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);
            
            // 파일 저장 확인
            if (Files.exists(filePath)) {
                long fileSize = Files.size(filePath);
                log.info("✅ 파일 저장 성공!");
                log.info("저장된 파일 경로: {}", filePath.toAbsolutePath());
                log.info("저장된 파일 크기: {} bytes", fileSize);
                log.info("파일 읽기 권한: {}", Files.isReadable(filePath));
                log.info("파일 쓰기 권한: {}", Files.isWritable(filePath));
            } else {
                log.error("❌ 파일 저장 실패: 파일이 생성되지 않았습니다");
                log.error("실패한 경로: {}", filePath.toAbsolutePath());
                throw new IOException("파일 저장에 실패했습니다: " + filePath.toAbsolutePath());
            }
            
            return savedFileName;
            
        } catch (IOException e) {
            log.error("파일 저장 중 IO 오류: {}", e.getMessage(), e);
            throw new IOException("파일 저장 중 오류가 발생했습니다: " + e.getMessage(), e);
        } catch (Exception e) {
            log.error("파일 저장 중 예상치 못한 오류: {}", e.getMessage(), e);
            throw new RuntimeException("파일 저장 중 예상치 못한 오류가 발생했습니다: " + e.getMessage(), e);
        }
    }

    /**
     * 파일 삭제
     */
    private void deleteFile(String audioUrl) {
        try {
            // URL에서 파일명 추출
            String fileName = audioUrl.substring(audioUrl.lastIndexOf("/") + 1);
            Path filePath = Paths.get(uploadPath, fileName);
            
            if (Files.exists(filePath)) {
                Files.delete(filePath);
                log.debug("파일 삭제 완료: {}", filePath);
            }
        } catch (Exception e) {
            log.warn("파일 삭제 실패: {}", e.getMessage());
        }
    }

    /**
     * 아티스트 조회 또는 생성
     */
    private Artist findOrCreateArtist(String artistName) {
        return artistRepository.findFirstByName(artistName)
                .orElseGet(() -> {
                    Artist newArtist = new Artist();
                    newArtist.setName(artistName);
                    Artist savedArtist = artistRepository.save(newArtist);
                    log.info("새 아티스트 생성: {}", artistName);
                    return savedArtist;
                });
    }

    /**
     * 앨범 조회 또는 생성
     */
    private Album findOrCreateAlbum(String albumName, Artist artist) {
        return albumRepository.findByTitleAndArtist(albumName, artist)
                .orElseGet(() -> {
                    Album newAlbum = new Album();
                    newAlbum.setTitle(albumName);
                    newAlbum.setArtist(artist);
                    // 발매일은 현재 날짜로 설정
                    newAlbum.setReleaseDate(java.time.LocalDate.now());
                    Album savedAlbum = albumRepository.save(newAlbum);
                    log.info("새 앨범 생성: {} by {}", albumName, artist.getName());
                    return savedAlbum;
                });
    }

    /**
     * 파일 확장자에서 형식 추출
     */
    private String getFileFormat(String filename) {
        if (filename == null) return "unknown";
        
        String extension = filename.substring(filename.lastIndexOf(".") + 1).toLowerCase();
        return switch (extension) {
            case "mp3" -> "mp3";
            case "wav" -> "wav";
            case "flac" -> "flac";
            default -> "unknown";
        };
    }

    /**
     * 오디오 파일의 재생 시간 추출 (간단한 구현)
     * 실제 구현에서는 Apache Tika나 JAudioTagger 등의 라이브러리 사용 권장
     */
    private Integer extractDuration(MultipartFile file) {
        // TODO: 실제 오디오 메타데이터 추출 라이브러리 구현
        // 현재는 기본값 반환
        return 180; // 3분 기본값
    }
}
