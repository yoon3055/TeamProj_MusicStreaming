package com.music.playlist.service;

import com.music.playlist.dto.PlaylistDto;
import com.music.playlist.dto.PlaylistSongDto;
import com.music.playlist.entity.Playlist;
import com.music.playlist.entity.PlaylistLike;
import com.music.playlist.entity.PlaylistLikeId;
import com.music.playlist.entity.PlaylistSong;
import com.music.playlist.repository.PlaylistLikeRepository;
import com.music.playlist.repository.PlaylistRepository;
import com.music.playlist.repository.PlaylistSongRepository;
import com.music.music.entity.Song;
import com.music.music.repository.SongRepository;
import com.music.user.entity.User;
import com.music.user.repository.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PlaylistService {

    private final PlaylistRepository     playlistRepo;
    private final PlaylistSongRepository songRepo;
    private final PlaylistLikeRepository likeRepo;
    private final SongRepository         songMasterRepo;
    private final UserRepository         userRepo;

    /* 1) 생성 */
    @Transactional
    public PlaylistDto.Response createPlaylist(PlaylistDto.Request req) {
        User user = userRepo.getReferenceById(req.getUserId());
        Playlist p = Playlist.builder()
                .user(user)
                .title(req.getTitle())
                .isPublic(req.isPublic())
                .build();
        playlistRepo.save(p);
        return PlaylistDto.Response.from(p);
    }

    /* 2) 내 목록 */
    @Transactional(readOnly = true)
    public List<PlaylistDto.SimpleResponse> listMyPlaylists(Long userId) {
        return playlistRepo.findByUserId(userId).stream()
                .map(PlaylistDto.SimpleResponse::from)
                .collect(Collectors.toList());
    }

    /* 3) 상세 */
    @Transactional(readOnly = true)
    public PlaylistDto.Response getPlaylist(Long playlistId) {
        Playlist p = playlistRepo.findById(playlistId)
                .orElseThrow(() ->
                        new EntityNotFoundException("플레이리스트가 없습니다: " + playlistId));
        return PlaylistDto.Response.from(p);
    }

    /* 4) 수정 */
    @Transactional
    public PlaylistDto.Response updatePlaylist(Long playlistId,
                                               PlaylistDto.Request req) {
        Playlist p = playlistRepo.findById(playlistId)
                .orElseThrow(() ->
                        new EntityNotFoundException("플레이리스트가 없습니다: " + playlistId));
        p.setTitle(req.getTitle());
        p.setPublic(req.isPublic());
        return PlaylistDto.Response.from(p);
    }

    /* 5) 삭제 */
    @Transactional
    public void deletePlaylist(Long playlistId) {
        if (!playlistRepo.existsById(playlistId)) {
            throw new EntityNotFoundException("플레이리스트가 없습니다: " + playlistId);
        }
        playlistRepo.deleteById(playlistId);
    }

    /* 6) 트랙 추가 */
    @Transactional
    public void addTrack(PlaylistSongDto.Request req) {
        Long plId = req.getPlaylistId();
        Long sId  = req.getSongId();

        if (songRepo.existsByPlaylistIdAndSongId(plId, sId)) {
            throw new IllegalStateException("이미 추가된 곡입니다.");
        }

        Playlist p = playlistRepo.getReferenceById(plId);
        Song     s = songMasterRepo.getReferenceById(sId);

        int nextOrder = songRepo
                .findByPlaylistIdOrderBySongOrderAsc(plId)
                .size() + 1;

        PlaylistSong ps = PlaylistSong.builder()
                .playlistId(plId)          // ★ IdClass 방식 → 필드별 세터
                .songId(sId)
                .playlist(p)
                .song(s)
                .songOrder(nextOrder)
                .build();

        songRepo.save(ps);
    }

    /* 7) 트랙 목록 */
    @Transactional(readOnly = true)
    public List<PlaylistSongDto.Response> listTracks(Long playlistId) {
    	return songRepo.findByPlaylistIdOrderBySongOrderAsc(playlistId).stream()
                .map(PlaylistSongDto.Response::from)
                .collect(Collectors.toList());
    }

    /* 8) 트랙 삭제 */
    @Transactional
    public void removeTrack(Long playlistId, Long songId) {
    	songRepo.deleteByPlaylistIdAndSongId(playlistId, songId);
    }
    
    /* 9) 공개 비공개 전환*/
    @Transactional
    public PlaylistDto.Response changeVisibility(Long id, boolean isPublic) {
        Playlist p = playlistRepo.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("플레이리스트 없음: " + id));
        p.setPublic(isPublic);
        return PlaylistDto.Response.from(p);
    }
    
    /* 10) 공개 플레이리스트 검색 + 페이징 */
    @Transactional(readOnly = true)
    public Page<PlaylistDto.SimpleResponse> searchPublic(String keyword, Pageable pageable) {
        return playlistRepo
                .findByTitleContainingIgnoreCaseAndIsPublicTrue(keyword, pageable)
                .map(PlaylistDto.SimpleResponse::from);
    }
    
    /* 11) 좋아요 토글 */
    @Transactional
    public boolean toggleLike(Long playlistId, Long userId) {

        PlaylistLikeId id = new PlaylistLikeId(playlistId, userId);

        if (likeRepo.existsById(id)) {        // 이미 좋아요 ⇒ 취소
            likeRepo.deleteById(id);
            playlistRepo.getReferenceById(playlistId).decreaseLike();
            return false;                     // now un-liked
        }

        // 좋아요 추가
        Playlist p = playlistRepo.getReferenceById(playlistId);
        User     u = userRepo.getReferenceById(userId);

        PlaylistLike like = PlaylistLike.builder()
                .id(id)
                .playlist(p)
                .user(u)
                .build();

        likeRepo.save(like);
        p.increaseLike();
        return true;                          // now liked
    }
    
    /* 12) 조회수 +1 후 상세 반환 */
    @Transactional
    public PlaylistDto.Response getPlaylistWithView(Long playlistId) {
        Playlist p = playlistRepo.findById(playlistId)
                .orElseThrow(() -> new EntityNotFoundException("플레이리스트 없음"));
        p.increaseView();                       // 조회수 +1
        return PlaylistDto.Response.from(p);
    }
}




