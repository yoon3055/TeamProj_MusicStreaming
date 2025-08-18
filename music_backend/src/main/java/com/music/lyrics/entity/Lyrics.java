package com.music.lyrics.entity;

import com.music.music.entity.Song;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@Entity
@Table(name = "lyrics")
public class Lyrics {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne
    @JoinColumn(name = "song_id", nullable = false, unique = true)
    private Song song;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String content;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public Lyrics() {}

    public Lyrics(Song song, String content, LocalDateTime updatedAt) {
        this.song = song;
        this.content = content;
        this.updatedAt = updatedAt;
    }

    // Getters and Setters 생략 가능 (Lombok 사용 시)
}
