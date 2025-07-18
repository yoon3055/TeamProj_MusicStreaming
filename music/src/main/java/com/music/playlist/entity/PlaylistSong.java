package com.music.playlist.entity;

import com.music.music.entity.Song;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

/**
 * 플레이리스트에 담긴 곡 매핑 엔티티
 */
@Entity
@Table(name = "playlist_song")
@Getter @Setter
@NoArgsConstructor                // 기본 생성자 생성
@AllArgsConstructor               // 모든 필드를 인자로 받는 생성자 생성
@Builder                          // builder() 메서드 생성
@IdClass(PlaylistSongId.class)    // 복합 키 지정
public class PlaylistSong {

    @Id
    @Column(name = "playlist_id")
    private Long playlistId;

    @Id
    @Column(name = "song_id")
    private Long songId;

    @MapsId("playlistId")
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "playlist_id", insertable = false, updatable = false)
    private Playlist playlist;

    @MapsId("songId")
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "song_id", insertable = false, updatable = false)
    private Song song;

    @Column(name = "song_order", nullable = false)
    private Integer songOrder;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }
}
