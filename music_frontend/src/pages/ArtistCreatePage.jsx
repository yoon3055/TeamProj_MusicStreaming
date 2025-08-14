// src/pages/ArtistCreatePage.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { artistApi } from '../api/artistApi';
import '../styles/ArtistCreatePage.css';

const ArtistCreatePage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    profileImage: '',
    genre: '',
    description: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const genres = [
    '발라드', '댄스', '힙합', '재즈', '락', '트로트', 
    '팝', 'R&B', '클래식', 'EDM', '컨트리', '레게'
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
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

    setIsLoading(true);
    setError('');

    try {
      await artistApi.createArtist(formData);
      alert('아티스트가 성공적으로 생성되었습니다!');
      navigate('/recommend'); // 추천 페이지로 이동
    } catch (error) {
      console.error('아티스트 생성 실패:', error);
      setError('아티스트 생성에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    navigate(-1); // 이전 페이지로 돌아가기
  };

  return (
    <div className="artist-create-page">
      <div className="artist-create-container">
        <h1>새 아티스트 등록</h1>
        
        <form onSubmit={handleSubmit} className="artist-create-form">
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
            <label htmlFor="profileImage">프로필 이미지 URL</label>
            <input
              type="url"
              id="profileImage"
              name="profileImage"
              value={formData.profileImage}
              onChange={handleInputChange}
              placeholder="https://example.com/image.jpg"
            />
            {formData.profileImage && (
              <div className="image-preview">
                <img 
                  src={formData.profileImage} 
                  alt="프로필 미리보기"
                  onError={(e) => {
                    e.target.style.display = 'none';
                  }}
                />
              </div>
            )}
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

          {error && <div className="error-message">{error}</div>}

          <div className="form-actions">
            <button 
              type="button" 
              onClick={handleCancel}
              className="cancel-button"
              disabled={isLoading}
            >
              취소
            </button>
            <button 
              type="submit" 
              className="submit-button"
              disabled={isLoading}
            >
              {isLoading ? '생성 중...' : '아티스트 생성'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ArtistCreatePage;
