// src/pages/PlaylistPage.jsx
import React, { useEffect, useState, useContext } from 'react';
import { MusicPlayerContext } from '../context/MusicPlayerContext';
import { AuthContext } from '/src/context/AuthContext.jsx';
import PlaylistDrawer from '../component/PlaylistDrawer';

import '../styles/PlaylistPageOverride.css';

const PlaylistPage = () => {
  const { playSong } = useContext(MusicPlayerContext);
  const { user } = useContext(AuthContext);

  const [publicPlaylists, setPublicPlaylists] = useState([]);
  const [userPlaylists, setUserPlaylists] = useState([]);

  useEffect(() => {
    // 예시 더미 데이터
    setPublicPlaylists([
      {
        id: 'pl1',
        title: '힐링 플레이리스트',
        artist: 'Various Artists',
        coverUrl: '/images/playlist1.jpg',
        ownerId: 'otherUser',
        liked: false,
        likeCount: 12,
        followed: false,
        followerCount: 5,
        songs: [
          { id: 's1', title: '봄날의 소나타', artist: '클래식 앙상블', isHighQuality: true },
          { id: 's2', title: '그 여름날의 기억', artist: '인디 밴드', isHighQuality: false },
        ],
      },
    ]);

    if (user) {
      setUserPlaylists([
        {
          id: 'pl2',
          title: '나의 플레이리스트',
          artist: user.nickname,
          coverUrl: '/images/playlist2.jpg',
          ownerId: user.id,
          liked: true,
          likeCount: 23,
          followed: true,
          followerCount: 8,
          songs: [
            { id: 's3', title: '춤추는 불빛', artist: 'EDM 그룹', isHighQuality: true },
            { id: 's4', title: '리듬 속으로', artist: '팝스타', isHighQuality: false },
          ],
        },
      ]);
    }
  }, [user]);

  const handlePlayPlaylist = (playlist) => {
    let songsToPlay = playlist.songs.map(song => ({
      ...song,
      isHighQuality: user?.subscriptionPlan?.supportsHiFi ?? false,
    }));
    playSong(songsToPlay);
  };

  const toggleLike = (id, isUserOwned) => {
    if (!user) return alert('로그인이 필요합니다.');
    const updater = isUserOwned ? setUserPlaylists : setPublicPlaylists;
    updater(prev =>
      prev.map(p =>
        p.id === id
          ? { ...p, liked: !p.liked, likeCount: p.liked ? p.likeCount - 1 : p.likeCount + 1 }
          : p
      )
    );
  };

  const toggleFollow = (id, isUserOwned) => {
    if (!user) return alert('로그인이 필요합니다.');
    const updater = isUserOwned ? setUserPlaylists : setPublicPlaylists;
    updater(prev =>
      prev.map(p =>
        p.id === id
          ? {
              ...p,
              followed: !p.followed,
              followerCount: p.followed ? p.followerCount - 1 : p.followerCount + 1,
            }
          : p
      )
    );
  };

  const handleEdit = (id) => {
    alert(`플레이리스트 ${id} 수정 기능`);
  };

  const handleDelete = (id) => {
    const confirmed = window.confirm('정말 삭제하시겠습니까?');
    if (confirmed) {
      setUserPlaylists(prev => prev.filter(p => p.id !== id));
    }
  };

  const renderPlaylistCard = (playlist, isUserOwned = false) => (
    <div key={playlist.id} className="playlist-card">
      <img src={playlist.coverUrl} alt={playlist.title} className="playlist-cover" />
      <div className="playlist-info">
        <h3>{playlist.title}</h3>
        <p>{playlist.artist}</p>
        <div className="playlist-buttons">
          <button onClick={() => handlePlayPlaylist(playlist)}>▶ 전체 재생</button>
          <button onClick={() => toggleLike(playlist.id, isUserOwned)}>
            {playlist.liked ? '❤️ 좋아요 취소' : '🤍 좋아요'} ({playlist.likeCount})
          </button>
          <button onClick={() => toggleFollow(playlist.id, isUserOwned)}>
            {playlist.followed ? '✔ 팔로우 중' : '➕ 팔로우'} ({playlist.followerCount})
          </button>
          {isUserOwned && (
            <>
              <button onClick={() => handleEdit(playlist.id)}>✏️ 수정</button>
              <button onClick={() => handleDelete(playlist.id)}>🗑 삭제</button>
            </>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <main style={{ padding: 20 }}>
      
      <PlaylistDrawer
        title="추천 플레이리스트"
        initialData={publicPlaylists}
        onPlayTheme={handlePlayPlaylist}
        cardType="album"
        gridLayout={true}
        cardsPerPage={9}
      />

      <h2 style={{ marginTop: 40 }}>🎧 유저 전용 플레이리스트</h2>
      <div className="playlist-list">
        {userPlaylists.map(playlist => renderPlaylistCard(playlist, true))}
      </div>
    </main>
  );
};

export default PlaylistPage;
