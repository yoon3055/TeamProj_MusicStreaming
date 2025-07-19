// src/pages/PlaylistPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
//import axios from 'axios';
import PropTypes from 'prop-types';

import '../styles/PlaylistPage.css';

// 🌐 플레이리스트 내부 곡 더미 데이터 (각 플레이리스트 ID에 따라 다른 곡 목록 반환)
const DUMMY_PLAYLIST_SONGS = {
  'playlist-id-1': [
    { id: 's1', title: '봄날의 소나타', artist: '클래식 앙상블' },
    { id: 's2', title: '그 여름날의 기억', artist: '인디 밴드' },
    { id: 's3', title: '새벽 감성', artist: '로파이 비트' },
  ],
  'playlist-id-2': [
    { id: 's4', title: '춤추는 불빛', artist: 'EDM 그룹' },
    { id: 's5', title: '리듬 속으로', artist: '팝스타' },
  ],
  'playlist-id-3': [
    { id: 's6', title: '고요한 숲속', artist: '뉴에이지' },
    { id: 's7', title: '편안한 휴식', artist: '피아노 선율' },
  ],
  'playlist-id-4': [ // 추가 더미
    { id: 's8', title: '환상의 세계', artist: 'Dream Weaver' },
  ],
  'playlist-id-5': [ // 추가 더미
    { id: 's9', title: '질주 본능', artist: 'Velocity' },
  ],
  'playlist-id-6': [ // 추가 더미
    { id: 's10', title: '추억의 향기', artist: 'Memory Lane' },
  ],
  'playlist-id-7': [ // 추가 더미
    { id: 's11', title: '여행의 동반자', artist: 'Wanderlust' },
  ],
  'playlist-id-8': [ // 추가 더미
    { id: 's12', title: '깊은 밤의 사색', artist: 'Deep Thinker' },
  ],
};


// ✨ PlaylistSongItem 컴포넌트 (각 플레이리스트 안의 수록곡 표시)
const PlaylistSongItem = ({ song, onPlaySong }) => {
  return (
    <li className="playlist-song-item">
      <div className="song-info-wrapper">
        <Link to={`/song/${song.id}`}> {/* 곡 상세 페이지 링크 */}
          <span className="song-title">{song.title}</span> - <span className="song-artist">{song.artist}</span>
        </Link>
        <button
          onClick={() => onPlaySong(song)} // ✨ 개별 곡 재생 버튼
          className="play-song-item-button"
          aria-label={`${song.title} 재생`}
        >
          <svg viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd"></path></svg>
        </button>
      </div>
    </li>
  );
};
PlaylistSongItem.propTypes = {
  song: PropTypes.shape({
    id: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    artist: PropTypes.string.isRequired,
  }).isRequired,
  onPlaySong: PropTypes.func.isRequired,
};


