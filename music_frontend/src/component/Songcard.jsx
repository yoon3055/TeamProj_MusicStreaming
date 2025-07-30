// src/component/Songcard.jsx
import React, { useContext } from 'react';
import PropTypes from 'prop-types';
import { MusicPlayerContext } from '../context/MusicPlayerContext';

import '../styles/SongCard.css'; // 

const SongCard = ({ song, songList }) => {
  // 🌐 MusicPlayerContext에서 playSong 함수를 가져옵니다.
  // 이 함수는 백엔드 연동을 통해 실제 음악 재생을 처리할 것입니다.
  const { playSong } = useContext(MusicPlayerContext);

  // ⚠️ songList를 클릭 시 재생 목록으로 추가하고 재생하는 것으로 가정합니다.
  // 단일 곡 재생이라면 playSong(song)으로 변경될 수 있습니다.
  const handleCardClick = () => {
    // 🌐 playSong 함수는 MusicPlayerContext에서 제공되며,
    // songList를 받아 재생 목록에 추가하고 첫 곡을 재생하는 로직을 포함할 수 있습니다.
    // 백엔드 통신을 통해 곡 정보를 가져오거나 재생 기록을 남길 수 있습니다.
    playSong(songList);
    console.log(`🌐 ${song.title} 이(가) 포함된 목록을 재생합니다.`);
  };

  return (
    <div className="song-card-container" onClick={handleCardClick}> {/* ✨ 클래스 적용 */}
      {/* 곡 제목 */}
      <h4 className="song-card-title">{song.title}</h4> {/* ✨ 클래스 적용 */}
      {/* 아티스트 이름 */}
      <p className="song-card-artist">{song.artist}</p> {/* ✨ 클래스 적용 */}

      {/* ⚠️ 이 버튼은 카드를 클릭하는 것과 동일한 역할을 하므로,
             별도의 기능이 없다면 제거하거나 아이콘으로 대체하는 것을 고려할 수 있습니다.
             현재는 재생 시작을 시각적으로 강조하는 역할로 둡니다. */}
      <button
        className="song-card-play-button" /* ✨ 클래스 적용 */
        // 🌐 버튼 클릭 시에도 동일하게 playSong(songList) 호출
        // e.stopPropagation()을 사용하여 카드 클릭 이벤트의 중복 발생을 방지합니다.
        onClick={(e) => {
          e.stopPropagation();
          handleCardClick();
        }}
      >
        <svg className="song-card-play-icon" fill="currentColor" viewBox="0 0 20 20"> {/* ✨ 클래스 적용 */}
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd"></path>
        </svg>
        <span>재생</span>
      </button>
    </div>
  );
};

SongCard.propTypes = {
  song: PropTypes.shape({
    title: PropTypes.string.isRequired,
    artist: PropTypes.string.isRequired,
    url: PropTypes.string, // URL은 필수가 아닐 수 있습니다 (재생 목록에 포함될 때만 필요).
  }).isRequired,
  songList: PropTypes.array.isRequired, // 전체 곡 리스트 전달
};

export default SongCard;