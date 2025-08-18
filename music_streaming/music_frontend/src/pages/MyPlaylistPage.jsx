import React, { useState, useEffect, useCallback, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { syncService } from '../services/syncService';
import { Plus, Music, Lock, Globe, Trash2, Edit3 } from 'lucide-react';
import '../styles/MyPlaylistsPage.css';

const MyPlaylistsPage = () => {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [playlists, setPlaylists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedPlaylist, setSelectedPlaylist] = useState(null);

  const loadPlaylists = useCallback(async () => {
    if (!user) return;
    
    setLoading(true);
    setError(null);
    try {
      const data = await syncService.getUserPlaylists(user.id);
      setPlaylists(data);
    } catch (err) {
      console.error('플레이리스트 불러오기 실패:', err);
      setError('플레이리스트를 불러오는 데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadPlaylists();
  }, [loadPlaylists]);

  const handleCreatePlaylist = () => {
    navigate('/create-playlist');
  };

  const handleDeletePlaylist = async (playlist) => {
    setSelectedPlaylist(playlist);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!selectedPlaylist) return;
    
    try {
      await syncService.deletePlaylist(selectedPlaylist.id);
      setPlaylists(prev => prev.filter(p => p.id !== selectedPlaylist.id));
      setShowDeleteModal(false);
      setSelectedPlaylist(null);
    } catch (err) {
      console.error('플레이리스트 삭제 실패:', err);
      alert('플레이리스트 삭제에 실패했습니다.');
    }
  };

  const handleToggleVisibility = async (playlistId, currentIsPublic) => {
    try {
      await syncService.updatePlaylistVisibility(playlistId, !currentIsPublic);
      setPlaylists(prev => prev.map(p => 
        p.id === playlistId ? { ...p, isPublic: !currentIsPublic } : p
      ));
    } catch (err) {
      console.error('공개 설정 변경 실패:', err);
      alert('공개 설정 변경에 실패했습니다.');
    }
  };

  const handlePlaylistClick = (playlistId) => {
    navigate(`/playlist/${playlistId}`);
  };

  if (loading) {
    return (
      <div className="playlists-loading">
        <div className="loading-spinner"></div>
        <p>플레이리스트를 불러오는 중입니다...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="playlists-error">
        <h3>로그인이 필요합니다</h3>
        <p>플레이리스트를 보려면 로그인해주세요.</p>
      </div>
    );
  }

  return (
    <div className="my-playlists-container">
      <div className="playlists-header">
        <h2 className="playlists-title">내 플레이리스트</h2>
        <button onClick={handleCreatePlaylist} className="create-playlist-button">
          <Plus size={18} />
          새 플레이리스트
        </button>
      </div>

      {error ? (
        <div className="playlists-error">
          <p>{error}</p>
          <button onClick={loadPlaylists} className="retry-button">다시 시도</button>
        </div>
      ) : playlists.length === 0 ? (
        <div className="playlists-empty">
          <Music size={48} />
          <h3>플레이리스트가 없습니다</h3>
          <p>첫 번째 플레이리스트를 만들어보세요!</p>
          <button onClick={handleCreatePlaylist} className="create-first-playlist">
            플레이리스트 만들기
          </button>
        </div>
      ) : (
        <div className="playlists-grid">
          {playlists.map((playlist) => (
            <div key={playlist.id} className="playlist-card">
              <div 
                className="playlist-cover"
                onClick={() => handlePlaylistClick(playlist.id)}
              >
                <img
                  src={playlist.coverUrl || '/default-playlist.jpg'}
                  alt={playlist.name}
                  className="playlist-image"
                />
                <div className="playlist-overlay">
                  <button className="play-button">▶</button>
                </div>
              </div>
              
              <div className="playlist-info">
                <h3 className="playlist-name">{playlist.name}</h3>
                <p className="playlist-meta">
                  {playlist.songCount || 0}곡 • {playlist.isPublic ? '공개' : '비공개'}
                </p>
                
                <div className="playlist-actions">
                  <button
                    onClick={() => handleToggleVisibility(playlist.id, playlist.isPublic)}
                    className="action-button"
                    title={playlist.isPublic ? '비공개로 변경' : '공개로 변경'}
                  >
                    {playlist.isPublic ? <Globe size={16} /> : <Lock size={16} />}
                  </button>
                  
                  <button
                    onClick={() => navigate(`/edit-playlist/${playlist.id}`)}
                    className="action-button"
                    title="편집"
                  >
                    <Edit3 size={16} />
                  </button>
                  
                  <button
                    onClick={() => handleDeletePlaylist(playlist)}
                    className="action-button delete-button"
                    title="삭제"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 삭제 확인 모달 */}
      {showDeleteModal && (
        <div className="modal-backdrop" onClick={() => setShowDeleteModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h3>플레이리스트 삭제</h3>
            <p>
              '<strong>{selectedPlaylist?.name}</strong>' 플레이리스트를 정말 삭제하시겠습니까?
              <br />
              이 작업은 되돌릴 수 없습니다.
            </p>
            <div className="modal-actions">
              <button onClick={() => setShowDeleteModal(false)} className="cancel-button">
                취소
              </button>
              <button onClick={confirmDelete} className="delete-button">
                삭제
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyPlaylistsPage;