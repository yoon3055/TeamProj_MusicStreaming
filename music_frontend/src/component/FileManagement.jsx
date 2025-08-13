import React, { useState, useEffect, useContext, useCallback, useRef } from 'react';
import { AuthContext } from '../context/AuthContext';
import { MusicPlayerContext } from '../context/MusicPlayerContext';
import { FaUpload, FaDownload, FaTrash, FaPlus } from 'react-icons/fa';
import axios from 'axios';
import '../styles/FileManagement.css';
import noSongImage from '../assets/default-cover.jpg';

// IndexedDB 관련 상수 및 헬퍼 함수
const dbName = 'musicPlayerDB';
const storeName = 'uploadedFiles';

const openDB = () => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(dbName, 3);
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(storeName)) {
        db.createObjectStore(storeName, { keyPath: 'id' });
      }
    };
    request.onsuccess = (event) => resolve(event.target.result);
    request.onerror = (event) => reject(event.target.error);
  });
};

const saveFileToDB = async (fileObj) => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, 'readwrite');
    const store = transaction.objectStore(storeName);
    const request = store.put(fileObj);
    request.onsuccess = () => resolve();
    request.onerror = (event) => reject(event.target.error);
  });
};

const getAllFilesFromDB = async () => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, 'readonly');
    const store = transaction.objectStore(storeName);
    const request = store.getAll();
    request.onsuccess = (event) => resolve(event.target.result);
    request.onerror = (event) => reject(event.target.error);
  });
};

const deleteFileFromDB = async (fileId) => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, 'readwrite');
    const store = transaction.objectStore(storeName);
    const request = store.delete(fileId);
    request.onsuccess = () => resolve();
    request.onerror = (event) => reject(event.target.error);
  });
};

