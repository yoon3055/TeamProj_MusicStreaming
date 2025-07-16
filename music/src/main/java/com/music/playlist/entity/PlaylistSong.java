package com.music.playlist.entity;

import com.music.music.entity.Song;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.IdClass; // 복합 키 클래스를 지정할 때 사용
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.MapsId; // FK가 PK의 일부임을 매핑할 때 사용

@Entity // 이 클래스가 JPA 엔티티임을 나타냅니다.
@IdClass(PlaylistSongId.class) // PlaylistSongId 클래스를 복합 기본 키로 지정합니다.
public class PlaylistSong {

    // 복합 기본 키의 일부로, PlaylistSongId의 playlistId 필드에 매핑됩니다.
    @Id
    @Column(name = "playlist_id")
    private Long playlistId;

    // 복합 기본 키의 일부로, PlaylistSongId의 songId 필드에 매핑됩니다.
    @Id
    @Column(name = "song_id")
    private Long songId;

    // Playlist 엔티티와의 다대일(N:1) 관계를 설정합니다.
    // @MapsId("playlistId"): 이 관계의 외래 키가 위에서 정의된 playlistId 필드를 통해 매핑되고,
    // 이 playlistId가 복합 키의 일부임을 JPA에 알려줍니다.
    @ManyToOne
    @MapsId("playlistId")
    @JoinColumn(name = "playlist_id", insertable = false, updatable = false) // FK이지만 PK의 일부이므로 별도 관리하지 않음
    private Playlist playlist;

    // Song 엔티티와의 다대일(N:1) 관계를 설정합니다.
    // @MapsId("songId"): 이 관계의 외래 키가 위에서 정의된 songId 필드를 통해 매핑되고,
    // 이 songId가 복합 키의 일부임을 JPA에 알려줍니다.
    @ManyToOne
    @MapsId("songId")
    @JoinColumn(name = "song_id", insertable = false, updatable = false) // FK이지만 PK의 일부이므로 별도 관리하지 않음
    private Song song;

    @Column(name = "song_order", nullable = false) // INT, NULL 불가능 (MySQL의 'ORDER'는 예약어이므로 'song_order'로 변경)
    private Integer order; // 재생 목록 내 곡의 순서

    // JPA에서 필수적인 기본 생성자
    public PlaylistSong() {}

    // 필드를 초기화하는 생성자 (ID는 자동 생성되므로, FK 엔티티와 순서만 받습니다.)
    public PlaylistSong(Playlist playlist, Song song, Integer order) {
        this.playlist = playlist;
        this.song = song;
        // 복합 키를 구성하는 ID 값을 직접 설정합니다.
        this.playlistId = playlist.getId();
        this.songId = song.getId();
        this.order = order;
    }

    // Getter 및 Setter 메서드
    public Long getPlaylistId() {
        return playlistId;
    }

    public void setPlaylistId(Long playlistId) {
        this.playlistId = playlistId;
    }

    public Long getSongId() {
        return songId;
    }

    public void setSongId(Long songId) {
        this.songId = songId;
    }

    public Playlist getPlaylist() {
        return playlist;
    }

    public void setPlaylist(Playlist playlist) {
        this.playlist = playlist;
    }

    public Song getSong() {
        return song;
    }

    public void setSong(Song song) {
        this.song = song;
    }

    public Integer getOrder() {
        return order;
    }

    public void setOrder(Integer order) {
        this.order = order;
    }
}