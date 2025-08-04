import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { MusicPlayerContext } from '../context/MusicPlayerContext';
import { FaUpload, FaDownload, FaTrash, FaPlus } from 'react-icons/fa';
import '../styles/FileManagement.css';
import noSongImage from '../assets/default-cover.jpg';
import axios from 'axios';

// API 기본 URL
const API_BASE_URL = import.meta.env.VITE_REACT_APP_API_URL || 'http://localhost:8080';

const FileManagement = () => {
  const { user } = useContext(AuthContext);
  const { addSongToPlaylist } = useContext(MusicPlayerContext);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedFileUrl, setSelectedFileUrl] = useState(null);
  const [selectedCover, setSelectedCover] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    artistName: '',
    albumName: '',
    genre: ''
  });

  useEffect(() => {
    loadFiles();
  }, []);

  // 서버에서 업로드된 음악 파일 목록 조회
  const loadFiles = async () => {
    try {
      console.log('파일 목록 조회 시작...');
      const response = await axios.get(`${API_BASE_URL}/api/admin/music/list`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('jwt')}`
        }
      });
      
      console.log('API 응답:', response.data);
      
      if (response.data.success) {
        const songs = response.data.songs || [];
        console.log('불러온 파일 개수:', songs.length);
        setUploadedFiles(songs);
        
        // 파일 개수에 따라 다른 메시지 표시
        if (songs.length > 0) {
          window.showToast(`${songs.length}개의 파일을 불러왔습니다.`, 'success');
        } else {
          console.log('업로드된 파일이 없습니다.');
        }
      } else {
        console.error('API 응답 실패:', response.data.message);
        window.showToast(response.data.message || '파일 목록 로드에 실패했습니다.', 'error');
        setUploadedFiles([]);
      }
    } catch (error) {
      console.error('Failed to load files from server:', error);
      
      // 더 자세한 에러 정보 출력
      if (error.response) {
        console.error('응답 상태:', error.response.status);
        console.error('응답 데이터:', error.response.data);
      }
      
      window.showToast('파일 목록 로드에 실패했습니다. 네트워크 연결을 확인해주세요.', 'error');
      setUploadedFiles([]);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) {
      console.log('No audio file selected');
      setSelectedFile(null);
      return;
    }

    const validAudioTypes = ['audio/mp3', 'audio/mpeg', 'audio/wav', 'audio/x-wav', 'audio/flac'];
    const validExtensions = ['.mp3', '.wav', '.flac'];
    const extension = file.name.toLowerCase().slice(file.name.lastIndexOf('.'));
    if (!validAudioTypes.includes(file.type) && !validExtensions.includes(extension)) {
      window.showToast('지원되는 파일 형식: MP3, WAV, FLAC', 'error');
      console.log('Invalid audio file:', { type: file.type, extension });
      setSelectedFile(null);
      e.target.value = '';
      return;
    }

    // 파일 크기 체크 (200MB 제한)
    const maxSize = 200 * 1024 * 1024; // 200MB
    if (file.size > maxSize) {
      window.showToast('파일 크기는 200MB 이하여야 합니다.', 'error');
      console.log('File too large:', file.size);
      setSelectedFile(null);
      e.target.value = '';
      return;
    }

    const fileUrl = URL.createObjectURL(file);
    setSelectedFile(file); // 원본 File 객체 그대로 저장
    setSelectedFileUrl(fileUrl); // URL은 별도로 관리
    
    // 파일명에서 제목 추출 (확장자 제거)
    const fileName = file.name.replace(/\.[^/.]+$/, "");
    setFormData(prev => ({ ...prev, title: fileName }));
    
    console.log('Audio file selected:', file.name, file.type, file.size);
    window.showToast('오디오 파일이 선택되었습니다.', 'success');
  };

  const handleCoverChange = (e) => {
    const cover = e.target.files[0];
    if (!cover) {
      console.log('No cover image selected');
      setSelectedCover(null);
      return;
    }

    const validImageTypes = ['image/jpeg', 'image/png'];
    const validImageExtensions = ['.jpg', '.jpeg', '.png'];
    const extension = cover.name.toLowerCase().slice(cover.name.lastIndexOf('.'));
    if (!validImageTypes.includes(cover.type) || !validImageExtensions.includes(extension)) {
      window.showToast('지원되는 이미지 형식: JPG, PNG', 'error');
      console.log('Invalid cover image:', { type: cover.type, extension });
      setSelectedCover(null);
      e.target.value = '';
      return;
    }

    // 이미지 크기 체크 (5MB 제한)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (cover.size > maxSize) {
      window.showToast('이미지 크기는 5MB 이하여야 합니다.', 'error');
      setSelectedCover(null);
      e.target.value = '';
      return;
    }

    const coverData = {
      file: cover,
      url: URL.createObjectURL(cover),
    };
    setSelectedCover(coverData);
    window.showToast('앨범 커버가 선택되었습니다.', 'success');
    console.log('Selected cover image:', coverData);
  };

  const handleUpload = async () => {
    if (!user) {
      window.showToast('로그인이 필요합니다.', 'error');
      return;
    }

    if (!selectedFile) {
      window.showToast('업로드할 오디오 파일을 선택해주세요.', 'error');
      return;
    }

    // 필수 정보 검증
    if (!formData.title.trim()) {
      window.showToast('곡 제목을 입력해주세요.', 'error');
      return;
    }

    if (!formData.artistName.trim()) {
      window.showToast('아티스트 이름을 입력해주세요.', 'error');
      return;
    }

    setUploading(true);
    window.showToast('파일을 서버에 업로드하는 중...', 'info');

    try {
      // FormData 생성
      const uploadFormData = new FormData();
      uploadFormData.append('file', selectedFile);
      uploadFormData.append('title', formData.title.trim());
      uploadFormData.append('artistName', formData.artistName.trim());
      
      if (formData.albumName.trim()) {
        uploadFormData.append('albumName', formData.albumName.trim());
      }
      
      if (formData.genre.trim()) {
        uploadFormData.append('genre', formData.genre.trim());
      }

      // 서버에 업로드
      const response = await axios.post(`${API_BASE_URL}/api/admin/music/upload`, uploadFormData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${localStorage.getItem('jwt')}`
        }
      });

      if (response.data.success) {
        window.showToast(`${formData.title} 파일이 성공적으로 업로드되었습니다.`, 'success');
        
        // 폼 초기화 먼저 수행
        setSelectedFile(null);
        setSelectedFileUrl(null);
        setSelectedCover(null);
        setFormData({ title: '', artistName: '', albumName: '', genre: '' });
        document.getElementById('audio-upload').value = '';
        if (document.getElementById('cover-upload')) {
          document.getElementById('cover-upload').value = '';
        }
        
        // 파일 목록 새로고침 (약간의 지연 후)
        setTimeout(async () => {
          try {
            await loadFiles();
            window.showToast('파일 목록이 업데이트되었습니다.', 'info');
          } catch (error) {
            console.error('Failed to refresh file list:', error);
            window.showToast('파일 목록 새로고침에 실패했습니다. 수동으로 새로고침 버튼을 클릭해주세요.', 'warning');
          }
        }, 500);
      } else {
        window.showToast(response.data.message || '업로드에 실패했습니다.', 'error');
      }
    } catch (error) {
      console.error('Upload failed:', error);
      const errorMessage = error.response?.data?.message || '서버 오류가 발생했습니다.';
      window.showToast(errorMessage, 'error');
    } finally {
      setUploading(false);
    }
  };

  const handleCancelUpload = () => {
    if (selectedFile) URL.revokeObjectURL(selectedFile.url);
    if (selectedCover) URL.revokeObjectURL(selectedCover.url);
    setSelectedFile(null);
    setSelectedCover(null);
    document.getElementById('audio-upload').value = '';
    document.getElementById('cover-upload').value = '';
    window.showToast('업로드가 취소되었습니다.', 'info');
    console.log('Upload cancelled');
  };

  const handleDownload = (file) => {
    if (!user || user.role !== 'ADMIN') {
      window.showToast('관리자만 다운로드할 수 있습니다.', 'error');
      console.log('Download failed: Not admin');
      return;
    }

    if (file.fileData) {
      try {
        const url = URL.createObjectURL(file.fileData);
        const link = document.createElement('a');
        link.href = url;
        link.download = file.name;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        window.showToast(`${file.name} 다운로드를 시작합니다.`, 'success');
        console.log('Download started:', file.name);
      } catch (error) {
        window.showToast('다운로드 중 오류가 발생했습니다.', 'error');
        console.error('Download error:', error);
      }
    } else {
      window.showToast('파일 데이터를 찾을 수 없습니다.', 'error');
      console.log('Download failed: No file data');
    }
  };

  const handleDelete = async (songId, title) => {
    // 삭제 확인 대화상자
    const confirmMessage = `"${title}" 파일을 정말 삭제하시겠습니까?\n\n이 작업은 되돌릴 수 없습니다.`;
    if (!window.confirm(confirmMessage)) {
      return;
    }

    try {
      console.log(`파일 삭제 시작 - ID: ${songId}, 제목: ${title}`);
      window.showToast('파일을 삭제하는 중...', 'info');
      
      const response = await axios.delete(`${API_BASE_URL}/api/admin/music/${songId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('jwt')}`
        }
      });

      console.log('삭제 응답:', response.data);

      if (response.data.success) {
        window.showToast(`"${title}" 파일이 성공적으로 삭제되었습니다.`, 'success');
        
        // 파일 목록에서 해당 항목을 즉시 제거 (UI 반응성 향상)
        setUploadedFiles(prevFiles => 
          prevFiles.filter(file => file.id !== songId)
        );
        
        // 서버에서 최신 목록 다시 불러오기
        setTimeout(async () => {
          try {
            await loadFiles();
            console.log('삭제 후 파일 목록 새로고침 완료');
          } catch (error) {
            console.error('파일 목록 새로고침 실패:', error);
          }
        }, 500);
        
      } else {
        console.error('삭제 실패:', response.data.message);
        window.showToast(response.data.message || '삭제에 실패했습니다.', 'error');
      }
    } catch (error) {
      console.error('Delete failed:', error);
      
      // 더 자세한 에러 정보 출력
      if (error.response) {
        console.error('응답 상태:', error.response.status);
        console.error('응답 데이터:', error.response.data);
        
        if (error.response.status === 404) {
          window.showToast('삭제할 파일을 찾을 수 없습니다.', 'error');
        } else if (error.response.status === 403) {
          window.showToast('삭제 권한이 없습니다. 관리자 권한을 확인해주세요.', 'error');
        } else {
          const errorMessage = error.response?.data?.message || '파일 삭제 중 오류가 발생했습니다.';
          window.showToast(errorMessage, 'error');
        }
      } else {
        window.showToast('네트워크 오류가 발생했습니다. 연결을 확인해주세요.', 'error');
      }
    }
  };

  const handleAddToPlaylist = (file) => {
    try {
      const song = {
        id: file.id,
        name: file.name,
        artist: file.artist,
        coverUrl: file.coverUrl,
        url: file.url,
        isLocal: true,
      };
      addSongToPlaylist(song);
      window.showToast(`${file.name}이 플레이리스트에 추가되었습니다.`, 'success');
      console.log('Added to playlist:', file.name);
    } catch (error) {
      window.showToast('플레이리스트 추가에 실패했습니다.', 'error');
      console.error('Add to playlist failed:', error);
    }
  };

  return (
    <div className="file-management-container">
      <h2 className="file-management-title">파일 관리자 페이지</h2>
      <div className="file-management-controls">
        <label className="file-management-label">
          오디오 파일 선택 (최대 200MB)
          <input
            type="file"
            id="audio-upload"
            accept="audio/mp3,audio/mpeg,audio/wav,audio/x-wav,audio/flac"
            onChange={handleFileChange}
            className="file-management-upload-input"
            disabled={uploading}
          />
        </label>
        
        {selectedFile && (
          <div className="file-management-form">
            <h3>곡 정보 입력</h3>
            <div className="file-management-form-row">
              <label>
                곡 제목 *
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="곡 제목을 입력하세요"
                  className="file-management-input"
                  disabled={uploading}
                />
              </label>
              <label>
                아티스트 이름 *
                <input
                  type="text"
                  value={formData.artistName}
                  onChange={(e) => setFormData(prev => ({ ...prev, artistName: e.target.value }))}
                  placeholder="아티스트 이름을 입력하세요"
                  className="file-management-input"
                  disabled={uploading}
                />
              </label>
            </div>
            <div className="file-management-form-row">
              <label>
                앨범 이름
                <input
                  type="text"
                  value={formData.albumName}
                  onChange={(e) => setFormData(prev => ({ ...prev, albumName: e.target.value }))}
                  placeholder="앨범 이름 (선택사항)"
                  className="file-management-input"
                  disabled={uploading}
                />
              </label>
              <label>
                장르
                <input
                  type="text"
                  value={formData.genre}
                  onChange={(e) => setFormData(prev => ({ ...prev, genre: e.target.value }))}
                  placeholder="장르 (선택사항)"
                  className="file-management-input"
                  disabled={uploading}
                />
              </label>
            </div>
          </div>
        )}
        
        <div className="file-management-buttons">
          <button 
            onClick={handleUpload} 
            className="file-management-btn file-management-btn-upload"
            disabled={!selectedFile || uploading}
          >
            <FaUpload /> {uploading ? '업로드 중...' : '업로드'}
          </button>
          {selectedFile && (
            <button 
              onClick={handleCancelUpload} 
              className="file-management-btn file-management-btn-cancel"
              disabled={uploading}
            >
              취소
            </button>
          )}
        </div>
      </div>

      {selectedFile && (
        <div className="file-management-preview">
          <h3 className="file-management-preview-title">파일 미리보기</h3>
          <div className="file-management-preview-content">
            <img
              src={selectedCover ? selectedCover.url : noSongImage}
              alt="앨범 커버"
              className="file-management-preview-cover"
            />
            <div className="file-management-preview-details">
              <p><strong>파일명:</strong> {selectedFile.name}</p>
              <p><strong>크기:</strong> {(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
              <p><strong>형식:</strong> {selectedFile.type}</p>
              <audio controls src={selectedFileUrl} className="file-management-preview-audio" />
            </div>
          </div>
          <div className="file-management-preview-buttons">
            <button
              onClick={handleUpload}
              className="file-management-btn file-management-btn-upload"
            >
              업로드
            </button>
            <button
              onClick={handleCancelUpload}
              className="file-management-btn file-management-btn-cancel"
            >
              취소
            </button>
          </div>
        </div>
      )}

      {/* 업로드된 파일 목록 섹션 */}
      <div className="file-management-section">
        <div className="file-management-section-header">
          <h2>업로드된 파일 목록</h2>
          <div className="file-management-stats">
            <span className="file-count">총 {uploadedFiles.length}개 파일</span>
            <button 
              onClick={loadFiles} 
              className="file-management-btn file-management-btn-refresh"
              disabled={uploading}
            >
              새로고침
            </button>
          </div>
        </div>

        <div className="file-management-list">
          {uploadedFiles.length > 0 ? (
            <div className="file-management-table-container">
              <table className="file-management-table">
                <thead>
                  <tr>
                    <th>앨범 커버</th>
                    <th>곡 제목</th>
                    <th>아티스트</th>
                    <th>앨범</th>
                    <th>장르</th>
                    <th>파일명</th>
                    <th>크기</th>
                    <th>형식</th>
                    <th>재생시간</th>
                    <th>업로드일</th>
                    <th>업로드자</th>
                    <th>작업</th>
                  </tr>
                </thead>
                <tbody>
                  {uploadedFiles.map((file) => (
                    <tr key={file.id}>
                      <td>
                        <img
                          src={file.coverUrl || noSongImage}
                          alt="앨범 커버"
                          className="file-management-table-cover"
                        />
                      </td>
                      <td className="file-title">{file.title}</td>
                      <td>{file.artist?.name || file.artistName || '알 수 없음'}</td>
                      <td>{file.album?.title || '-'}</td>
                      <td>{file.genre || '-'}</td>
                      <td className="file-name">{file.originalFileName}</td>
                      <td className="file-size">
                        {file.fileSize ? (file.fileSize / 1024 / 1024).toFixed(2) + ' MB' : 'N/A'}
                      </td>
                      <td className="file-format">
                        {file.fileFormat ? file.fileFormat.toUpperCase() : 'N/A'}
                      </td>
                      <td className="file-duration">
                        {file.duration ? `${Math.floor(file.duration / 60)}:${(file.duration % 60).toString().padStart(2, '0')}` : '알 수 없음'}
                      </td>
                      <td className="file-date">
                        {file.createdAt ? new Date(file.createdAt).toLocaleDateString('ko-KR', {
                          year: 'numeric',
                          month: '2-digit',
                          day: '2-digit',
                          hour: '2-digit',
                          minute: '2-digit'
                        }) : '알 수 없음'}
                      </td>
                      <td className="file-uploader">{file.uploadedBy || '-'}</td>
                      <td className="file-actions">
                        <div className="action-buttons">
                          <button
                            onClick={() => handleDownload(file)}
                            className="file-management-btn file-management-btn-download"
                            disabled={user?.role !== 'ADMIN'}
                            title={user?.role !== 'ADMIN' ? '관리자만 다운로드 가능' : '다운로드'}
                          >
                            <FaDownload />
                          </button>
                          <button
                            onClick={() => handleAddToPlaylist(file)}
                            className="file-management-btn file-management-btn-add"
                            title="플레이리스트에 추가"
                          >
                            <FaPlus />
                          </button>
                          <button
                            onClick={() => handleDelete(file.id, file.title)}
                            className="file-management-btn file-management-btn-delete"
                            disabled={uploading}
                            title="삭제"
                          >
                            <FaTrash />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="file-management-empty">
              <p>업로드된 파일이 없습니다.</p>
              <p className="empty-subtitle">음악 파일을 업로드하여 관리를 시작하세요.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FileManagement;