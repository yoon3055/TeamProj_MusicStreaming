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

    // ✅ 좋아요한 음악 및 최근 감상 음악 더미 데이터
    setLikes([
      { id: 'like1', title: '눈 내리는 거리', artist: '발라더', coverUrl: '/images/K-058.jpg' },
      { id: 'like2', title: '여름의 끝', artist: '서정 밴드', coverUrl: '/images/K-059.jpg' },
      { id: 'like3', title: '겨울 바다', artist: '포크 듀오', coverUrl: '/images/K-060.jpg' },
    ]);
    setRecent([
      { id: 'rec1', title: '별빛 아래서', artist: '포크 가수', coverUrl: '/images/K-057.jpg' },
      { id: 'rec2', title: '비 오는 오후', artist: '재즈 트리오', coverUrl: '/images/K-056.jpg' },
      { id: 'rec3', title: '아침 안개', artist: '인디 아티스트', coverUrl: '/images/K-055.jpg' },
    ]);
  }, []);

  const handlePlayPlaylist = (playlist) => {
    let songsToPlay = playlist.songs || [];
    if (!isSubscribed) {
      songsToPlay = songsToPlay.map((s) => ({ ...s, isHighQuality: false }));
    }
    playSong(songsToPlay);
  };

  // 🔧 좋아요/팔로우 상태 변경 핸들러 (API 연동 필요)
  const handleToggleLike = (playlistId) => {
    setPlaylists((prev) =>
      prev.map((pl) =>
        pl.id === playlistId
          ? { ...pl, isLiked: !pl.isLiked, likeCount: pl.isLiked ? pl.likeCount - 1 : pl.likeCount + 1 }
          : pl
      )
    );
    // ❗ TODO: axios.post(`/api/playlists/${playlistId}/like-toggle`);
  };

  const handleToggleFollow = (playlistId) => {
    setPlaylists((prev) =>
      prev.map((pl) =>
        pl.id === playlistId
          ? { ...pl, isFollowed: !pl.isFollowed, followerCount: pl.isFollowed ? pl.followerCount - 1 : pl.followerCount + 1 }
          : pl
      )
    );
    // ❗ TODO: axios.post(`/api/playlists/${playlistId}/follow-toggle`);
  };

  const handleEdit = (playlistId) => {
    alert(`수정 모달 열기: ${playlistId}`);
    // ❗ TODO: 모달 또는 페이지 이동
  };

  const handleDelete = (playlistId) => {
    if (window.confirm('정말 삭제하시겠습니까?')) {
      setPlaylists((prev) => prev.filter((pl) => pl.id !== playlistId));
      // ❗ TODO: axios.delete(`/api/playlists/${playlistId}`);
    }
  };

  const likesTotalPages = Math.ceil(likes.length / 2);
  const recentTotalPages = Math.ceil(recent.length / 2);

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
        <PlaylistBox songs={likes} currentPage={likesCurrentPage} itemsPerPage={2} />
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
        <PlaylistBox songs={recent} currentPage={recentCurrentPage} itemsPerPage={2} />
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