const PlaylistPage = ({ onPlaySong, onPlayAllPlaylist }) => { // ✨ onPlaySong, onPlayAllPlaylist props 추가
  const [playlists, setPlaylists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedPlaylistId, setExpandedPlaylistId] = useState(null); // ✨ 확장된 플레이리스트 ID

  const token = localStorage.getItem('token'); // 컴포넌트 렌더링 시점에 토큰 로드

  const fetchPlaylists = useCallback(async () => {
    setLoading(true);
    try {
      // 🌐 실제 API 호출 예시 (아래는 더미 데이터로 대체)
      // const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/playlists`, {
      //   headers: { Authorization: `Bearer ${token}` },
      // });
      // setPlaylists(res.data);

      // ✨ 더미 플레이리스트 데이터 (실제 API 응답 구조를 흉내냄)
      const dummyData = [
        { id: 'playlist-id-1', name: '나의 플레이리스트 #1', owner: '나', isPublic: true },
        { id: 'playlist-id-2', name: '드라이브 필수곡', owner: '관리자', isPublic: false },
        { id: 'playlist-id-3', name: '재즈와 커피 한 잔', owner: '나', isPublic: true },
        // 더 많은 플레이리스트를 추가하여 스크롤 테스트
        { id: 'playlist-id-4', name: '집중력을 위한 BGM', owner: '나', isPublic: true },
        { id: 'playlist-id-5', name: '스트레스 해소 락', owner: '나', isPublic: true },
        { id: 'playlist-id-6', name: '비오는 날 감성', owner: '나', isPublic: false },
        { id: 'playlist-id-7', name: '주말 힐링곡', owner: '나', isPublic: true },
        { id: 'playlist-id-8', name: '새벽 운동 플레이리스트', owner: '나', isPublic: false },
      ];
      setPlaylists(dummyData);
      console.log("🌐 사용자 플레이리스트 목록 로드 성공 (사이드바):", dummyData);
    } catch (err) {
      console.error('🌐 사용자 플레이리스트 목록 가져오기 실패 (사이드바):', err);
      setPlaylists([]);
    } finally {
      setLoading(false);
    }
  }, [token]); // eslint-disable-line react-hooks/exhaustive-deps


  useEffect(() => {
    fetchPlaylists();
  }, [fetchPlaylists]);

  // ✨ 플레이리스트 확장/축소 토글 핸들러
  const handlePlaylistToggle = (id) => {
    setExpandedPlaylistId(prevId => (prevId === id ? null : id));
  };

  // ✨ 앨범(플레이리스트) 재생 버튼 핸들러
  const handlePlayAlbumButton = (playlistId) => {
    // 실제로는 playlistId를 이용해서 해당 플레이리스트의 모든 곡을 API에서 가져온 후 재생목록에 담아야 합니다.
    const playlistData = playlists.find(pl => pl.id === playlistId);
    if (playlistData) {
      onPlayAllPlaylist(playlistData); // 부모로부터 전달받은 콜백 사용
    }
  };


  return (
    <div className="user-playlists-section-container"> {/* SidebarContent의 user-specific-section에 해당 */}
      {loading ? (
        <div className="playlist-page-loading">플레이리스트를 불러오는 중...</div>
      ) : playlists.length === 0 ? (
        <p className="playlist-page-empty-message">생성된 플레이리스트가 없습니다.</p>
      ) : (
        <ul className="playlist-text-list"> {/* ✨ 텍스트 기반 리스트 컨테이너 */}
          {playlists.map((pl) => (
            <li key={pl.id} className="playlist-list-item">
              <div className="playlist-list-item-header">
                <span className="playlist-name" onClick={() => handlePlaylistToggle(pl.id)}>{pl.name}</span> {/* 이름 클릭 시 토글 */}
                <span className="toggle-icon" onClick={() => handlePlaylistToggle(pl.id)}>{expandedPlaylistId === pl.id ? '▼' : '▶'}</span>
                <button
                  onClick={() => handlePlayAlbumButton(pl.id)} // ✨ 앨범(플레이리스트) 재생 버튼
                  className="play-album-button"
                  aria-label={`${pl.name} 전체 재생`}
                >
                  <svg viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd"></path></svg>
                </button>
              </div>
              {expandedPlaylistId === pl.id && ( // ✨ 확장된 플레이리스트의 수록곡 표시
                <ul className="playlist-song-list">
                  {/* 실제 앱에서는 이 시점에 API 호출로 곡 목록을 가져오는 것이 효율적입니다. */}
                  {DUMMY_PLAYLIST_SONGS[pl.id] ? (
                    DUMMY_PLAYLIST_SONGS[pl.id].map(song => (
                      <PlaylistSongItem key={song.id} song={song} onPlaySong={onPlaySong} /> 
                    ))
                  ) : (
                    <li className="playlist-song-item empty-song-list">수록곡이 없습니다.</li>
                  )}
                </ul>
              )}
            </li>
          ))}
        </ul>
      )}
      {/* 새 플레이리스트 만들기 버튼 (목록 하단에 텍스트 링크 형태로) */}
      <Link to="/create-playlist" className="playlist-create-button">
        + 새 플레이리스트 만들기
      </Link>
    </div>
  );
};

PlaylistPage.propTypes = {
  onPlaySong: PropTypes.func.isRequired,
  onPlayAllPlaylist: PropTypes.func.isRequired,
};

export default PlaylistPage;