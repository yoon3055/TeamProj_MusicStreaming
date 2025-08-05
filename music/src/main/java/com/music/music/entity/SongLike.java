package com.music.music.entity;

import com.music.user.entity.User;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "song_like", uniqueConstraints = {
        @UniqueConstraint(columnNames = {"user_id", "song_id"}) // 중복 좋아요 방지
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SongLike {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // 좋아요 누른 사용자
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    // 좋아요 대상 곡
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "song_id", nullable = false)
    private Song song;
}
