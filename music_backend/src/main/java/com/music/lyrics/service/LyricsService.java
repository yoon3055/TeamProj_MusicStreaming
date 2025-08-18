package com.music.lyrics.service;

import com.music.lyrics.dto.LyricsDto;
import com.music.lyrics.entity.Lyrics;
import com.music.lyrics.repository.LyricsRepository;
import com.music.music.entity.Song;
import com.music.music.repository.SongRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class LyricsService {

    private final LyricsRepository lyricsRepository;
    private final SongRepository songRepository;

    public LyricsDto.Response createLyrics(LyricsDto.Request request) {
        if (lyricsRepository.existsBySongId(request.getSongId())) {
            throw new RuntimeException("해당 곡에는 이미 가사가 존재합니다.");
        }

        Song song = songRepository.findById(request.getSongId())
                .orElseThrow(() -> new RuntimeException("곡을 찾을 수 없습니다."));

        Lyrics lyrics = new Lyrics(song, request.getContent(), LocalDateTime.now());
        lyricsRepository.save(lyrics);

        return LyricsDto.Response.from(lyrics);
    }

    public LyricsDto.Response getLyricsBySongId(Long songId) {
        Lyrics lyrics = lyricsRepository.findBySongId(songId)
                .orElseThrow(() -> new RuntimeException("가사가 존재하지 않습니다."));
        return LyricsDto.Response.from(lyrics);
    }

    public LyricsDto.Response updateLyrics(Long songId, LyricsDto.Request request) {
        Lyrics lyrics = lyricsRepository.findBySongId(songId)
                .orElseThrow(() -> new RuntimeException("가사를 찾을 수 없습니다."));

        lyrics.setContent(request.getContent());
        lyrics.setUpdatedAt(LocalDateTime.now());

        return LyricsDto.Response.from(lyrics);
    }
}
