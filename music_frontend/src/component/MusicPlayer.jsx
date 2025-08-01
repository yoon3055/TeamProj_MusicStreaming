import React, { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { MusicPlayerContext } from '../context/MusicPlayerContext';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import toast from 'react-hot-toast';
import Equalizer from '../component/Equalizer';
import '../styles/MusicPlayer.css';
import noSongImage from '../assets/default-cover.jpg';
import {
  FaPlay, FaPause, FaStepBackward, FaStepForward, FaRandom,
  FaVolumeUp, FaVolumeMute, FaListUl,
  FaPlus, FaTimes, FaGlobe, FaLock
} from 'react-icons/fa';
import { MdRepeat, MdRepeatOne } from 'react-icons/md';

// Helper for localStorage
const LOCAL_STORAGE_KEY_USER_PLAYLISTS = 'myMusicApp_userPlaylists';
const LOCAL_STORAGE_KEY_SHARED_PLAYLISTS = 'myMusicApp_sharedPlaylists';

const getPlaylistsFromLocalStorage = (key) => {
  try {
    const data = localStorage.getItem(key);
    const playlists = data ? JSON.parse(data) : [];
    return playlists.map(p => ({
      ...p,
      ownerId: String(p.ownerId || '임시 목록')
    }));
  } catch (error) {
    console.error(`Error reading from localStorage (${key}):`, error);
    return [];
  }
};

const savePlaylistsToLocalStorage = (key, playlists) => {
  try {
    const normalizedPlaylists = playlists.map(p => ({
      ...p,
      ownerId: String(p.ownerId || '임시 목록')
    }));
    localStorage.setItem(key, JSON.stringify(normalizedPlaylists));
  } catch (error) {
    console.error(`Error writing to localStorage (${key}):`, error);
  }
};

// 가사 데이터 (예시)
const lyricsData = [
  { time: 0, text: "인트로 시작 🎶" },
  { time: 5, text: "처음 가사가 시작됩니다" },
  { time: 10, text: "계속 이어지는 멜로디" },
  { time: 15, text: "후렴이 다가오네요" },
  { time: 20, text: "감정이 최고조에 달합니다" },
  { time: 25, text: "곡이 거의 끝나갑니다" },
  { time: 30, text: "마무리 단계!" },
];

const MusicPlayer = () => {
  const navigate = useNavigate();
  const { playlist, currentIndex, playSong, audioRef, updateAudioSrc, setPlaylist } = React.useContext(MusicPlayerContext);
  const { user } = useAuth();

  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.5);
  const [isMuted, setIsMuted] = useState(false);
  const [repeatMode, setRepeatMode] = useState('none');
  const [shuffleMode, setShuffleMode] = useState(false);
  const [showPlaylistPopup, setShowPlaylistPopup] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentLyric, setCurrentLyric] = useState('');
  const [playbackQueue, setPlaybackQueue] = useState([]);
  const [currentQueueIndex, setCurrentQueueIndex] = useState(0);
  const [userPlaylists, setUserPlaylists] = useState([]);
  const [sharedPlaylists, setSharedPlaylists] = useState([]);
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [editingPlaylistId, setEditingPlaylistId] = useState(null);
  const [editingPlaylistName, setEditingPlaylistName] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [errorMessage, setErrorMessage] = useState('');
  const popupRef = useRef(null);

  const API_BASE_URL = import.meta.env.VITE_REACT_APP_API_URL || 'http://localhost:8080';
  console.log('API_BASE_URL:', API_BASE_URL); // 디버깅: 백엔드 URL 확인

  // 오류 메시지 표시 헬퍼 함수
  const displayError = useCallback((message) => {
    if (showPlaylistPopup) {
      setErrorMessage(message);
    } else {
      toast.error(message);
    }
  }, [showPlaylistPopup]);

  const currentSong = useMemo(() => {
    console.log('Current song calculation:', {
      shuffleMode,
      playbackQueueLength: playbackQueue.length,
      currentQueueIndex,
      playlistLength: playlist.length,
      currentIndex
    });

    if (shuffleMode && playbackQueue.length > 0) {
      const song = playbackQueue[currentQueueIndex] || {
        id: null,
        title: '재생 중인 곡 없음',
        artist: '선택해주세요',
        albumId: null,
        coverUrl: noSongImage,
        audioUrl: ''
      };
      console.log('Selected song (shuffle):', song);
      return song;
    }

    const song = playlist[currentIndex] || {
      id: null,
      title: '재생 중인 곡 없음',
      artist: '선택해주세요',
      albumId: null,
      coverUrl: noSongImage,
      audioUrl: ''
    };
    console.log('Selected song (normal):', song);
    return song;
  }, [playlist, currentIndex, shuffleMode, playbackQueue, currentQueueIndex]);

  // 이전 곡 재생
  const handlePrevSong = useCallback(() => {
    let targetIndex;
    if (repeatMode === 'one') {
      targetIndex = currentQueueIndex;
    } else if (shuffleMode) {
      targetIndex = (currentQueueIndex - 1 + playbackQueue.length) % playbackQueue.length;
    } else {
      targetIndex = (currentIndex - 1 + playlist.length) % playlist.length;
    }

    if (shuffleMode && playbackQueue.length > 0) {
      setCurrentQueueIndex(targetIndex);
      playSong(playlist.findIndex(s => s.id === playbackQueue[targetIndex].id));
    } else {
      playSong(targetIndex);
    }
  }, [repeatMode, shuffleMode, currentQueueIndex, playbackQueue, currentIndex, playlist, playSong]);

  // 다음 곡 재생
  const handleNextSong = useCallback(() => {
    let targetIndex;
    if (repeatMode === 'one') {
      targetIndex = currentQueueIndex;
    } else if (shuffleMode) {
      targetIndex = (currentQueueIndex + 1) % playbackQueue.length;
      if (playbackQueue.length > 0 && targetIndex === 0 && repeatMode === 'none') {
        setIsPlaying(false);
        return;
      }
    } else {
      targetIndex = (currentIndex + 1) % playlist.length;
      if (playlist.length > 0 && targetIndex === 0 && repeatMode === 'none') {
        setIsPlaying(false);
        return;
      }
    }

    if (shuffleMode && playbackQueue.length > 0) {
      setCurrentQueueIndex(targetIndex);
      playSong(playlist.findIndex(s => s.id === playbackQueue[targetIndex].id));
    } else {
      playSong(targetIndex);
    }
  }, [repeatMode, shuffleMode, currentQueueIndex, playbackQueue, currentIndex, playlist, playSong]);

  // 플레이리스트 데이터 로드
  useEffect(() => {
    if (user?.id) {
      const fetchUserPlaylists = async () => {
        try {
          const response = await axios.get(`${API_BASE_URL}/api/playlists`, {
            params: { userId: user.id },
            headers: { Authorization: `Bearer ${localStorage.getItem('jwt')}` }
          });
          setUserPlaylists(response.data.map(p => ({
            ...p,
            ownerId: String(p.user?.nickname || '임시 목록')
          })));
        } catch (err) {
          console.error('내 플레이리스트 조회 실패:', {
            status: err.response?.status,
            data: err.response?.data,
            message: err.message
          });
          if (err.response?.status === 401 || err.response?.data === 'invalid token') {
            displayError('로그인이 필요합니다. 로그인 페이지에서 로그인해 주세요.');
          } else {
            displayError('백엔드에서 플레이리스트를 불러오지 못했습니다. 로컬 데이터를 사용합니다.');
            setUserPlaylists(getPlaylistsFromLocalStorage(`${LOCAL_STORAGE_KEY_USER_PLAYLISTS}_${user.id}`));
          }
        }
      };
      fetchUserPlaylists();
      setSharedPlaylists(getPlaylistsFromLocalStorage(`${LOCAL_STORAGE_KEY_SHARED_PLAYLISTS}_${user.id}`));
      console.log('JWT:', localStorage.getItem('jwt')); // 디버깅: JWT 확인
    } else {
      displayError('로그인이 필요합니다. 로그인 페이지에서 로그인해 주세요.');
    }
  }, [user?.id, API_BASE_URL, displayError]);

  // 플레이리스트 데이터 저장
  useEffect(() => {
    if (user?.id) {
      savePlaylistsToLocalStorage(`${LOCAL_STORAGE_KEY_USER_PLAYLISTS}_${user.id}`, userPlaylists);
    }
  }, [userPlaylists, user?.id]);

  useEffect(() => {
    if (user?.id) {
      savePlaylistsToLocalStorage(`${LOCAL_STORAGE_KEY_SHARED_PLAYLISTS}_${user.id}`, sharedPlaylists);
    }
  }, [sharedPlaylists, user?.id]);

  // 셔플 모드 시 재생 큐 관리
  useEffect(() => {
    if (shuffleMode && playlist.length > 0) {
      const shuffledPlaylist = [...playlist].sort(() => Math.random() - 0.5);
      setPlaybackQueue(shuffledPlaylist);
      const currentSongInShuffledQueue = shuffledPlaylist.findIndex(song => song.id === currentSong.id);
      setCurrentQueueIndex(currentSongInShuffledQueue !== -1 ? currentSongInShuffledQueue : 0);
    } else {
      setPlaybackQueue([]);
      setCurrentQueueIndex(0);
    }
  }, [shuffleMode, playlist, currentSong.id]);

  // 오디오 재생 제어 및 이벤트 리스너
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) {
      console.error('audioRef is not initialized');
      return;
    }

    if (!currentSong.id || !currentSong.audioUrl) {
      console.log('No valid song or audio URL:', currentSong);
      setIsPlaying(false);
      audio.src = '';
      audio.load();
      setProgress(0);
      setCurrentLyric('');
      return;
    }

    if (audio.src !== currentSong.audioUrl) {
      updateAudioSrc(currentSong.audioUrl);
      audio.load();
    }
    audio.volume = isMuted ? 0 : volume;

    if (isPlaying) {
      audio.play().catch(error => {
        console.error('Audio play failed:', error);
        displayError('오디오 재생에 실패했습니다. 다음 곡을 시도하거나 관리자에게 문의해주세요.');
        setIsPlaying(false);
      });
    } else {
      audio.pause();
    }

    const handleTimeUpdate = () => {
      if (audio.duration) {
        setProgress((audio.currentTime / audio.duration) * 100);
      }
      const matched = lyricsData.findLast(l => audio.currentTime >= l.time);
      if (matched && matched.text !== currentLyric) {
        setCurrentLyric(matched.text);
      } else if (!matched && currentLyric !== '') {
        setCurrentLyric('');
      }
    };

    const handleEnded = () => {
      setIsPlaying(false);
      if (repeatMode === 'one') {
        audio.currentTime = 0;
        audio.play().catch(error => {
          console.error('Replay failed:', error);
          displayError('곡 재생에 실패했습니다.');
        });
        setIsPlaying(true);
      } else {
        handleNextSong();
      }
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [isPlaying, volume, isMuted, currentSong, displayError,audioRef, currentSong.audioUrl, updateAudioSrc, repeatMode, currentLyric, handleNextSong]);

  // 플레이리스트 팝업 외부 클릭 처리
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (popupRef.current && !popupRef.current.contains(e.target)) {
        setShowPlaylistPopup(false);
        setErrorMessage('');
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // 재생 기록 로깅
  useEffect(() => {
    const logPlay = async () => {
      if (currentSong.id && user && isPlaying) {
        try {
          await axios.post(`${API_BASE_URL}/api/histories`, {
            userId: user.id,
            songId: currentSong.id,
            playedAt: new Date().toISOString(),
          }, {
            headers: { Authorization: `Bearer ${localStorage.getItem('jwt')}` }
          });
          console.log(`재생 기록 생성 성공: ${currentSong.title}`);
        } catch (err) {
          console.error('재생 기록 생성 실패:', {
            status: err.response?.status,
            data: err.response?.data,
            message: err.message
          });
          if (err.response?.status === 401 || err.response?.data === 'invalid token') {
            displayError('로그인이 필요합니다. 로그인 페이지에서 로그인해 주세요.');
          } else {
            displayError('재생 기록 저장에 실패했습니다.');
          }
        }
      }
    };
    if (isPlaying) {
      const logTimeout = setTimeout(logPlay, 1000);
      return () => clearTimeout(logTimeout);
    }
  }, [currentSong.id, user, isPlaying, API_BASE_URL, currentSong.title, displayError]);

  // 재생/일시정지 토글
  const handleTogglePlay = () => {
    if (!currentSong.id || !currentSong.audioUrl) {
      displayError('재생할 곡을 선택해주세요.');
      console.log('No valid song:', currentSong);
      return;
    }

    const audio = audioRef.current;
    if (!audio) {
      displayError('오디오 요소를 찾을 수 없습니다.');
      console.error('audioRef is not initialized');
      return;
    }

    setIsPlaying(prev => {
      console.log('Toggling play, current isPlaying:', prev, 'song:', currentSong.title);
      if (!prev) {
        audio.play().catch(error => {
          console.error('Audio play failed:', error);
          displayError('오디오 재생에 실패했습니다.');
          return false;
        });
      } else {
        audio.pause();
      }
      return !prev;
    });
  };

  // 진행 바 변경
const handleProgressChange = useCallback((value) => {
  console.log('Progress changed to:', value);
  setProgress(value);
  const audio = audioRef.current;
  if (audio && audio.duration && isPlaying) {
    const time = (value / 100) * audio.duration;
    audio.currentTime = time;
  }
}, [audioRef, isPlaying]);

  // 볼륨 토글
  const toggleMute = () => {
    setIsMuted(prev => {
      const newMuted = !prev;
      if (audioRef.current) {
        audioRef.current.muted = newMuted;
      }
      return newMuted;
    });
  };

  // 반복 모드 토글
  const toggleRepeat = () => {
    const modes = ['none', 'all', 'one'];
    setRepeatMode(modes[(modes.indexOf(repeatMode) + 1) % modes.length]);
  };

  // 셔플 모드 토글
  const toggleShuffle = () => {
    setShuffleMode(prev => !prev);
  };

  // 플레이리스트 팝업 토글
  const togglePlaylistPopup = () => {
    setShowPlaylistPopup(prev => !prev);
    setErrorMessage('');
  };

  // 앨범 커버 클릭
  const handleAlbumClick = () => currentSong.albumId && navigate(`/album/${currentSong.albumId}`);

  // 가사 불러오기 (더미 구현)
  const fetchLyricsForCurrentSong = useCallback(async (songId) => {
    console.log(`Fetching lyrics for song ID: ${songId}`);
  }, []);

  // 현재 곡 변경 시 가사 초기화
  useEffect(() => {
    if (currentSong.id) {
      setCurrentLyric('');
      fetchLyricsForCurrentSong(currentSong.id);
    }
  }, [currentSong.id, fetchLyricsForCurrentSong]);

  // 새 플레이리스트 추가
  const handleAddPlaylist = async () => {
    if (!user?.id) {
      displayError('사용자 정보가 없습니다. 로그인 페이지에서 로그인해 주세요.');
      return;
    }
    if (newPlaylistName.trim() === '') {
      displayError('재생 목록 이름을 입력해주세요.');
      return;
    }

    const newPlaylist = {
      id: crypto.randomUUID(),
      title: newPlaylistName.trim(),
      ownerId: String(user.nickname || '임시 목록'),
      songs: [],
      createdAt: new Date().toISOString(),
      isPublic: false,
    };

    setUserPlaylists(prev => [...prev, newPlaylist]);
    savePlaylistsToLocalStorage(`${LOCAL_STORAGE_KEY_USER_PLAYLISTS}_${user.id}`, [...userPlaylists, newPlaylist]);
    setNewPlaylistName('');
    toast.success(`'${newPlaylist.title}' 재생 목록이 생성되었습니다.`);

    try {
      const response = await axios.post(`${API_BASE_URL}/api/playlists`, {
        title: newPlaylist.title,
        isPublic: newPlaylist.isPublic,
        userId: user.id
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('jwt')}` }
      });
      console.log(`백엔드에 플레이리스트 저장 성공: ${newPlaylist.title}`);
      setUserPlaylists(prev =>
        prev.map(p => (p.id === newPlaylist.id ? { ...p, id: response.data.id } : p))
      );
      savePlaylistsToLocalStorage(`${LOCAL_STORAGE_KEY_USER_PLAYLISTS}_${user.id}`, 
        userPlaylists.map(p => (p.id === newPlaylist.id ? { ...p, id: response.data.id } : p))
      );
    } catch (err) {
      console.error('백엔드 플레이리스트 생성 실패:', {
        status: err.response?.status,
        data: err.response?.data,
        message: err.message
      });
      if (err.response?.status === 401 || err.response?.data === 'invalid token') {
        displayError('로그인이 필요합니다. 로그인 페이지에서 로그인해 주세요.');
      } else if (err.response?.status === 403) {
        displayError('플레이리스트 생성 권한이 없습니다. 로컬에 저장되었습니다.');
      } else {
        displayError(`백엔드 연결 실패: ${err.response?.data || err.message || '서버 오류'}. 로컬에 저장되었습니다.`);
      }
    }
  };

  // 플레이리스트 이름 변경 시작
  const startEditingPlaylist = (playlistId, currentName) => {
    setEditingPlaylistId(playlistId);
    setEditingPlaylistName(currentName);
  };

  // 플레이리스트 이름 변경 저장
  const handleSavePlaylistName = async (playlistId, isShared = false) => {
    if (editingPlaylistName.trim() === '') {
      displayError('재생 목록 이름을 입력해주세요.');
      return;
    }

    if (!isShared) {
      setUserPlaylists(prev =>
        prev.map(p => (p.id === playlistId ? { ...p, title: editingPlaylistName.trim() } : p))
      );
      savePlaylistsToLocalStorage(`${LOCAL_STORAGE_KEY_USER_PLAYLISTS}_${user?.id}`, 
        userPlaylists.map(p => (p.id === playlistId ? { ...p, title: editingPlaylistName.trim() } : p))
      );
      try {
        await axios.put(`${API_BASE_URL}/api/playlists/${playlistId}`, {
          title: editingPlaylistName.trim(),
          userId: user?.id,
          isPublic: userPlaylists.find(p => p.id === playlistId)?.isPublic
        }, {
          headers: { Authorization: `Bearer ${localStorage.getItem('jwt')}` }
        });
        console.log(`플레이리스트 이름 업데이트 성공: ${editingPlaylistName}`);
        toast.success('재생 목록 이름이 변경되었습니다.');
      } catch (err) {
        console.error('백엔드 플레이리스트 이름 업데이트 실패:', {
          status: err.response?.status,
          data: err.response?.data,
          message: err.message
        });
        if (err.response?.status === 401 || err.response?.data === 'invalid token') {
          displayError('로그인이 필요합니다. 로그인 페이지에서 로그인해 주세요.');
        } else if (err.response?.status === 403) {
          displayError('권한이 없습니다. 로컬에 저장되었습니다.');
        } else {
          displayError(`백엔드 연결 실패: ${err.response?.data || err.message || '서버 오류'}. 로컬에 저장되었습니다.`);
        }
      }
    } else {
      setSharedPlaylists(prev =>
        prev.map(p => (p.id === playlistId ? { ...p, title: editingPlaylistName.trim() } : p))
      );
      savePlaylistsToLocalStorage(`${LOCAL_STORAGE_KEY_SHARED_PLAYLISTS}_${user?.id}`, 
        sharedPlaylists.map(p => (p.id === playlistId ? { ...p, title: editingPlaylistName.trim() } : p))
      );
      toast.success('공유 플레이리스트 이름이 로컬에서 변경되었습니다.');
    }
    setEditingPlaylistId(null);
    setEditingPlaylistName('');
  };

  // 플레이리스트 삭제
  const handleDeletePlaylist = async (playlistIdToDelete, isShared = false) => {
    if (!window.confirm('정말로 이 재생 목록을 삭제하시겠습니까?')) {
      return;
    }

    if (isShared) {
      setSharedPlaylists(prev => prev.filter(p => p.id !== playlistIdToDelete));
      savePlaylistsToLocalStorage(`${LOCAL_STORAGE_KEY_SHARED_PLAYLISTS}_${user?.id}`, 
        sharedPlaylists.filter(p => p.id !== playlistIdToDelete)
      );
      toast.success('공유 플레이리스트가 삭제되었습니다.');
    } else {
      setUserPlaylists(prev => prev.filter(p => p.id !== playlistIdToDelete));
      savePlaylistsToLocalStorage(`${LOCAL_STORAGE_KEY_USER_PLAYLISTS}_${user?.id}`, 
        userPlaylists.filter(p => p.id !== playlistIdToDelete)
      );
      try {
        await axios.delete(`${API_BASE_URL}/api/playlists/${playlistIdToDelete}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('jwt')}` }
        });
        console.log(`플레이리스트 삭제 성공: ${playlistIdToDelete}`);
        toast.success('플레이리스트가 삭제되었습니다.');
      } catch (err) {
        console.error('백엔드 플레이리스트 삭제 실패:', {
          status: err.response?.status,
          data: err.response?.data,
          message: err.message
        });
        if (err.response?.status === 401 || err.response?.data === 'invalid token') {
          displayError('로그인이 필요합니다. 로그인 페이지에서 로그인해 주세요.');
        } else if (err.response?.status === 403) {
          displayError('권한이 없습니다. 로컬에서 삭제되었습니다.');
        } else if (err.response?.status === 404) {
          displayError('플레이리스트를 찾을 수 없습니다. 로컬에서 삭제되었습니다.');
        } else {
          displayError(`백엔드 연결 실패: ${err.response?.data || err.message || '서버 오류'}. 로컬에서 삭제되었습니다.`);
        }
      }
    }
  };

  // 플레이리스트 공개/비공개 전환
  const togglePlaylistVisibility = async (playlistId) => {
    if (!user?.id) {
      displayError('로그인이 필요합니다. 로그인 페이지에서 로그인해 주세요.');
      return;
    }

    const playlist = userPlaylists.find(p => p.id === playlistId);
    if (!playlist) {
      displayError('플레이리스트를 찾을 수 없습니다.');
      return;
    }

    const newVisibility = !playlist.isPublic;

    setUserPlaylists(prev =>
      prev.map(p => (p.id === playlistId ? { ...p, isPublic: newVisibility } : p))
    );
    savePlaylistsToLocalStorage(`${LOCAL_STORAGE_KEY_USER_PLAYLISTS}_${user.id}`, 
      userPlaylists.map(p => (p.id === playlistId ? { ...p, isPublic: newVisibility } : p))
    );
    toast.success(`플레이리스트가 ${newVisibility ? '공개' : '비공개'}로 설정되었습니다.`);

    try {
      await axios.put(`${API_BASE_URL}/api/playlists/${playlistId}/visibility`, {
        isPublic: newVisibility
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('jwt')}` }
      });
      console.log(`플레이리스트 공개/비공개 전환 성공: ${playlistId}`);
    } catch (err) {
      console.error('백엔드 공개/비공개 전환 실패:', {
        status: err.response?.status,
        data: err.response?.data,
        message: err.message
      });
      if (err.response?.status === 401 || err.response?.data === 'invalid token') {
        displayError('로그인이 필요합니다. 로그인 페이지에서 로그인해 주세요.');
      } else if (err.response?.status === 403) {
        displayError('권한이 없습니다. 로컬 데이터로 유지됩니다.');
      } else if (err.response?.status === 404) {
        displayError('플레이리스트를 찾을 수 없습니다. 로컬 데이터로 유지됩니다.');
      } else {
        displayError(`백엔드 연결 실패: ${err.response?.data || err.message || '서버 오류'}. 로컬 데이터는 업데이트되었습니다.`);
      }
    }
  };

  // 플레이리스트 로드
  const handleLoadPlaylist = async (playlistToLoad) => {
    if (!setPlaylist) {
      displayError('재생 목록을 로드할 수 없습니다. Context 설정을 확인해주세요.');
      return;
    }

    try {
      const response = await axios.get(`${API_BASE_URL}/api/playlists/${playlistToLoad.id}/tracks`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('jwt')}` }
      });
      console.log('트랙 조회 응답:', response.data);
      const songs = response.data.map(track => ({
        id: track.song.id,
        title: track.song.title,
        artist: track.song.artist,
        duration: track.song.duration,
        audioUrl: track.song.audioUrl || '',
        coverUrl: track.song.coverUrl || noSongImage
      }));
      setPlaylist(songs);
      playSong(0);
      setShowPlaylistPopup(false);
      setErrorMessage('');
      toast.success(`'${playlistToLoad.title}' 플레이리스트가 로드되었습니다.`);
    } catch (err) {
      console.error('플레이리스트 트랙 조회 실패:', {
        status: err.response?.status,
        data: err.response?.data,
        message: err.message
      });
      if (err.response?.status === 401 || err.response?.data === 'invalid token') {
        displayError('로그인이 필요합니다. 로그인 페이지에서 로그인해 주세요.');
      } else if (err.response?.status === 403) {
        displayError('권한이 없습니다. 로컬 데이터를 사용합니다.');
        setPlaylist(JSON.parse(JSON.stringify(playlistToLoad.songs || [])));
        playSong(0);
        setShowPlaylistPopup(false);
      } else if (err.response?.status === 404) {
        displayError('플레이리스트를 찾을 수 없습니다. 로컬 데이터를 사용합니다.');
        setPlaylist(JSON.parse(JSON.stringify(playlistToLoad.songs || [])));
        playSong(0);
        setShowPlaylistPopup(false);
      } else {
        displayError(`백엔드 연결 실패: ${err.response?.data || err.message || '서버 오류'}. 로컬 데이터를 사용합니다.`);
        setPlaylist(JSON.parse(JSON.stringify(playlistToLoad.songs || [])));
        playSong(0);
        setShowPlaylistPopup(false);
      }
    }
  };

  // 공개 플레이리스트 검색
  const handleSearchPublicPlaylists = async () => {
    setSearchResults([]);
    setErrorMessage('');
    if (!searchTerm.trim()) {
      displayError('검색어를 입력해주세요.');
      return;
    }

    let publicPlaylists = [];
    try {
      const response = await axios.get(`${API_BASE_URL}/api/playlists/public`, {
        params: {
          keyword: searchTerm,
          page: 0,
          size: 10
        },
        headers: { Authorization: `Bearer ${localStorage.getItem('jwt')}` }
      });
      console.log('공개 플레이리스트 검색 응답:', response.data);
      publicPlaylists = (response.data.content || response.data || [])
        .filter(p => p.isPublic)
        .map(p => ({
          ...p,
          ownerId: String(p.user?.nickname || p.ownerId || '임시 목록')
        }));
      if (publicPlaylists.length === 0) {
        displayError('공개 플레이리스트 검색 결과가 없습니다. 로컬 데이터를 확인합니다.');
      }
    } catch (err) {
      console.error('공개 플레이리스트 검색 실패:', {
        status: err.response?.status,
        data: err.response?.data,
        message: err.message
      });
      if (err.response?.status === 401 || err.response?.data === 'invalid token') {
        displayError('로그인이 필요합니다. 로그인 페이지에서 로그인해 주세요.');
        return;
      } else if (err.response?.status === 403) {
        displayError('권한이 없습니다. 로컬 데이터를 사용합니다.');
      } else {
        displayError(`백엔드 연결 실패: ${err.response?.data || err.message || '서버 오류'}. 로컬 데이터를 검색합니다.`);
      }
    }

    const allPlaylists = [];
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith(LOCAL_STORAGE_KEY_USER_PLAYLISTS) || key.startsWith(LOCAL_STORAGE_KEY_SHARED_PLAYLISTS)) {
        const playlists = getPlaylistsFromLocalStorage(key);
        allPlaylists.push(...playlists.map(p => ({
          ...p,
          isShared: key.startsWith(LOCAL_STORAGE_KEY_SHARED_PLAYLISTS)
        })));
      }
    });
    const localPublicPlaylists = allPlaylists
      .filter(p => p.isPublic && p.title.toLowerCase().includes(searchTerm.toLowerCase()))
      .map(p => ({
        ...p,
        ownerId: String(p.ownerId || '임시 목록')
      }));
    publicPlaylists = [...publicPlaylists, ...localPublicPlaylists];
    console.log('로컬 스토리지에서 검색된 플레이리스트:', localPublicPlaylists);

    setSearchResults(publicPlaylists);
    if (publicPlaylists.length === 0) {
      displayError('검색된 공개 플레이리스트가 없습니다.');
    } else {
      toast.success('플레이리스트 검색 완료');
    }
  };

  // 공개 플레이리스트 가져오기
  const handleImportPlaylist = async (playlistToImport) => {
    if (!user?.id) {
      displayError('플레이리스트를 가져오려면 로그인이 필요합니다. 로그인 페이지에서 로그인해 주세요.');
      return;
    }
    const alreadyImported = sharedPlaylists.some(p => p.sharedFrom === playlistToImport.id);
    if (alreadyImported) {
      displayError('이미 가져온 플레이리스트입니다.');
      return;
    }

    try {
      const response = await axios.get(`${API_BASE_URL}/api/playlists/${playlistToImport.id}/tracks`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('jwt')}` }
      });
      console.log('플레이리스트 가져오기 응답:', response.data);
      const songs = response.data.map(track => ({
        id: track.song.id,
        title: track.song.title,
        artist: track.song.artist,
        duration: track.song.duration,
        audioUrl: track.song.audioUrl || '',
        coverUrl: track.song.coverUrl || noSongImage
      }));

      const importedPlaylist = {
        id: crypto.randomUUID(),
        title: playlistToImport.title,
        ownerId: String(playlistToImport.ownerId || '임시 목록'),
        songs,
        createdAt: new Date().toISOString(),
        isPublic: false,
        sharedFrom: playlistToImport.id,
      };
      setSharedPlaylists(prev => [...prev, importedPlaylist]);
      savePlaylistsToLocalStorage(`${LOCAL_STORAGE_KEY_SHARED_PLAYLISTS}_${user.id}`, [...sharedPlaylists, importedPlaylist]);
      toast.success(`'${playlistToImport.title}' 플레이리스트를 성공적으로 가져왔습니다.`);
      setSearchTerm('');
      setSearchResults([]);
      setErrorMessage('');
    } catch (err) {
      console.error('플레이리스트 가져오기 실패:', {
        status: err.response?.status,
        data: err.response?.data,
        message: err.message
      });
      if (err.response?.status === 401 || err.response?.data === 'invalid token') {
        displayError('로그인이 필요합니다. 로그인 페이지에서 로그인해 주세요.');
      } else if (err.response?.status === 403) {
        displayError('권한이 없습니다.');
      } else if (err.response?.status === 404) {
        displayError('플레이리스트를 찾을 수 없습니다.');
      } else {
        displayError(`백엔드 연결 실패: ${err.response?.data || err.message || '서버 오류'}.`);
      }
    }
  };

  // "공개 플레이리스트 더보기" 버튼 클릭
  const handleMorePublicPlaylists = () => {
    navigate('/history');
  };

  // ownerId 표시
  const safeOwnerId = (ownerId) => {
    const id = ownerId == null || typeof ownerId !== 'string' ? '임시 목록' : ownerId;
    return id.length > 6 ? id.substring(0, 6) + '...' : id;
  };

  return (
    <div className="music-player-bar">
      {/* 왼쪽: 앨범 + 곡 정보 + 가사 */}
      <div className="music-player-left">
        <img src={currentSong.coverUrl} alt="cover" className="music-player-album-cover" onClick={handleAlbumClick} />
        <div className="music-player-text-details">
          <div className="music-player-song-title">{currentSong.title}</div>
          <div className="music-player-song-artist">{currentSong.artist}</div>
        </div>
        <div className="music-player-lyrics-box">
          {currentLyric}
        </div>
      </div>

      {/* 중앙: 컨트롤 영역 */}
      <div className="music-player-controls-area">
        <div className="music-player-buttons">
          <button onClick={toggleShuffle} className="control-button">
            <FaRandom className="icon-style" style={{ color: shuffleMode ? '#4B0082' : '#b3b3b3' }} />
          </button>
          <button onClick={handlePrevSong} className="control-button">
            <FaStepBackward className="icon-style" />
          </button>
          <button
            onClick={() => {
              console.log('Play button clicked, isPlaying:', isPlaying, 'currentSong:', currentSong);
              handleTogglePlay();
            }}
            className="control-button play-button"
          >
            {isPlaying ? <FaPause className="icon-style" /> : <FaPlay className="icon-style" />}
          </button>
          <button onClick={handleNextSong} className="control-button">
            <FaStepForward className="icon-style" />
          </button>
          <button onClick={toggleRepeat} className="control-button">
            {repeatMode === 'none' ? (
              <MdRepeat className="icon-style" style={{ color: '#b3b3b3' }} />
            ) : repeatMode === 'all' ? (
              <MdRepeat className="icon-style" />
            ) : (
              <MdRepeatOne className="icon-style" />
            )}
          </button>
        </div>
        <input
          type="range"
          min="0"
          max="100"
          value={progress}
          onChange={(e) => handleProgressChange(parseInt(e.target.value))}
          className="music-player-progress-bar"
        />
      </div>

      {/* 우측: 이퀄라이저 + 볼륨 + 목록 */}
      <div className="music-player-extra-controls">
        <Equalizer mode="bounce-always" isPlaying={isPlaying} barCount={40} />
        <div className="volume-control-wrapper">
          <button onClick={toggleMute} className="volume-toggle-button">
            {isMuted || (audioRef.current && audioRef.current.volume === 0) ? <FaVolumeMute className="icon-style" /> : <FaVolumeUp className="icon-style" />}
          </button>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={isMuted ? 0 : volume}
            onChange={(e) => {
              setVolume(parseFloat(e.target.value));
              if (audioRef.current) {
                audioRef.current.volume = parseFloat(e.target.value);
              }
              if (isMuted) setIsMuted(false);
            }}
            className="volume-slider"
          />
          <span className="volume-level">{`${Math.round(volume * 100)}%`}</span>
        </div>
        <button onClick={togglePlaylistPopup} className="playlist-toggle-button">
          <FaListUl className="icon-style" />
        </button>
      </div>

      {/* 플레이리스트 팝업 */}
      {showPlaylistPopup && (
        <div className="playlist-popup" ref={popupRef}>
          <div className="playlist-header">
            <input
              type="text"
              placeholder="새 재생 목록 이름"
              value={newPlaylistName}
              onChange={(e) => setNewPlaylistName(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') handleAddPlaylist();
              }}
              className="playlist-input"
            />
            <button onClick={handleAddPlaylist} className="popup-button">
              <FaPlus className="icon-style-popup" />
            </button>
          </div>

          <div className="playlist-section">
            <h5>내 재생 목록</h5>
            <ul>
              {userPlaylists.length === 0 ? (
                <li>생성된 재생 목록이 없습니다.</li>
              ) : (
                userPlaylists.map((playlistItem) => (
                  <li key={playlistItem.id}>
                    <div className="playlist-item-title-wrapper">
                      {editingPlaylistId === playlistItem.id ? (
                        <input
                          type="text"
                          value={editingPlaylistName}
                          onChange={(e) => setEditingPlaylistName(e.target.value)}
                          onBlur={() => handleSavePlaylistName(playlistItem.id)}
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') handleSavePlaylistName(playlistItem.id);
                          }}
                          className="playlist-name-input"
                          autoFocus
                        />
                      ) : (
                        <span
                          onClick={() => handleLoadPlaylist(playlistItem)}
                          onDoubleClick={() => startEditingPlaylist(playlistItem.id, playlistItem.title)}
                        >
                          {playlistItem.title}
                        </span>
                      )}
                    </div>
                    <div className="playlist-item-buttons">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          togglePlaylistVisibility(playlistItem.id);
                        }}
                        className={`playlist-visibility-toggle ${playlistItem.isPublic ? 'public' : ''}`}
                        title={playlistItem.isPublic ? '공개 플레이리스트' : '비공개 플레이리스트'}
                      >
                        {playlistItem.isPublic ? <FaGlobe /> : <FaLock />}
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeletePlaylist(playlistItem.id);
                        }}
                        className="playlist-item-delete-button"
                      >
                        <FaTimes />
                      </button>
                    </div>
                  </li>
                ))
              )}
            </ul>
          </div>

          <div className="playlist-section shared-playlists-section">
            <h5>공유받은 재생 목록</h5>
            <ul>
              {sharedPlaylists.length === 0 ? (
                <li>공유받은 재생 목록이 없습니다.</li>
              ) : (
                sharedPlaylists.map((playlistItem) => (
                  <li key={playlistItem.id}>
                    <div className="playlist-item-title-wrapper">
                      {editingPlaylistId === playlistItem.id ? (
                        <input
                          type="text"
                          value={editingPlaylistName}
                          onChange={(e) => setEditingPlaylistName(e.target.value)}
                          onBlur={() => handleSavePlaylistName(playlistItem.id, true)}
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') handleSavePlaylistName(playlistItem.id, true);
                          }}
                          className="playlist-name-input"
                          autoFocus
                        />
                      ) : (
                        <span
                          onClick={() => handleLoadPlaylist(playlistItem)}
                          onDoubleClick={() => startEditingPlaylist(playlistItem.id, playlistItem.title)}
                        >
                          {playlistItem.title} (by {safeOwnerId(playlistItem.ownerId)})
                        </span>
                      )}
                    </div>
                    <div className="playlist-item-buttons">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeletePlaylist(playlistItem.id, true);
                        }}
                        className="playlist-item-delete-button"
                      >
                        <FaTimes />
                      </button>
                    </div>
                  </li>
                ))
              )}
            </ul>
          </div>

          <div className="playlist-section playlist-search-section">
            <h5>공개 플레이리스트 검색</h5>
            <div className="playlist-search-input-group">
              <input
                type="text"
                placeholder="플레이리스트 검색"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') handleSearchPublicPlaylists();
                }}
                className="playlist-search-input"
              />
              <button onClick={handleSearchPublicPlaylists} className="popup-button">
                <FaPlus className="icon-style-popup" />
              </button>
            </div>
            {errorMessage && (
              <div className="playlist-error-message">
                {errorMessage}
              </div>
            )}
            <div className="playlist-search-results">
              <ul>
                {searchResults.length === 0 ? (
                  <li>.</li>
                ) : (
                  searchResults.map((result) => (
                    <li key={result.id}>
                      <div className="playlist-item-title-wrapper">
                        <span>
                          {result.title} (by {safeOwnerId(result.ownerId)})
                        </span>
                      </div>
                      <div className="playlist-item-buttons">
                        {sharedPlaylists.some(p => p.sharedFrom === result.id) ? (
                          <button className="playlist-linked-button" disabled>
                            Linked
                          </button>
                        ) : (
                          <button onClick={() => handleImportPlaylist(result)} className="playlist-import-button">
                            가져오기
                          </button>
                        )}
                      </div>
                    </li>
                  ))
                )}
              </ul>
            </div>
            <button onClick={handleMorePublicPlaylists} className="playlist-more-button">
              공개 플레이리스트 더보기
            </button>
          </div>
        </div>
      )}
      <audio ref={audioRef} />
    </div>
  );
};

export default MusicPlayer;