package com.music.music.entity;

import com.music.user.entity.User;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "album_like", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"user_id", "album_id"})
})
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class AlbumLike {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "album_id")
    private Album album;
}
