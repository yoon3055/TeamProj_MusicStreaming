import React, { useState, useRef, useCallback } from 'react';
import { FaTimes, FaPlus, FaInfoCircle } from 'react-icons/fa';
import { v4 as uuidv4 } from 'uuid';
import { put } from '../services/indexDB';
import '../styles/HistoryPage.css';

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
const VALID_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

const CreatePlaylistModalPage = ({ selectedSongs, onRemoveSong, onPlaylistCreated, onClose }) => {
  const [playlistName, setPlaylistName] = useState('');
  const [ setPlaylistImage] = useState(null); // 사용되지 않는 변수
  const [imagePreview, setImagePreview] = useState(null);
  const fileInputRef = useRef(null);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!VALID_IMAGE_TYPES.includes(file.type)) {
        alert('지원하지 않는 이미지 형식입니다. (jpeg, png, webp만 가능)');
        return;
      }
      if (file.size > MAX_IMAGE_SIZE) {
        alert('이미지 크기는 5MB를 초과할 수 없습니다.');
        return;
      }
      setPlaylistImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCreatePlaylist = useCallback(async (e) => {
    e.preventDefault();
    if (!playlistName.trim()) {
      alert('플레이리스트 이름을 입력해주세요.');
      return;
    }

    try {
      const newPlaylist = {
        id: uuidv4(),
        title: playlistName,
        songs: selectedSongs,
        coverUrl: imagePreview, // 이미지를 IndexedDB에 Base64 형태로 저장
        createdAt: new Date().toISOString(),
        isLocal: true,
      };

      await put('playlists', newPlaylist);
      alert(`플레이리스트 "${playlistName}"이(가) 생성되었습니다.`);
      onPlaylistCreated();
      onClose();
    } catch (error) {
      console.error('플레이리스트 저장 실패:', error);
      alert('플레이리스트 생성에 실패했습니다.');
    }
  }, [playlistName, selectedSongs, imagePreview, onPlaylistCreated, onClose]);

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <button className="modal-close" onClick={onClose}>
          <FaTimes />
        </button>
        <h3>새 플레이리스트 만들기</h3>
        <form onSubmit={handleCreatePlaylist}>
          <div className="form-group">
            <label htmlFor="playlistName">플레이리스트 이름</label>
            <input
              type="text"
              id="playlistName"
              value={playlistName}
              onChange={(e) => setPlaylistName(e.target.value)}
              placeholder="플레이리스트 이름을 입력하세요"
              className="playlist-name-input"
              required
            />
          </div>

          <div className="form-group">
            <label>플레이리스트 커버</label>
            <div
              className="playlist-image-uploader"
              onClick={() => fileInputRef.current.click()}
            >
              {imagePreview ? (
                <img src={imagePreview} alt="Playlist Cover Preview" className="image-preview" />
              ) : (
                <div className="placeholder-text">
                  <FaPlus />
                  <span>이미지 추가</span>
                </div>
              )}
            </div>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageChange}
              style={{ display: 'none' }}
              accept={VALID_IMAGE_TYPES.join(',')}
            />
            <div className="info-text">
              <FaInfoCircle />
              <span>권장 이미지 크기: 500x500</span>
            </div>
          </div>

          <div className="selected-songs-list">
            <h4>담을 곡 ({selectedSongs.length}곡)</h4>
            <ul>
              {selectedSongs.map((song, index) => (
                <li key={song.id || index}>
                  <span>{song.title}</span>
                  <button type="button" onClick={() => onRemoveSong(song)}>
                    <FaTimes />
                  </button>
                </li>
              ))}
            </ul>
          </div>
          
          <button type="submit" className="create-button">
            플레이리스트 생성
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreatePlaylistModalPage;