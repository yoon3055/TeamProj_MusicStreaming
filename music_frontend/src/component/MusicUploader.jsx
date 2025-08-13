import React, { useState, useContext } from 'react';
  import { AuthContext } from '../context/AuthContext';
  import { MusicPlayerContext } from '../context/MusicPlayerContext';
  import { FaUpload } from 'react-icons/fa';
  import axios from 'axios';
  import '../styles/MusicUploader.css';

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

  const MusicUploader = () => {
    const { _user } = useContext(AuthContext);
    const { addSongToPlaylist } = useContext(MusicPlayerContext);
    const [selectedFile, setSelectedFile] = useState(null);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);

    const syncFileToServer = async (fileObj) => {
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
          },
          onUploadProgress: (progressEvent) => {
            const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            setUploadProgress(percentCompleted);
          }
        });
        console.log('파일 서버 동기화 성공:', fileObj);
      } catch (error) {
        console.error('파일 서버 동기화 실패:', error);
        window.showToast('서버 동기화 실패. 로컬에 저장됨.', 'warning');
      }
    };

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
        return;
      }

      if (file.size > 50 * 1024 * 1024) {
        window.showToast('파일 크기는 50MB를 초과할 수 없습니다.', 'error');
        setSelectedFile(null);
        return;
      }

      setSelectedFile({
        name: file.name,
        size: file.size,
        type: file.type,
        fileData: file,
        url: URL.createObjectURL(file),
      });
    };

    const handleUpload = async () => {
      if (!selectedFile) {
        window.showToast('업로드할 파일을 선택해주세요.', 'error');
        return;
      }

      setIsUploading(true);
      setUploadProgress(0);

      const songId = `local-${Date.now()}`;
      const newFile = {
        id: songId,
        name: selectedFile.name,
        artist: '로컬 아티스트',
        coverUrl: '/images/default_cover.png',
        url: selectedFile.url,
        isLocal: true,
        fileData: selectedFile.fileData,
        size: selectedFile.size,
        uploadedAt: new Date().toISOString(),
      };

      try {
        await saveFileToDB(newFile);
        await syncFileToServer(newFile);
        addSongToPlaylist(newFile);
        window.showToast(`${selectedFile.name}이(가) IndexedDB에 저장되었습니다.`, 'success');
        setSelectedFile(null);
        setUploadProgress(0);
      } catch (error) {
        console.error('파일 업로드 실패:', error);
        window.showToast('파일 업로드에 실패했습니다.', 'error');
      } finally {
        setIsUploading(false);
      }
    };

    const handleCancel = () => {
      if (selectedFile?.url) {
        URL.revokeObjectURL(selectedFile.url);
      }
      setSelectedFile(null);
      setUploadProgress(0);
    };

    return (
      <div className="music-uploader-container">
        <h2 className="music-uploader-title">음악 파일 업로드</h2>
        <div className="music-uploader-controls">
          <label className="music-uploader-label">
            오디오 파일 선택 (최대 50MB, MP3/WAV/FLAC)
            <input
              type="file"
              accept="audio/mp3,audio/mpeg,audio/wav,audio/x-wav,audio/flac"
              onChange={handleFileChange}
              className="music-uploader-input"
              disabled={isUploading}
              aria-label="오디오 파일 선택"
            />
          </label>
          {selectedFile && (
            <div className="music-uploader-preview">
              <p><strong>파일명:</strong> {selectedFile.name}</p>
              <p><strong>크기:</strong> {(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
              <p><strong>형식:</strong> {selectedFile.type}</p>
              {isUploading && (
                <div className="upload-progress">
                  <progress value={uploadProgress} max="100" />
                  <span>{uploadProgress}%</span>
                </div>
              )}
              <div className="music-uploader-buttons">
                <button
                  onClick={handleUpload}
                  disabled={isUploading}
                  className="music-uploader-btn music-uploader-btn-upload"
                  aria-label="파일 업로드"
                >
                  <FaUpload /> {isUploading ? '업로드 중...' : '업로드'}
                </button>
                <button
                  onClick={handleCancel}
                  disabled={isUploading}
                  className="music-uploader-btn music-uploader-btn-cancel"
                  aria-label="업로드 취소"
                >
                  취소
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  export default MusicUploader;