import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaPlus, FaCheck, FaTimes, FaMusic, FaSearch } from 'react-icons/fa';
import { createPlaylist, addTrackToPlaylist, fetchAllSongs } from '../api/playlistApi';
import '../styles/CreatePlaylistPage.css';

const CreatePlaylistPage = () => {
  const navigate = useNavigate();
  const [playlistTitle, setPlaylistTitle] = useState('');
  const [allSongs, setAllSongs] = useState([]);
  const [selectedSongs, setSelectedSongs] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [songsLoading, setSongsLoading] = useState(true);

  // 컴포넌트 마운트 시 모든 노래 목록 가져오기
  useEffect(() => {
    const loadSongs = async () => {
      try {
        setSongsLoading(true);
        const songs = await fetchAllSongs();
        console.log('받은 노래 데이터:', songs);
        // 응답이 배열인지 확인하고, 아니면 빈 배열로 설정
        setAllSongs(Array.isArray(songs) ? songs : []);
      } catch (error) {
        console.error('노래 목록 로드 실패:', error);
        alert('노래 목록을 불러오는데 실패했습니다.');
        setAllSongs([]); // 오류 시 빈 배열로 설정
      } finally {
        setSongsLoading(false);
      }
    };

    loadSongs();
  }, []);

  // 검색 필터링된 노래 목록
  const filteredSongs = Array.isArray(allSongs) ? allSongs.filter(song =>
    song.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (typeof song.artist === 'object' ? song.artist?.name?.toLowerCase() : song.artist?.toLowerCase())?.includes(searchTerm.toLowerCase())
  ) : [];

  // 노래 선택/해제
  const toggleSongSelection = (song) => {
    setSelectedSongs(prev => {
      const isSelected = prev.some(s => s.id === song.id);
      if (isSelected) {
        return prev.filter(s => s.id !== song.id);
      } else {
        return [...prev, song];
      }
    });
  };

  // 플레이리스트 생성
  const handleCreatePlaylist = async (e) => {
    e.preventDefault();
    
    if (!playlistTitle.trim()) {
      alert('플레이리스트 제목을 입력해주세요.');
      return;
    }

    try {
      setLoading(true);
      
      // 1. 플레이리스트 생성
      const newPlaylist = await createPlaylist(playlistTitle);
      console.log('플레이리스트 생성 성공:', newPlaylist);

      // 2. 선택된 노래들을 플레이리스트에 추가
      if (selectedSongs.length > 0) {
        for (let i = 0; i < selectedSongs.length; i++) {
          await addTrackToPlaylist(newPlaylist.id, selectedSongs[i].id, i + 1);
        }
      }

      alert(`플레이리스트 "${playlistTitle}"이(가) 생성되었습니다!`);
      navigate('/');
      
    } catch (error) {
      console.error('플레이리스트 생성 실패:', error);
      alert('플레이리스트 생성에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="create-playlist-header">
        <h1>
          <FaPlus className="header-icon" />
          새 플레이리스트 만들기
        </h1>
        <button 
          className="close-btn"
          onClick={() => navigate(-1)}
        >
          <FaTimes />
        </button>
      </div>

      <form onSubmit={handleCreatePlaylist} className="create-playlist-form">
        {/* 플레이리스트 기본 정보 */}
        <div className="playlist-info-section">
          <h2>플레이리스트 정보</h2>
          
          <div className="form-group">
            <label htmlFor="title">플레이리스트 제목 *</label>
            <input
              type="text"
              id="title"
              value={playlistTitle}
              onChange={(e) => setPlaylistTitle(e.target.value)}
              placeholder="플레이리스트 제목을 입력하세요"
              required
            />
          </div>


        </div>

        <div className="song-selection-section">
          {/* <h2>
            노래 선택 
            <span className="selected-count">({selectedSongs.length}곡 선택됨)</span>
          </h2> */}

          {/* <div className="search-bar">
            <FaSearch className="search-icon" />
            <input
              type="text"
              placeholder="노래 제목이나 아티스트로 검색..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div> */}

          {/* 선택된 노래 목록 */}
          {selectedSongs.length > 0 && (
            <div className="selected-songs">
              <h3>선택된 노래</h3>
              <div className="selected-songs-list">
                {selectedSongs.map((song, index) => (
                  <div key={song.id} className="selected-song-item">
                    <span className="song-order">{index + 1}</span>
                    <div className="song-info">
                      <span className="song-title">{song.title}</span>
                      <span className="song-artist">{typeof song.artist === 'object' ? song.artist?.name : song.artist}</span>
                    </div>
                    <button
                      type="button"
                      className="remove-btn"
                      onClick={() => toggleSongSelection(song)}
                    >
                      <FaTimes />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 전체 노래 목록 */}
          <div className="all-songs">
            <h3>모든 노래</h3>
            {songsLoading ? (
              <div className="loading">노래 목록을 불러오는 중...</div>
            ) : (
              <div className="songs-grid">
                {filteredSongs.map((song) => {
                  const isSelected = selectedSongs.some(s => s.id === song.id);
                  return (
                    <div
                      key={song.id}
                      className={`song-card ${isSelected ? 'selected' : ''}`}
                      onClick={() => toggleSongSelection(song)}
                    >
                      <div className="song-card-content">
                        <FaMusic className="music-icon" />
                        <div className="song-details">
                          <h4 className="song-title">{song.title}</h4>
                          <p className="song-artist">{typeof song.artist === 'object' ? song.artist?.name : song.artist}</p>
                        </div>
                        <div className="selection-indicator">
                          {isSelected ? <FaCheck /> : <FaPlus />}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
            
            {!songsLoading && filteredSongs.length === 0 && (
              <div className="no-results">
                검색 결과가 없습니다.
              </div>
            )}
          </div>
        </div>

        {/* 생성 버튼 */}
        <div className="form-actions">
          <button
            type="button"
            className="cancel-btn"
            onClick={() => navigate(-1)}
          >
            취소
          </button>
          <button
            type="submit"
            className="create-btn"
            disabled={loading || !playlistTitle.trim()}
          >
            {loading ? '생성 중...' : '플레이리스트 생성'}
          </button>
        </div>
      </form>
    </>
  );
};

export default CreatePlaylistPage;
