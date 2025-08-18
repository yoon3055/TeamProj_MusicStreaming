// src/component/ArtistManagement.jsx
import React, { useState, useEffect } from 'react';
import { artistApi } from '../api/artistApi';
import '../styles/ArtistManagement.css';

const ArtistManagement = () => {
  const [artists, setArtists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingArtist, setEditingArtist] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    profileImage: '',
    genre: '',
    description: ''
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');

  const genres = [
    '발라드', '댄스', '힙합', '재즈', '락', '트로트', 
    '팝', 'R&B', '클래식', 'EDM', '컨트리', '레게'
  ];

  useEffect(() => {
    fetchArtists();
  }, []);

  const fetchArtists = async () => {
    try {
      setLoading(true);
      const artistsData = await artistApi.getAllArtists();
      setArtists(artistsData);
    } catch (error) {
      console.error('아티스트 목록 조회 실패:', error);
      setError('아티스트 목록을 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // 파일 크기 체크 (5MB 제한)
      if (file.size > 5 * 1024 * 1024) {
        setError('파일 크기는 5MB 이하여야 합니다.');
        return;
      }
      
      // 파일 타입 체크
      if (!file.type.startsWith('image/')) {
        setError('이미지 파일만 업로드 가능합니다.');
        return;
      }
      
      setSelectedFile(file);
      
      // 미리보기 URL 생성
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewUrl(e.target.result);
      };
      reader.readAsDataURL(file);
      
      setError(''); // 에러 메시지 초기화
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      setError('아티스트 이름을 입력해주세요.');
      return;
    }

    if (!formData.genre) {
      setError('장르를 선택해주세요.');
      return;
    }

    try {
      let finalFormData = { ...formData };
      
      // 파일이 선택된 경우 파일 업로드 처리
      if (selectedFile) {
        // TODO: 실제 파일 업로드 API 구현 필요
        // 현재는 임시로 base64 데이터 URL 사용
        finalFormData.profileImage = previewUrl;
        console.log('파일 업로드 기능은 백엔드 구현 후 연동 예정');
      }
      
      if (editingArtist) {
        // 수정
        await artistApi.updateArtist(editingArtist.id, finalFormData);
        window.showToast('아티스트가 성공적으로 수정되었습니다!', 'success');
      } else {
        // 생성
        await artistApi.createArtist(finalFormData);
        window.showToast('아티스트가 성공적으로 생성되었습니다!', 'success');
      }
      
      // 폼 초기화 및 목록 새로고침
      resetForm();
      await fetchArtists();
    } catch (error) {
      console.error('아티스트 저장 실패:', error);
      setError('아티스트 저장에 실패했습니다. 다시 시도해주세요.');
    }
  };

  const handleEdit = (artist) => {
    setEditingArtist(artist);
    setFormData({
      name: artist.name,
      profileImage: artist.profileImage || '',
      genre: artist.genre,
      description: artist.description || ''
    });
    setPreviewUrl(artist.profileImage || '');
    setSelectedFile(null);
    setShowCreateForm(true);
  };

  const handleDelete = async (artistId, artistName) => {
    if (!confirm(`"${artistName}" 아티스트를 정말 삭제하시겠습니까?`)) {
      return;
    }

    try {
      await artistApi.deleteArtist(artistId);
      window.showToast('아티스트가 성공적으로 삭제되었습니다!', 'success');
      await fetchArtists();
    } catch (error) {
      console.error('아티스트 삭제 실패:', error);
      window.showToast('아티스트 삭제에 실패했습니다.', 'error');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      profileImage: '',
      genre: '',
      description: ''
    });
    setSelectedFile(null);
    setPreviewUrl('');
    setEditingArtist(null);
    setShowCreateForm(false);
    setError('');
  };

  if (loading) {
    return <div className="artist-management-loading">아티스트 목록을 불러오는 중...</div>;
  }

  return (
    <div className="artist-management">
      <h3 style={{fontSize: '1.2rem', marginBottom: '15px', color: '#000000 !important'}}>아티스트 관리</h3>
      <div className="artist-management-header">
        <button 
          className="create-artist-btn"
          onClick={() => setShowCreateForm(true)}
        >
          + 새 아티스트 등록
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      {/* 아티스트 생성/수정 폼 */}
      {showCreateForm && (
        <div className="artist-form-overlay">
          <div className="artist-form-container">
            <h3>{editingArtist ? '아티스트 수정' : '새 아티스트 등록'}</h3>
            
            <form onSubmit={handleSubmit} className="artist-form">
              <div className="form-group">
                <label htmlFor="name">아티스트 이름 *</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="아티스트 이름을 입력하세요"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="profileImageFile">프로필 이미지</label>
                <div className="file-upload-container">
                  <input
                    type="file"
                    id="profileImageFile"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="file-input"
                  />
                  <label htmlFor="profileImageFile" className="file-upload-label">
                    <span className="file-upload-icon">📷</span>
                    <span className="file-upload-text">
                      {selectedFile ? selectedFile.name : '이미지 파일 선택'}
                    </span>
                  </label>
                </div>
                {previewUrl && (
                  <div className="image-preview">
                    <img 
                      src={previewUrl} 
                      alt="프로필 미리보기"
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                    />
                    <button 
                      type="button" 
                      className="remove-image-btn"
                      onClick={() => {
                        setSelectedFile(null);
                        setPreviewUrl('');
                        document.getElementById('profileImageFile').value = '';
                      }}
                    >
                      × 제거
                    </button>
                  </div>
                )}
                <small className="file-info">
                  JPG, PNG, GIF 파일 (5MB 이하)
                </small>
              </div>

              <div className="form-group">
                <label htmlFor="genre">장르 *</label>
                <select
                  id="genre"
                  name="genre"
                  value={formData.genre}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">장르를 선택하세요</option>
                  {genres.map(genre => (
                    <option key={genre} value={genre}>{genre}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="description">설명</label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="아티스트에 대한 설명을 입력하세요"
                  rows="4"
                />
              </div>

              <div className="form-actions">
                <button type="button" onClick={resetForm} className="cancel-btn">
                  취소
                </button>
                <button type="submit" className="submit-btn">
                  {editingArtist ? '수정' : '등록'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 아티스트 목록 */}
      <div className="artist-list">
        {artists.length === 0 ? (
          <div className="no-artists">등록된 아티스트가 없습니다.</div>
        ) : (
          <div className="artist-grid">
            {artists.map(artist => (
              <div key={artist.id} className="artist-card">
                <div className="artist-image">
                  <img 
                    src={artist.profileImage || '/images/default-artist.jpg'} 
                    alt={artist.name}
                    onError={(e) => {
                      e.target.src = '/images/default-artist.jpg';
                    }}
                  />
                </div>
                <div className="artist-info">
                  <h4>{artist.name}</h4>
                  <p className="artist-genre">{artist.genre}</p>
                  {artist.description && (
                    <p className="artist-description">{artist.description}</p>
                  )}
                </div>
                <div className="artist-actions">
                  <button 
                    className="edit-btn"
                    onClick={() => handleEdit(artist)}
                  >
                    수정
                  </button>
                  <button 
                    className="delete-btn"
                    onClick={() => handleDelete(artist.id, artist.name)}
                  >
                    삭제
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ArtistManagement;
