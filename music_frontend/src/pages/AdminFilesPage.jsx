import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles/AdminFilesPage.css';

const AdminFilesPage = () => {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(null);

  // 파일 목록 조회
  const fetchFiles = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${import.meta.env.VITE_REACT_APP_API_URL}/api/admin/music/list`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('jwt')}`,
          },
        }
      );

      if (response.data.success) {
        setFiles(response.data.songs);
        setError(null);
      } else {
        setError(response.data.message);
      }
    } catch (err) {
      console.error('파일 목록 조회 실패:', err);
      setError('파일 목록을 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // 파일 삭제
  const handleDelete = async (songId, title) => {
    if (!window.confirm(`"${title}" 파일을 정말 삭제하시겠습니까?`)) {
      return;
    }

    try {
      setDeleteLoading(songId);
      const response = await axios.delete(
        `${import.meta.env.VITE_REACT_APP_API_URL}/api/admin/music/${songId}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('jwt')}`,
          },
        }
      );

      if (response.data.success) {
        window.showToast('파일이 성공적으로 삭제되었습니다.', 'success');
        fetchFiles(); // 목록 새로고침
      } else {
        window.showToast(response.data.message, 'error');
      }
    } catch (err) {
      console.error('파일 삭제 실패:', err);
      window.showToast('파일 삭제에 실패했습니다.', 'error');
    } finally {
      setDeleteLoading(null);
    }
  };

  // 파일 크기 포맷팅
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // 재생 시간 포맷팅
  const formatDuration = (seconds) => {
    if (!seconds) return '알 수 없음';
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // 날짜 포맷팅
  const formatDate = (dateString) => {
    if (!dateString) return '알 수 없음';
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  useEffect(() => {
    fetchFiles();
  }, []);

  if (loading) {
    return (
      <div className="admin-files-container">
        <div className="loading-spinner">파일 목록을 불러오는 중...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-files-container">
        <div className="error-message">
          <p>{error}</p>
          <button onClick={fetchFiles} className="retry-button">
            다시 시도
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-files-container">
      <div className="admin-files-header">
        <h2>파일 관리</h2>
        <div className="files-stats">
          <span>총 {files.length}개의 파일</span>
          <button onClick={fetchFiles} className="refresh-button">
            새로고침
          </button>
        </div>
      </div>

      {files.length === 0 ? (
        <div className="no-files">
          <p>업로드된 파일이 없습니다.</p>
        </div>
      ) : (
        <div className="files-table-container">
          <table className="files-table">
            <thead>
              <tr>
                <th>제목</th>
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
              {files.map((file) => (
                <tr key={file.id}>
                  <td className="file-title">{file.title}</td>
                  <td>{file.genre || '-'}</td>
                  <td className="file-name">{file.originalFileName}</td>
                  <td>{formatFileSize(file.fileSize)}</td>
                  <td className="file-format">{file.fileFormat?.toUpperCase()}</td>
                  <td>{formatDuration(file.duration)}</td>
                  <td>{formatDate(file.createdAt)}</td>
                  <td>{file.uploadedBy}</td>
                  <td className="file-actions">
                    <button
                      onClick={() => handleDelete(file.id, file.title)}
                      className="delete-button"
                      disabled={deleteLoading === file.id}
                    >
                      {deleteLoading === file.id ? '삭제 중...' : '삭제'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminFilesPage;
