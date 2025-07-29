import React from 'react';
import { Link } from 'react-router-dom';

const RankingChart = ({ data }) => {
  return (
    <table className="ranking-chart-table">
      <thead>
        <tr>
          <th>순위</th>
          <th>곡/앨범</th>
          <th>아티스트</th>
          <th>듣기</th>
          <th>재생목록</th>
          <th>내 리스트</th>
          <th>더보기</th>
        </tr>
      </thead>
      <tbody>
        {data.map((item, idx) => (
          <tr key={item.id}>
            <td>{idx + 1}</td>
            <td>
              <Link to={`/album/${item.albumId}`} className="album-link">
                <img src={item.coverUrl} alt={item.title} className="album-cover" />
                <span className="album-title">{item.title}</span>
              </Link>
            </td>
            <td>{item.artist}</td>
            <td>
              <button className="play-button" aria-label="재생">
                ▶
              </button>
            </td>
            <td>
              <button className="playlist-button" aria-label="재생목록 추가">+</button>
            </td>
            <td>
              <button className="favorite-button" aria-label="내 리스트 추가">★</button>
            </td>
            <td>
              <button className="more-button" aria-label="더보기">⋯</button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default RankingChart;