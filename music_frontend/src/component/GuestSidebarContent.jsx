// src/component/GuestSidebarContent.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import Albumcard from './Albumcard'; // Albumcard 컴포넌트 임포트
import K52 from '../assets/K-052.jpg';
import K53 from '../assets/K-053.jpg';
import K54 from '../assets/K-054.jpg';
import K55 from '../assets/K-055.jpg';

import '../styles/GuestSideBarcontent.css'; // ✨ CSS 파일 임포트

// 🌐 데모용 앨범 데이터 (실제로는 백엔드에서 가져와야 함)
const mockAlbums = [
  { id: 'album1', title: 'Chill Vibes', artist: 'Various', coverUrl: K52 },
  { id: 'album2', title: 'Focus Music', artist: 'Ambient Artists', coverUrl: K53 },
  { id: 'album3', title: 'Workout Hits', artist: 'Energetic Beats', coverUrl: K54 },
  { id: 'album4', title: 'Relaxing Jazz', artist: 'Jazz Masters', coverUrl: K55 },
];

// 🌐 데모용 광고 데이터 (실제로는 백엔드에서 가져오거나 관리)
const mockAds = [
  { id: 1, text: '프리미엄 구독 혜택! 지금 바로 경험하세요', url: '/subscription' },
  { id: 2, text: '최신 앨범 30% 할인! 놓치지 마세요', url: '/new-releases' },
  { id: 3, text: 'FLO 앱 다운로드! 언제 어디서든 음악을', url: '/download' },
];

export default function GuestSidebarContent() {
  return (
    <div className="guest-sidebar-container"> {/* ✨ 클래스 적용 */}
      {/* 앨범 아트 섹션 */}
      <h3 className="guest-sidebar-title">추천 앨범</h3> {/* ✨ 클래스 적용 */}
      <div className="guest-sidebar-albums"> {/* ✨ 클래스 적용 */}
        {mockAlbums.map(album => (
          // Albumcard를 small size로 사용하여 공간을 효율적으로 활용
          <Albumcard key={album.id} album={album} size="sm" />
        ))}
      </div>

      {/* 광고 섹션 */}
      <h3 className="guest-sidebar-title">광고</h3> {/* ✨ 클래스 적용 */}
      <div className="guest-sidebar-ads"> {/* ✨ 클래스 적용 */}
        {mockAds.map(ad => (
          <Link
            key={ad.id}
            to={ad.url}
            className="guest-sidebar-ad-item" /* ✨ 클래스 적용 */
          >
            {ad.text}
          </Link>
        ))}
      </div>
    </div>
  );
}