package com.music.interaction.service;

import com.music.artist.repository.ArtistRepository;
import com.music.interaction.dto.CommentDto;
import com.music.interaction.dto.LikeDto;
import com.music.interaction.dto.ReportDto;
import com.music.interaction.entity.Comment;
import com.music.interaction.entity.Like;
import com.music.interaction.entity.Report;
import com.music.interaction.repository.CommentRepository;
import com.music.interaction.repository.LikeRepository;
import com.music.interaction.repository.ReportRepository;
import com.music.music.entity.Song;
import com.music.music.entity.Album;
import com.music.artist.entity.Artist;
import com.music.music.repository.AlbumRepository;
import com.music.music.repository.SongRepository;
import com.music.user.entity.User;
import com.music.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class InteractionService {

	private final CommentRepository commentRepository;
	private final LikeRepository likeRepository;
	private final ReportRepository reportRepository;
	private final UserRepository userRepository;
	private final SongRepository songRepository;
	private final AlbumRepository albumRepository;
	private final ArtistRepository artistRepository;


	// ====== COMMENT ======
	public CommentDto.Response addComment(CommentDto.Request request) {
		User user = userRepository.findById(request.getUserId())
				.orElseThrow(() -> new RuntimeException("User not found"));
		Song song = songRepository.findById(request.getSongId())
				.orElseThrow(() -> new RuntimeException("Song not found"));

		Comment comment = new Comment(user, song, request.getContent(), LocalDateTime.now());
		commentRepository.save(comment);

		return CommentDto.Response.from(comment);
	}

	public List<CommentDto.SongCommentResponse> getCommentsBySong(Long songId) {
		return commentRepository.findBySongIdOrderByCreatedAtDesc(songId).stream()
				.map(CommentDto.SongCommentResponse::from).collect(Collectors.toList());
	}

	public CommentDto.Response updateComment(Long commentId, CommentDto.UpdateRequest request) {
		Comment comment = commentRepository.findById(commentId)
				.orElseThrow(() -> new RuntimeException("Comment not found"));
		comment.setContent(request.getContent());
		return CommentDto.Response.from(comment);
	}

	public void deleteComment(Long commentId) {
		commentRepository.deleteById(commentId);
	}

	// ====== LIKE ======
	public LikeDto.Response toggleLike(LikeDto.Request request) {
		User user = userRepository.findById(request.getUserId())
				.orElseThrow(() -> new RuntimeException("User not found"));
		Song song = songRepository.findById(request.getSongId())
				.orElseThrow(() -> new RuntimeException("Song not found"));

		// 좋아요 여부 체크
		Optional<Like> existingLike = likeRepository.findByUserIdAndSongId(user.getId(), song.getId());

		if (existingLike.isPresent()) {
			// 이미 좋아요 있으면 삭제
			likeRepository.delete(existingLike.get());
			return null; // 좋아요 취소됨
		}

		// 없으면 새로 저장
		Like like = new Like(user, song, LocalDateTime.now());
		likeRepository.save(like);
		return LikeDto.Response.from(like);
	}

	// ====== LIKE 조회 ======
	public List<LikeDto.SimpleResponse> getLikesBySong(Long songId) {
		return likeRepository.findBySongId(songId).stream().map(LikeDto.SimpleResponse::from)
				.collect(Collectors.toList());
	}
	
	// ====== LIKE 수 조회 ======
	public long countLikesBySongId(Long songId) {
	    return likeRepository.countBySongId(songId);
	}
	public long countLikesByAlbumId(Long albumId) {
	    return likeRepository.countBySong_AlbumId(albumId);
	}

	public long countLikesByArtistId(Long artistId) {
	    return likeRepository.countBySong_ArtistId(artistId);
	}
	
	// ====== LIKE COUNT 증가 ======
	public boolean increaseLikeCount(String type, Long id) {
	    switch (type.toLowerCase()) {
	        case "song":
	            Song song = songRepository.findById(id)
	                    .orElseThrow(() -> new RuntimeException("곡을 찾을 수 없습니다."));
	            song.setLikeCount(song.getLikeCount() + 1);
	            return true;

	        case "album":
	            Album album = albumRepository.findById(id)
	                    .orElseThrow(() -> new RuntimeException("앨범을 찾을 수 없습니다."));
	            album.setLikeCount(album.getLikeCount() + 1);
	            return true;

	        case "artist":
	            Artist artist = artistRepository.findById(id)
	                    .orElseThrow(() -> new RuntimeException("아티스트를 찾을 수 없습니다."));
	            artist.setLikeCount(artist.getLikeCount() + 1);
	            return true;

	        default:
	            return false;
	    }
	}

	// ====== REPORT ======
	public ReportDto.Response addReport(ReportDto.Request request) {
		User user = userRepository.findById(request.getUserId())
				.orElseThrow(() -> new RuntimeException("User not found"));

		if (reportRepository.existsByUserIdAndTargetTypeAndTargetId(request.getUserId(), request.getTargetType(),
				request.getTargetId())) {
			throw new RuntimeException("이미 신고했습니다.");
		}

		Report report = new Report(user, request.getTargetType(), request.getTargetId(), request.getReason(),
				LocalDateTime.now());
		reportRepository.save(report);

		return ReportDto.Response.from(report);
	}

	public List<ReportDto.SimpleResponse> getReportsByTarget(String targetType, Long targetId) {
		return reportRepository.findByTargetTypeAndTargetIdOrderByCreatedAtDesc(targetType, targetId).stream()
				.map(ReportDto.SimpleResponse::from).collect(Collectors.toList());
	}
}
