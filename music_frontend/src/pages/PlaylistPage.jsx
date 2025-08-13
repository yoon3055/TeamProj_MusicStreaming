// src/pages/PlaylistPage.jsx

import React, { useEffect, useState, useContext } from 'react';
import PlaylistDrawer from '../component/PlaylistDrawer';
import PlaylistBox from '../component/PlaylistBox';
import Pagination from '../component/Pagination';
import { MusicPlayerContext } from '../context/MusicPlayerContext';
import { AuthContext } from '../context/AuthContext';

import '../styles/PlaylistPageOverride.css';
import '../styles/PlaylistBox.css';

const PlaylistPage = () => {
  const { playSong } = useContext(MusicPlayerContext);
  const { isSubscribed } = useContext(AuthContext);

  const [playlists, setPlaylists] = useState([]);
  const [likes, setLikes] = useState([]);
  const [recent, setRecent] = useState([]);
  const [likesCurrentPage, setLikesCurrentPage] = useState(1);
  const [recentCurrentPage, setRecentCurrentPage] = useState(1);

  useEffect(() => {
    // ✅ 더미 데이터 (백엔드 API 연동 시 교체 필요)
    setPlaylists([
      {
        id: 'pl1',
        title: '힐링 플레이리스트',
        artist: 'Various Artists',
        coverUrl: '/images/playlist1.jpg',
        songCount: 10,
        updatedAt: '2024.07.10',
        likeCount: 12,
        followerCount: 32,
        isLiked: true,
        isFollowed: false,
        songs: [
          { id: 's1', title: '봄날의 소나타', artist: '클래식 앙상블', isHighQuality: true },
          { id: 's2', title: '그 여름날의 기억', artist: '인디 밴드', isHighQuality: false },
        ],
      },
      {
        id: 'pl2',
        title: '댄스 팝 모음',
        artist: 'Various Artists',
        coverUrl: '/images/playlist2.jpg',
        songCount: 8,
        updatedAt: '2024.07.08',
        likeCount: 21,
        followerCount: 45,
        isLiked: false,
        isFollowed: true,
        songs: [
          { id: 's3', title: '춤추는 불빛', artist: 'EDM 그룹', isHighQuality: true },
          { id: 's4', title: '리듬 속으로', artist: '팝스타', isHighQuality: false },
        ],
      },
    ]);

    // ✅ 좋아요한 음악 및 최근 감상 음악 더미 데이터 (새로운 필드 추가)
    setLikes([
      { id: 'like1', title: '눈 내리는 거리', artist: '발라더', coverUrl: '/images/K-058.jpg', likeCount: 50, isLiked: true, isFollowed: true },
      { id: 'like2', title: '여름의 끝', artist: '서정 밴드', coverUrl: '/images/K-059.jpg', likeCount: 25, isLiked: false, isFollowed: false },
      { id: 'like3', title: '겨울 바다', artist: '포크 듀오', coverUrl: '/images/K-060.jpg', likeCount: 78, isLiked: true, isFollowed: false },
      { id: 'like4', title: '가을의 속삭임', artist: '발라드 가수', coverUrl: '/images/K-061.jpg', likeCount: 42, isLiked: false, isFollowed: true }
    ]);
    setRecent([
      { id: 'rec1', title: '별빛 아래서', artist: '포크 가수', coverUrl: '/images/K-057.jpg', likeCount: 10, isLiked: true, isFollowed: false },
      { id: 'rec2', title: '비 오는 오후', artist: '재즈 트리오', coverUrl: '/images/K-056.jpg', likeCount: 33, isLiked: true, isFollowed: true },
      { id: 'rec3', title: '아침 안개', artist: '인디 아티스트', coverUrl: '/images/K-055.jpg', likeCount: 19, isLiked: false, isFollowed: false },
      { id: 'rec4', title: '밤의 멜로디', artist: '클래식 연주자', coverUrl: '/images/K-054.jpg', likeCount: 88, isLiked: true, isFollowed: true }
    ]);
  }, []);

  const handlePlayPlaylist = (playlist) => {
    let songsToPlay = playlist.songs || [];
    if (!isSubscribed) {
      songsToPlay = songsToPlay.map((s) => ({ ...s, isHighQuality: false }));
    }
    playSong(songsToPlay);
  };

  const handleToggleLike = (playlistId) => {
    setPlaylists((prev) =>
      prev.map((pl) =>
        pl.id === playlistId
          ? { ...pl, isLiked: !pl.isLiked, likeCount: pl.isLiked ? pl.likeCount - 1 : pl.likeCount + 1 }
          : pl
      )
    );
    // ❗ TODO: 좋아요 상태 변경 API 호출 로직 추가
  };

  const handleToggleLikeForBox = (songId, section) => {
    if (section === 'likes') {
      setLikes(prev => prev.map(s => s.id === songId ? { ...s, isLiked: !s.isLiked, likeCount: s.isLiked ? s.likeCount - 1 : s.likeCount + 1 } : s));
      // ❗ TODO: 좋아요 상태 변경 API 호출 로직 추가
    } else if (section === 'recent') {
      setRecent(prev => prev.map(s => s.id === songId ? { ...s, isLiked: !s.isLiked, likeCount: s.isLiked ? s.likeCount - 1 : s.likeCount + 1 } : s));
      // ❗ TODO: 좋아요 상태 변경 API 호출 로직 추가
    }
  };
  
  const handleToggleFollow = (playlistId) => {
    setPlaylists((prev) =>
      prev.map((pl) =>
        pl.id === playlistId
          ? { ...pl, isFollowed: !pl.isFollowed, followerCount: pl.isFollowed ? pl.followerCount - 1 : pl.followerCount + 1 }
          : pl
      )
    );
    // ❗ TODO: 팔로우 상태 변경 API 호출 로직 추가
  };

  /* ✅ 팔로우 기능을 모달 대신 토글로 변경 */
  const handleToggleFollowForBox = (songId, section) => {
    if (section === 'likes') {
      setLikes(prev => prev.map(s => s.id === songId ? { ...s, isFollowed: !s.isFollowed } : s));
      // ❗ TODO: 팔로우 상태 변경 API 호출 로직 추가
    } else if (section === 'recent') {
      setRecent(prev => prev.map(s => s.id === songId ? { ...s, isFollowed: !s.isFollowed } : s));
      // ❗ TODO: 팔로우 상태 변경 API 호출 로직 추가
    }
  };

  const handleEdit = (playlistId) => {
    alert(`수정 모달 열기: ${playlistId}`);
    // ❗ TODO: 모달 또는 페이지 이동
  };

  const handleDelete = (playlistId) => {
    if (window.confirm('정말 삭제하시겠습니까?')) {
      setPlaylists((prev) => prev.filter((pl) => pl.id !== playlistId));
      // ❗ TODO: 삭제 API 호출 로직 추가
    }
  };

  /* ✅ itemsPerPage를 4로 변경하여 totalPages를 다시 계산 */
  const itemsPerPage = 4;
  const likesTotalPages = Math.ceil(likes.length / itemsPerPage);
  const recentTotalPages = Math.ceil(recent.length / itemsPerPage);

  return (
    <div className="playlist-page-container">
      <h1 className="playlist-page-title">추천 플레이리스트</h1>

      <PlaylistDrawer
        title="추천 플레이리스트"
        initialData={playlists}
        onPlayTheme={handlePlayPlaylist}
        cardType="album"
        gridLayout={true}
        cardsPerPage={6}
        showMetaOverlay={true}
        onLike={handleToggleLike}
        onFollow={handleToggleFollow}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      {/* ✅ 좋아요한 음악, 최근 들은 음악 섹션 */}
      <div className="playlist-section-box">
        <div className="section-header">
          <h2>좋아요한 음악</h2>
          <div className="pagination-nav">
            <Pagination
              currentPage={likesCurrentPage}
              totalPages={likesTotalPages}
              onPageChange={setLikesCurrentPage}
            />
          </div>
        </div>
        <PlaylistBox 
          songs={likes} 
          currentPage={likesCurrentPage} 
          itemsPerPage={itemsPerPage}
          onToggleLike={(id) => handleToggleLikeForBox(id, 'likes')}
          onToggleFollow={(id) => handleToggleFollowForBox(id, 'likes')}
        />
        <div className="pagination-dots">
          {Array.from({ length: likesTotalPages }).map((_, idx) => (
            <button
              key={idx}
              className={`pagination-dot ${likesCurrentPage === idx + 1 ? 'active' : ''}`}
              onClick={() => setLikesCurrentPage(idx + 1)}
              aria-label={`페이지 ${idx + 1}`}
            />
          ))}
        </div>
      </div>

      <div className="playlist-section-box">
        <div className="section-header">
          <h2>최근 감상한 음악</h2>
          <div className="pagination-nav">
            <Pagination
              currentPage={recentCurrentPage}
              totalPages={recentTotalPages}
              onPageChange={setRecentCurrentPage}
            />
          </div>
        </div>
        <PlaylistBox 
          songs={recent} 
          currentPage={recentCurrentPage} 
          itemsPerPage={itemsPerPage}
          onToggleLike={(id) => handleToggleLikeForBox(id, 'recent')}
          onToggleFollow={(id) => handleToggleFollowForBox(id, 'recent')}
        />
        <div className="pagination-dots">
          {Array.from({ length: recentTotalPages }).map((_, idx) => (
            <button
              key={idx}
              className={`pagination-dot ${recentCurrentPage === idx + 1 ? 'active' : ''}`}
              onClick={() => setRecentCurrentPage(idx + 1)}
              aria-label={`페이지 ${idx + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default PlaylistPage;