// src/pages/AdminDashboard.jsx
import React, { useState, useEffect } from 'react';
import { Link, Outlet } from 'react-router-dom';
import LoadingToast from '../component/LoadingToast';
import '../styles/AdminDashboard.css';
import axios from 'axios';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeSubscriptions: 0,
    totalSongs: 0,
    totalComments: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 모의 데이터 로드
  useEffect(() => {
    const fetchStats = async () => {
      try {
        window.showToast('대시보드 데이터를 불러오는 중...', 'info');
        
        try {
          const res = await axios.get(`${import.meta.env.VITE_REACT_APP_API_URL}/api/admin/stats`, {
            headers: { Authorization: `Bearer ${localStorage.getItem('jwt')}` },
          });
          setStats(res.data);
          window.showToast('대시보드 데이터를 성공적으로 불러왔습니다.', 'success');
        } catch (apiError) {
          console.warn('API 호출 실패, 모의 데이터 사용:', apiError.message);
          window.showToast('API 연결 실패로 모의 데이터를 사용합니다.', 'warning');
          
          setTimeout(() => {
            setStats({
              totalUsers: 150,
              activeSubscriptions: 75,
              totalSongs: 345,
              totalComments: 520,
            });
            setLoading(false);
          }, 1000);
        }
      } catch (err) {
        setError(err , '데이터를 불러오는 중 오류가 발생했습니다.');
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const handleMenuClick = (menuName) => {
    console.log(`${menuName} 메뉴를 클릭했습니다.`);
  };

  return (
    <div className="admin-container">
      <LoadingToast isLoading={loading} onDismiss={() => setLoading(false)} />
      
      {/* 오류 메시지를 표시하는 JSX 추가 */}
      {error && <p className="admin-error">{error}</p>} 

      <div className="admin-sidebar">
        <h1 className="admin-title">관리자 대시보드</h1>
        <div className="admin-menu">
          <Link
            to="/admin/users"
            className="admin-menu-card"
            onClick={() => handleMenuClick('사용자 관리')}
          >
            <h3>사용자 관리</h3>
            <p>사용자 목록 조회, 수정, 삭제</p>
            <small>총 {stats.totalUsers}명의 사용자</small>
          </Link>
          
          <Link
            to="/admin/contents"
            className="admin-menu-card"
            onClick={() => handleMenuClick('콘텐츠 관리')}
          >
            <h3>콘텐츠 관리</h3>
            <p>음악, 앨범, 아티스트 관리</p>
            <small>총 {stats.totalSongs}곡 등록됨</small>
          </Link>
          
          <Link
            to="/admin/comments"
            className="admin-menu-card"
            onClick={() => handleMenuClick('댓글 관리')}
          >
            <h3>댓글 관리</h3>
            <p>모든 댓글 조회 및 삭제</p>
            <small>총 {stats.totalComments}개의 댓글</small>
          </Link>
          
          <Link
            to="/admin/subscriptions"
            className="admin-menu-card"
            onClick={() => handleMenuClick('구독 관리')}
          >
            <h3>구독 관리</h3>
            <p>구독 플랜 및 사용자 구독 상태 관리</p>
            <small>{stats.activeSubscriptions}명이 구독 중</small>
          </Link>
        </div>
      </div>
      
      <div className="admin-content">
        <Outlet />
      </div>
    </div>
  );
};

export default AdminDashboard;