package com.music.follow.entity;

import com.music.user.entity.User;
import com.music.artist.entity.Artist; // 아티스트 Entity가 따로 있어야 함
import jakarta.persistence.*;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;


@Getter
@Setter
@Entity
@Table(name = "follow", uniqueConstraints = {
        @UniqueConstraint(columnNames = {"user_id", "artist_id"})
})

public class ArtistFollow {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "user_id")
    private User user;

    @ManyToOne(optional = false)
    @JoinColumn(name = "artist_id")
    private Artist artist;

    @Column(name = "followed_at", nullable = false)
    private LocalDateTime followedAt;

    public ArtistFollow() {}

    @Builder
    public ArtistFollow(User user, Artist artist, LocalDateTime followedAt) {
        this.user = user;
        this.artist = artist;
        this.followedAt = followedAt;
    }

    // Lombok 사용 시 @Getter/@Setter 추가
}