const FileManagement = () => {
  // Context API를 사용하여 전역 상태 관리
  const { user } = useContext(AuthContext);
  const { addSongToPlaylist } = useContext(MusicPlayerContext);

  // useRef를 사용하여 DOM 요소에 직접 접근
  const audioInputRef = useRef(null);
  const coverInputRef = useRef(null);

  // 컴포넌트 상태 관리
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedCover, setSelectedCover] = useState(null);

  // 서버와 파일 목록을 동기화하는 함수
  const syncFilesFromServer = useCallback(async () => {
    try {
      const response = await axios.get('http://localhost:8080/api/files', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      const serverFiles = response.data;
      const localFiles = await getAllFilesFromDB();

      // 서버에는 있지만 로컬에 없는 파일들을 IndexedDB에 추가
      for (const serverFile of serverFiles) {
        if (!localFiles.some(localFile => localFile.id === serverFile.id)) {
          await saveFileToDB(serverFile);
        }
      }

      // 업데이트된 파일 목록을 IndexedDB에서 다시 불러와 상태 업데이트
      const updatedFiles = await getAllFilesFromDB();
      setUploadedFiles(updatedFiles);
      window.showToast('서버에서 파일 목록 동기화 완료.', 'success');
    } catch (error) {
      console.error('파일 목록 서버 동기화 실패:', error);
      window.showToast('서버 동기화 실패. 로컬 데이터 사용.', 'warning');
    }
  }, []);

  // 서버에 파일을 업로드하는 함수
  const syncFileToServer = useCallback(async (fileObj) => {
    const formData = new FormData();
    formData.append('file', fileObj.fileData);
    formData.append('metadata', JSON.stringify({
      id: fileObj.id,
      name: fileObj.name,
      artist: fileObj.artist,
      coverUrl: fileObj.coverUrl,
      size: fileObj.size,
      uploadedAt: fileObj.uploadedAt,
    }));
    try {
      await axios.post('http://localhost:8080/api/files/upload', formData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      console.log('파일 서버 동기화 성공:', fileObj);
    } catch (error) {
      console.error('파일 서버 동기화 실패:', error);
      window.showToast('서버 동기화 실패. 로컬에 저장됨.', 'warning');
    }
  }, []);

  // 컴포넌트 마운트 시 IndexedDB에서 파일 목록 로드 및 서버 동기화 시도
  useEffect(() => {
    const loadFiles = async () => {
      try {
        window.showToast('파일 목록을 불러오는 중...', 'info');
        const files = await getAllFilesFromDB();
        setUploadedFiles(files);
        if (files.length > 0) {
          window.showToast(`${files.length}개의 파일을 불러왔습니다.`, 'success');
        } else {
          window.showToast('저장된 파일이 없습니다.', 'info');
        }
        await syncFilesFromServer();
      } catch (error) {
        console.error('Failed to load files from IndexedDB:', error);
        window.showToast('파일 목록 로드에 실패했습니다.', 'error');
      }
    };
    loadFiles();
  }, [syncFilesFromServer]);

  // 오디오 파일 선택 핸들러
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) {
      setSelectedFile(null);
      return;
    }

    const validAudioTypes = ['audio/mp3', 'audio/mpeg', 'audio/wav', 'audio/x-wav', 'audio/flac'];
    const validExtensions = ['.mp3', '.wav', '.flac'];
    const extension = file.name.toLowerCase().slice(file.name.lastIndexOf('.'));

    if (!validAudioTypes.includes(file.type) || !validExtensions.includes(extension)) {
      window.showToast('지원되는 파일 형식: MP3, WAV, FLAC', 'error');
      setSelectedFile(null);
      // ref를 사용하여 입력 필드 초기화
      if (audioInputRef.current) audioInputRef.current.value = '';
      return;
    }

    const maxSize = 50 * 1024 * 1024;
    if (file.size > maxSize) {
      window.showToast('파일 크기는 50MB 이하여야 합니다.', 'error');
      setSelectedFile(null);
      // ref를 사용하여 입력 필드 초기화
      if (audioInputRef.current) audioInputRef.current.value = '';
      return;
    }

    const fileData = {
      file: file,
      name: file.name,
      size: file.size,
      type: file.type,
      url: URL.createObjectURL(file),
    };
    setSelectedFile(fileData);
    window.showToast('오디오 파일이 선택되었습니다.', 'success');
  };

  // 앨범 커버 선택 핸들러
  const handleCoverChange = (e) => {
    const cover = e.target.files[0];
    if (!cover) {
      setSelectedCover(null);
      return;
    }

    const validImageTypes = ['image/jpeg', 'image/png'];
    const validImageExtensions = ['.jpg', '.jpeg', '.png'];
    const extension = cover.name.toLowerCase().slice(cover.name.lastIndexOf('.'));
    
    if (!validImageTypes.includes(cover.type) || !validImageExtensions.includes(extension)) {
      window.showToast('지원되는 이미지 형식: JPG, PNG', 'error');
      setSelectedCover(null);
      // ref를 사용하여 입력 필드 초기화
      if (coverInputRef.current) coverInputRef.current.value = '';
      return;
    }

    const maxSize = 5 * 1024 * 1024;
    if (cover.size > maxSize) {
      window.showToast('이미지 크기는 5MB 이하여야 합니다.', 'error');
      setSelectedCover(null);
      // ref를 사용하여 입력 필드 초기화
      if (coverInputRef.current) coverInputRef.current.value = '';
      return;
    }

    const coverData = {
      file: cover,
      url: URL.createObjectURL(cover),
    };
    setSelectedCover(coverData);
    window.showToast('앨범 커버가 선택되었습니다.', 'success');
  };

  // 업로드 버튼 클릭 핸들러
  const handleUpload = useCallback(async () => {
    if (!selectedFile) {
      window.showToast('업로드할 오디오 파일을 선택해주세요.', 'error');
      return;
    }

    const existingFile = uploadedFiles.find(file => file.name === selectedFile.name);
    if (existingFile) {
      window.showToast('이미 업로드된 파일입니다.', 'error');
      return;
    }

    const songId = `local-${Date.now()}`;
    const newFile = {
      id: songId,
      name: selectedFile.name,
      artist: '로컬 아티스트', // 기본값 설정
      coverUrl: selectedCover ? selectedCover.url : noSongImage,
      url: selectedFile.url,
      isLocal: true,
      fileData: selectedFile.file,
      size: selectedFile.size,
      uploadedAt: new Date().toISOString(),
    };

    try {
      await saveFileToDB(newFile);
      await syncFileToServer(newFile);
      setUploadedFiles((prevFiles) => [...prevFiles, newFile]);
      addSongToPlaylist(newFile);
      window.showToast(`${selectedFile.name} 파일이 성공적으로 업로드되었습니다.`, 'success');
      
      // 상태 및 입력 필드 초기화
      setSelectedFile(null);
      setSelectedCover(null);
      if (audioInputRef.current) audioInputRef.current.value = '';
      if (coverInputRef.current) coverInputRef.current.value = '';
    } catch (error) {
      console.error('Upload failed:', error);
      window.showToast('파일 업로드 실패.', 'error');
      
      // 오류 발생 시에도 상태 및 입력 필드 초기화
      setSelectedFile(null);
      setSelectedCover(null);
      if (audioInputRef.current) audioInputRef.current.value = '';
      if (coverInputRef.current) coverInputRef.current.value = '';
    }
  }, [selectedFile, selectedCover, uploadedFiles, syncFileToServer, addSongToPlaylist]);

  // 업로드 취소 핸들러
  const handleCancelUpload = useCallback(() => {
    if (selectedFile) URL.revokeObjectURL(selectedFile.url);
    if (selectedCover) URL.revokeObjectURL(selectedCover.url);
    setSelectedFile(null);
    setSelectedCover(null);
    // ref를 사용하여 입력 필드 초기화
    if (audioInputRef.current) audioInputRef.current.value = '';
    if (coverInputRef.current) coverInputRef.current.value = '';
    window.showToast('업로드가 취소되었습니다.', 'info');
  }, [selectedFile, selectedCover]);

  // 다운로드 핸들러 (관리자 전용)
  const handleDownload = useCallback((file) => {
    if (!user || user.role !== 'ADMIN') {
      window.showToast('관리자만 다운로드할 수 있습니다.', 'error');
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
      } catch (error) {
        window.showToast('다운로드 중 오류가 발생했습니다.', 'error');
        console.error('Download error:', error);
      }
    } else {
      window.showToast('파일 데이터를 찾을 수 없습니다.', 'error');
    }
  }, [user]);

  // 삭제 핸들러
  const handleDelete = useCallback(async (fileId, fileName) => {
    if (!window.confirm(`"${fileName}" 파일을 삭제하시겠습니까?`)) {
      return;
    }

    try {
      await deleteFileFromDB(fileId);
      await axios.delete(`http://localhost:8080/api/files/${fileId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setUploadedFiles((prevFiles) => prevFiles.filter((file) => file.id !== fileId));
      window.showToast(`${fileName} 파일이 삭제되었습니다.`, 'success');
    } catch (error) {
      console.error('File deletion failed:', error);
      window.showToast('파일 삭제 실패. 로컬 데이터가 남아있을 수 있습니다.', 'warning');
    }
  }, []);

  // 플레이리스트에 추가 핸들러
  const handleAddToPlaylist = useCallback((file) => {
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
    } catch (error) {
      window.showToast('플레이리스트 추가에 실패했습니다.', 'error');
      console.error('Add to playlist failed:', error);
    }
  }, [addSongToPlaylist]);

  // JSX 렌더링
  return (
    <div className="file-management-container">
      <h2 className="file-management-title">파일 관리자 페이지</h2>
      <div className="file-management-controls">
        <label className="file-management-label">
          오디오 파일 선택 (최대 50MB)
          <input
            type="file"
            id="audio-upload"
            accept="audio/mp3,audio/mpeg,audio/wav,audio/x-wav,audio/flac"
            onChange={handleFileChange}
            className="file-management-upload-input"
            ref={audioInputRef}
          />
        </label>
        <label className="file-management-label">
          앨범 커버 선택 (선택 사항, 최대 5MB)
          <input
            type="file"
            id="cover-upload"
            accept="image/jpeg,image/png"
            onChange={handleCoverChange}
            className="file-management-upload-input"
            ref={coverInputRef}
          />
        </label>
        <button onClick={handleUpload} className="file-management-btn file-management-btn-upload">
          <FaUpload /> 업로드
        </button>
      </div>

      {/* 파일 미리보기 섹션 */}
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
              <audio controls src={selectedFile.url} className="file-management-preview-audio" />
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
      <div className="file-management-list">
        {uploadedFiles.length > 0 ? (
          <table className="file-management-table">
            <thead>
              <tr>
                <th>앨범 커버</th>
                <th>파일명</th>
                <th>아티스트</th>
                <th>크기</th>
                <th>업로드 날짜</th>
                <th>작업</th>
              </tr>
            </thead>
            <tbody>
              {uploadedFiles.map((file) => (
                <tr key={file.id}>
                  <td>
                    <img
                      src={file.coverUrl}
                      alt="앨범 커버"
                      className="file-management-table-cover"
                    />
                  </td>
                  <td>{file.name}</td>
                  <td>{file.artist}</td>
                  <td>{(file.size / 1024 / 1024).toFixed(2)} MB</td>
                  <td>{new Date(file.uploadedAt).toLocaleString()}</td>
                  <td>
                    <button
                      onClick={() => handleDownload(file)}
                      className="file-management-btn file-management-btn-download"
                      disabled={user?.role !== 'ADMIN'}
                    >
                      <FaDownload />
                    </button>
                    <button
                      onClick={() => handleAddToPlaylist(file)}
                      className="file-management-btn file-management-btn-add"
                    >
                      <FaPlus />
                    </button>
                    <button
                      onClick={() => handleDelete(file.id, file.name)}
                      className="file-management-btn file-management-btn-delete"
                    >
                      <FaTrash />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="file-management-empty">업로드된 파일이 없습니다.</p>
        )}
      </div>
    </div>
  );
};

export default FileManagement;