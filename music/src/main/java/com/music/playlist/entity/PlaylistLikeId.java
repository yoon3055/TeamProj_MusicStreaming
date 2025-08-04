package com.music.playlist.entity;          // ★ 파일 맨 첫 줄에 단 하나만

import jakarta.persistence.Embeddable;
import java.io.Serializable;
import java.util.Objects;

@Embeddable
public class PlaylistLikeId implements Serializable {

    private Long playlistId;
    private Long userId;

    /* === 명시적 생성자 (Lombok 없이도 OK) === */
    public PlaylistLikeId() {}
    public PlaylistLikeId(Long playlistId, Long userId) {
        this.playlistId = playlistId;
        this.userId = userId;
    }

    /* getters / setters ─ IDE가 자동 생성해도 되고 수동으로 적어도 됨 */
    public Long getPlaylistId() { return playlistId; }
    public void setPlaylistId(Long playlistId) { this.playlistId = playlistId; }
    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }

    /* equals / hashCode 필수 */
    @Override public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        PlaylistLikeId that = (PlaylistLikeId) o;
        return Objects.equals(playlistId, that.playlistId) &&
               Objects.equals(userId, that.userId);
    }
    @Override public int hashCode() {
        return Objects.hash(playlistId, userId);
    }
}
