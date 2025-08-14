import React, { useState, useEffect, useContext, useCallback, useRef } from 'react';
import { AuthContext } from '../context/AuthContext';
import { MusicPlayerContext } from '../context/MusicPlayerContext';
import { FaUpload, FaDownload, FaTrash, FaPlus } from 'react-icons/fa';
import API from '../api/api';
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
  const [songTitle, setSongTitle] = useState('');
  const [songGenre, setSongGenre] = useState('');
  const [selectedArtistId, setSelectedArtistId] = useState('');
  const [selectedArtistName, setSelectedArtistName] = useState('');
  const [artistSearchQuery, setArtistSearchQuery] = useState('');
  const [artists, setArtists] = useState([]);
  const [filteredArtists, setFilteredArtists] = useState([]);
  const [showArtistDropdown, setShowArtistDropdown] = useState(false);

  // 서버와 파일 목록을 동기화하는 함수
  const syncFilesFromServer = useCallback(async () => {
    try {
      const response = await API.get('/api/admin/music/list');
      const serverFiles = response.data;
      const localFiles = await getAllFilesFromDB();

      // 서버 응답 구조에 맞게 songs 배열 추출
      const filesArray = Array.isArray(serverFiles) ? serverFiles : 
                        (serverFiles && Array.isArray(serverFiles.songs)) ? serverFiles.songs : 
                        (serverFiles && Array.isArray(serverFiles.files)) ? serverFiles.files : 
                        [];

      console.log('서버에서 받은 파일 데이터:', serverFiles);
      console.log('처리할 파일 배열:', filesArray);
      
      if (serverFiles && serverFiles.success && serverFiles.message) {
        console.log('서버 응답 메시지:', serverFiles.message);
      }

      // 서버에는 있지만 로컬에 없는 파일들을 IndexedDB에 추가
      for (const serverFile of filesArray) {
        if (!localFiles.some(localFile => localFile.id === serverFile.id)) {
          await saveFileToDB(serverFile);
        }
      }

      // 업데이트된 파일 목록을 IndexedDB에서 다시 불러와 상태 업데이트
      const updatedFiles = await getAllFilesFromDB();
      setUploadedFiles(updatedFiles);
      console.log('서버에서 파일 목록 동기화 완료.');
    } catch (error) {
      console.error('파일 목록 서버 동기화 실패:', error);
      console.log('서버 동기화 실패. 로컬 데이터 사용.');
    }
  }, []);

  // 서버에 파일을 업로드하는 함수
  const syncFileToServer = useCallback(async (fileObj) => {
    // 업로드 전 파라미터 확인 - fileObj에서 값 추출
    console.log('=== 파일 업로드 파라미터 확인 ===');
    console.log('파일명:', fileObj.fileData?.name);
    console.log('제목:', fileObj.title);
    console.log('장르:', fileObj.genre);
    console.log('아티스트 ID:', fileObj.artistId);
    console.log('아티스트 이름:', selectedArtistName);
    console.log('================================');

    const formData = new FormData();
    formData.append('file', fileObj.fileData);
    formData.append('title', fileObj.title || '');
    formData.append('genre', fileObj.genre || '');
    formData.append('artistId', fileObj.artistId || '');

    try {
      const response = await API.post('/api/admin/music/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      console.log('파일 서버 업로드 성공:', response.data);
      console.log('IndexedDB에서 파일 로드 완료.');
    } catch (error) {
      console.error('파일 서버 업로드 실패:', error);
      if (error.response) {
        console.error('서버 응답:', error.response.data);
        window.showToast(`서버 업로드 실패: ${error.response.data.message || error.response.statusText}`, 'error');
      } else {
        console.log('파일 로드 실패. 빈 목록으로 시작합니다.');
      }
      throw error; // 에러를 다시 던져서 호출자가 처리할 수 있도록 함
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
    const loadArtists = async () => {
      try {
        const response = await API.get('/api/artists');
        
        // 응답 데이터가 배열인지 확인
        const artistsData = Array.isArray(response.data) ? response.data : 
                           (response.data && Array.isArray(response.data.artists)) ? response.data.artists : 
                           [];
        
        console.log('아티스트 데이터 로드:', artistsData);
        setArtists(artistsData);
        setFilteredArtists(artistsData);
        
        if (artistsData.length > 0) {
          console.log(`${artistsData.length}명의 아티스트를 불러왔습니다.`);
        } else {
          console.log('등록된 아티스트가 없습니다.');
        }
      } catch (error) {
        console.error('아티스트 목록 로드 실패:', error);
        console.log('아티스트 목록 로드에 실패했습니다.');
        // 빈 배열로 설정하여 오류 방지
        setArtists([]);
        setFilteredArtists([]);
      }
    };
    loadFiles();
    loadArtists();
  }, [syncFilesFromServer]);

  // 아티스트 검색 핸들러
  const handleArtistSearch = useCallback((query) => {
    setArtistSearchQuery(query);
    if (query.trim() === '') {
      setFilteredArtists(artists);
      setShowArtistDropdown(false);
    } else {
      const filtered = artists.filter(artist => 
        artist.name.toLowerCase().includes(query.toLowerCase())
      );
      setFilteredArtists(filtered);
      setShowArtistDropdown(filtered.length > 0);
    }
  }, [artists]);

  // 아티스트 선택 핸들러
  const handleArtistSelect = useCallback((artist) => {
    setSelectedArtistId(artist.id);
    setSelectedArtistName(artist.name);
    setArtistSearchQuery(artist.name);
    setShowArtistDropdown(false);
  }, []);

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
      console.log('지원되는 파일 형식: MP3, WAV, FLAC');
      setSelectedFile(null);
      // ref를 사용하여 입력 필드 초기화
      if (audioInputRef.current) audioInputRef.current.value = '';
      return;
    }

    const maxSize = 50 * 1024 * 1024;
    if (file.size > maxSize) {
      console.log('파일 크기는 50MB 이하여야 합니다.');
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
    // 파일 선택 시 필드 초기화 제거 - 사용자가 입력한 정보 유지
    setShowArtistDropdown(false);
    console.log('오디오 파일이 선택되었습니다. 제목, 장르, 아티스트를 입력해주세요.');
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
      console.log('지원되는 이미지 형식: JPG, PNG');
      setSelectedCover(null);
      // ref를 사용하여 입력 필드 초기화
      if (coverInputRef.current) coverInputRef.current.value = '';
      return;
    }

    const maxSize = 5 * 1024 * 1024;
    if (cover.size > maxSize) {
      console.log('이미지 크기는 5MB 이하여야 합니다.');
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
    console.log('앨범 커버가 선택되었습니다.');
  };

  // 업로드 버튼 클릭 핸들러
  const handleUpload = useCallback(async () => {
    if (!selectedFile) {
      console.log('업로드할 오디오 파일을 선택해주세요.');
      return;
    }

    if (!songTitle.trim()) {
      console.log('곡 제목을 입력해주세요.');
      return;
    }

    if (!songGenre.trim()) {
      console.log('장르를 선택해주세요.');
      return;
    }

    if (!selectedArtistId) {
      console.log('아티스트를 선택해주세요.');
      return;
    }

    const existingFile = uploadedFiles.find(file => file.name === selectedFile.name);
    if (existingFile) {
      console.log('이미 업로드된 파일입니다.');
      return;
    }

    const songId = `local-${Date.now()}`;
    const newFile = {
      id: songId,
      name: selectedFile.name,
      title: songTitle.trim(), // 사용자가 입력한 곡 제목
      genre: songGenre.trim(), // 사용자가 입력한 장르
      artistId: selectedArtistId, // 사용자가 선택한 아티스트
      coverUrl: selectedCover ? selectedCover.url : noSongImage,
      url: selectedFile.url,
      isLocal: true,
      fileData: selectedFile.file,
      size: selectedFile.size,
      uploadedAt: new Date().toISOString(),
    };

    try {
      // 1. 로컬 DB에 저장
      await saveFileToDB(newFile);
      setUploadedFiles((prevFiles) => [...prevFiles, newFile]);
      addSongToPlaylist(newFile);
      
      // 2. 서버에 업로드 시도
      try {
        await syncFileToServer(newFile);
        console.log(`${selectedFile.name} 파일이 성공적으로 업로드되었습니다.`);
      } catch (serverError) {
        console.warn('서버 업로드 실패, 로컬에만 저장됨:', serverError);
        console.log(`${selectedFile.name} 파일이 로컬에 저장되었습니다. (서버 업로드 실패)`);
      }
      
      // 상태 및 입력 필드 초기화
      setSelectedFile(null);
      setSelectedCover(null);
      setSongTitle('');
      setSongGenre('');
      setSelectedArtistId('');
      if (audioInputRef.current) audioInputRef.current.value = '';
      if (coverInputRef.current) coverInputRef.current.value = '';
    } catch (error) {
      console.error('로컬 업로드 실패:', error);
      console.log('파일 업로드 실패.');
      
      // 오류 발생 시에도 상태 및 입력 필드 초기화
      setSelectedFile(null);
      setSelectedCover(null);
      setSongTitle('');
      setSongGenre('');
      setSelectedArtistId('');
      if (audioInputRef.current) audioInputRef.current.value = '';
      if (coverInputRef.current) coverInputRef.current.value = '';
    }
  }, [selectedFile, selectedCover, songTitle, songGenre, selectedArtistId, uploadedFiles, syncFileToServer, addSongToPlaylist]);

  // 외부 클릭 시 드롭다운 닫기
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.artist-search-container')) {
        setShowArtistDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // 업로드 취소 핸들러
  const handleCancelUpload = useCallback(() => {
    if (selectedFile) URL.revokeObjectURL(selectedFile.url);
    if (selectedCover) URL.revokeObjectURL(selectedCover.url);
    setSelectedFile(null);
    setSelectedCover(null);
    setSongTitle('');
    setSongGenre('');
    setSelectedArtistId('');
    setSelectedArtistName('');
    setArtistSearchQuery('');
    setShowArtistDropdown(false);
    // ref를 사용하여 입력 필드 초기화
    if (audioInputRef.current) audioInputRef.current.value = '';
    if (coverInputRef.current) coverInputRef.current.value = '';
    console.log('업로드가 취소되었습니다.');
  }, [selectedFile, selectedCover]);

  // 다운로드 핸들러 (관리자 전용)
  const handleDownload = useCallback((file) => {
    if (!user || user.role !== 'ADMIN') {
      console.log('관리자만 다운로드할 수 있습니다.');
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
        console.log(`${file.name} 다운로드를 시작합니다.`);
      } catch (error) {
        console.log('다운로드 중 오류가 발생했습니다.');
        console.error('Download error:', error);
      }
    } else {
      console.log('파일 데이터를 찾을 수 없습니다.');
    }
  }, [user]);

  // 삭제 핸들러
  const handleDelete = useCallback(async (fileId, fileName) => {
    if (!window.confirm(`"${fileName}" 파일을 삭제하시겠습니까?`)) {
      return;
    }

    try {
      await deleteFileFromDB(fileId);
      await API.delete(`/api/admin/music/${fileId}`);
      setUploadedFiles((prevFiles) => prevFiles.filter((file) => file.id !== fileId));
      console.log(`${fileName} 파일이 삭제되었습니다.`);
    } catch (error) {
      console.error('File deletion failed:', error);
      console.log('파일 삭제 실패. 로컬 데이터가 남아있을 수 있습니다.');
    }
  }, []);

  // 플레이리스트에 추가 핸들러
  const handleAddToPlaylist = useCallback((file) => {
    try {
      const song = {
        id: file.id,
        title: songTitle,
        genre: songGenre,
        artistId: selectedArtistId,
        coverUrl: file.coverUrl,
        url: file.url,
        isLocal: true,
      };
      addSongToPlaylist(song);
      console.log(`${file.name}이 플레이리스트에 추가되었습니다.`);
    } catch (error) {
      console.log('플레이리스트 추가에 실패했습니다.');
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
        {!selectedFile && (
          <button onClick={handleUpload} className="file-management-btn file-management-btn-upload">
            <FaUpload /> 업로드
          </button>
        )}
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
              
              {/* 곡 정보 입력 필드 */}
              <div className="file-management-song-info">
                <div className="file-management-input-group">
                  <label htmlFor="song-title" className="file-management-input-label">
                    <strong>곡 제목 *</strong>
                  </label>
                  <input
                    type="text"
                    id="song-title"
                    value={songTitle}
                    onChange={(e) => setSongTitle(e.target.value)}
                    placeholder="곡 제목을 입력하세요"
                    className="file-management-text-input"
                    maxLength="255"
                  />
                </div>
                
                <div className="file-management-input-group">
                  <label htmlFor="song-genre" className="file-management-input-label">
                    <strong>장르 *</strong>
                  </label>
                  <select
                    id="song-genre"
                    value={songGenre}
                    onChange={(e) => setSongGenre(e.target.value)}
                    className="file-management-select-input"
                  >
                    <option value="">장르를 선택하세요</option>
                    <option value="Pop">팝 (Pop)</option>
                    <option value="Rock">록 (Rock)</option>
                    <option value="HipHop">힙합 (Hip-Hop)</option>
                    <option value="Jazz">재즈 (Jazz)</option>
                    <option value="Classical">클래식 (Classical)</option>
                    <option value="Electronic">일렉트로닉 (Electronic)</option>
                    <option value="Ballad">발라드 (Ballad)</option>
                    <option value="R&B">R&B</option>
                    <option value="Folk">포크 (Folk)</option>
                    <option value="Country">컨트리 (Country)</option>
                    <option value="Reggae">레게 (Reggae)</option>
                    <option value="Blues">블루스 (Blues)</option>
                    <option value="Other">기타</option>
                  </select>
                </div>
                
                <div className="file-management-input-group">
                  <label htmlFor="song-artist" className="file-management-input-label">
                    <strong>아티스트 *</strong>
                  </label>
                  <div className="artist-search-container" style={{ position: 'relative' }}>
                    <input
                      type="text"
                      value={artistSearchQuery}
                      onChange={(e) => handleArtistSearch(e.target.value)}
                      onFocus={() => {
                        if (filteredArtists.length > 0) {
                          setShowArtistDropdown(true);
                        }
                      }}
                      placeholder="아티스트 이름을 검색하세요"
                      className="upload-input"
                    />
                    {showArtistDropdown && (
                      <div 
                        className="artist-dropdown" 
                        style={{
                          position: 'absolute',
                          top: '100%',
                          left: 0,
                          right: 0,
                          backgroundColor: 'white',
                          border: '1px solid #ddd',
                          borderRadius: '4px',
                          maxHeight: '200px',
                          overflowY: 'auto',
                          zIndex: 1000,
                          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                        }}
                      >
                        {filteredArtists.map(artist => (
                          <div
                            key={artist.id}
                            onClick={() => handleArtistSelect(artist)}
                            style={{
                              padding: '8px 12px',
                              cursor: 'pointer',
                              borderBottom: '1px solid #f0f0f0'
                            }}
                            onMouseEnter={(e) => {
                              e.target.style.backgroundColor = '#f5f5f5';
                            }}
                            onMouseLeave={(e) => {
                              e.target.style.backgroundColor = 'white';
                            }}
                          >
                            {artist.name}
                          </div>
                        ))}
                        {filteredArtists.length === 0 && artistSearchQuery && (
                          <div style={{ padding: '8px 12px', color: '#999' }}>
                            검색 결과가 없습니다.
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
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
                  <td>{typeof file.artist === 'object' ? file.artist?.name : file.artist}</td>
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