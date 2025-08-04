package com.music.playlist.entity;

import com.music.user.entity.User;
import jakarta.persistence.*;
import lombok.*;

import java.io.Serializable;
import java.time.LocalDateTime;

@Entity
@Table(name = "playlist_like")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor @Builder
public class PlaylistLike {

	@EmbeddedId
	private PlaylistLikeId id;

    @MapsId("playlistId")
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "playlist_id")
    private Playlist playlist;

    @MapsId("userId")
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    @Column(name = "liked_at", nullable = false, updatable = false)
    private LocalDateTime likedAt;

    @PrePersist
    protected void onLike() { this.likedAt = LocalDateTime.now(); }
}
