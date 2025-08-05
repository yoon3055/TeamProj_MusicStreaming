package com.music.artist.entity;

import com.music.user.entity.User;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "artist_like", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"user_id", "artist_id"})
})
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class ArtistLike {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "artist_id")
    private Artist artist;
}
