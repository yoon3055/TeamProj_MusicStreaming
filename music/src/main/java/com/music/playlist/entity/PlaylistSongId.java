package com.music.playlist.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import java.io.Serializable;
import java.util.Objects;

@Embeddable // 이 클래스가 다른 엔티티에 포함될 수 있는 임베디드 가능한 타입임을 나타냅니다.
public class PlaylistSongId implements Serializable {

    @Column(name = "playlist_id") // 데이터베이스 컬럼 이름 지정
    private Long playlistId;

    @Column(name = "song_id") // 데이터베이스 컬럼 이름 지정
    private Long songId;

    // JPA를 위한 기본 생성자는 필수입니다.
    public PlaylistSongId() {}

    // 필드를 초기화하는 생성자
    public PlaylistSongId(Long playlistId, Long songId) {
        this.playlistId = playlistId;
        this.songId = songId;
    }

    // 복합 키에서는 equals()와 hashCode() 메서드를 정확히 오버라이드해야 합니다.
    // 이는 JPA가 엔티티의 동등성을 올바르게 식별하고 캐싱하는 데 중요합니다.
    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        PlaylistSongId that = (PlaylistSongId) o;
        return Objects.equals(playlistId, that.playlistId) &&
                Objects.equals(songId, that.songId);
    }

    @Override
    public int hashCode() {
        return Objects.hash(playlistId, songId);
    }

    // Getter 및 Setter (필요에 따라)
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
}
