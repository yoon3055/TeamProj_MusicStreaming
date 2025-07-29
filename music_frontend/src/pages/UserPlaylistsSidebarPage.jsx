// src/components/UserPlaylistsSidebar.jsx
import React from 'react'; // ✨ useState, useEffect, useCallback 제거
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';

import SidebarMiniCard from '../component/SidebarMiniCard'; // SidebarMiniCard 컴포넌트 사용

// 더미 이미지 경로 (SidebarContent와 중복되지 않도록 별도 정의 또는 외부에서 받아야 함)
import K52 from '../assets/K-052.jpg';
import K53 from '../assets/K-053.jpg';

// 더미 데이터
let imageIndexUserPlaylists = 0;
const getNextLocalImageUserPlaylists = () => {
  const paths = [K52, K53]; // 사용자 정의 더미 이미지가 필요합니다
  const path = paths[imageIndexUserPlaylists % paths.length];
  imageIndexUserPlaylists++;
  return path;
};

const mockHistoryItems = Array.from({ length: 4 }, (_, i) => ({
  id: `history_${i + 1}`,
  title: `재생곡 ${i + 1}`,
  artist: `재생 아티스트 ${i + 1}`,
  coverUrl: getNextLocalImageUserPlaylists(),
  link: `/song/${i + 1}`,
  type: 'song',
}));

const mockUserPlaylistsAndLikes = Array.from({ length: 4 }, (_, i) => ({
  id: `mypl_${i + 1}`,
  title: `내 플리 ${i + 1}`,
  artist: `내 취향`, // 플레이리스트는 아티스트 대신 다른 정보 가능
  coverUrl: getNextLocalImageUserPlaylists(),
  link: `/playlist/${i + 1}`,
  type: 'playlist',
}));


import '../styles/UserPlaylistsSidebar.css'; // ✨ 전용 CSS

const UserPlaylistsSidebarPage = ({ onPlay }) => { // onPlay는 SidebarContent로부터 전달받음
  // 실제 앱에서는 이곳에서 사용자 재생 기록, 플레이리스트, 좋아요 정보를 API를 통해 가져옵니다.
  // const [history, setHistory] = useState([]); // 주석 처리된 부분으로 ESLint 경고
  // const [userPlaylists, setUserPlaylists] = useState([]); // 주석 처리된 부분으로 ESLint 경고
  // const [loading, setLoading] = useState(true); // 주석 처리된 부분으로 ESLint 경고

  // useEffect(() => {
  //   // API 호출 로직
  //   // fetchUserHistory().then(data => setHistory(data));
  //   // fetchUserPlaylists().then(data => setUserPlaylists(data));
  //   // setLoading(false);
  // }, []);


  return (
    <div className="user-playlists-sidebar-container">
      {/* 1. 재생 기록 섹션 */}
      <div className="user-playlists-section history-section">
        <h4 className="user-playlists-section-title">재생 기록</h4>
        <div className="user-playlists-grid">
          {mockHistoryItems.map(item => (
            <SidebarMiniCard key={item.id} item={item} type={item.type} onPlay={onPlay} />
          ))}
        </div>
        <Link to="/history" className="user-playlists-more-link">더보기</Link>
      </div>

      {/* 2. 나의 플레이리스트/좋아요 섹션 */}
      <div className="user-playlists-section my-lists-section">
        <h4 className="user-playlists-section-title">나의 플레이리스트</h4>
        <div className="user-playlists-grid">
          {mockUserPlaylistsAndLikes.map(item => (
            <SidebarMiniCard key={item.id} item={item} type={item.type} onPlay={onPlay} />
          ))}
        </div>
        <Link to="/my-playlists" className="user-playlists-more-link">더보기</Link>
      </div>
    </div>
  );
};

UserPlaylistsSidebarPage.propTypes = {
  onPlay: PropTypes.func.isRequired, // 노래 재생 함수 (MusicPlayerContext의 playSong)
};

export default UserPlaylistsSidebarPage;