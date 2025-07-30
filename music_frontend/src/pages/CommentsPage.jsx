// src/pages/CommentsPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios'; // 🌐 백엔드 통신을 위한 axios 임포트

import '../styles/CommentsPage.css'; // ✨ CSS 파일 임포트

const CommentPage = () => {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true); // 🌐 로딩 상태 추가
  const [error, setError] = useState(null); // 🌐 에러 상태 추가

  // 🌐 localStorage에서 토큰 값을 가져옵니다.
  const token = localStorage.getItem('token');

  // 🌐 모든 댓글을 백엔드에서 가져오는 로직
  const fetchComments = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // 🌐 API 호출: /api/comments/all 엔드포인트에서 모든 댓글 데이터를 가져옵니다.
      // 🌐 이 API는 인증이 필요할 수 있습니다.
      const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/comments/all`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setComments(res.data);
      console.log("🌐 모든 댓글 데이터 로드 성공:", res.data);
    } catch (err) {
      console.error('🌐 모든 댓글 가져오기 실패:', err);
      setError('댓글을 불러오는 데 실패했습니다.');
      setComments([]);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  // 🌐 로딩 중일 때 표시되는 UI
  if (loading) {
    return (
      <div className="comments-page-loading">
        댓글을 불러오는 중입니다...
      </div>
    );
  }

  return (
    <div className="comments-page-container">
      <h2 className="comments-page-title">
        모든 댓글
      </h2>

      <div className="comments-list-wrapper">
        {error ? (
          <p className="comments-message comments-error-message">{error}</p>
        ) : comments.length === 0 ? (
          <p className="comments-message comments-empty-message">
            표시할 댓글이 없습니다.
          </p>
        ) : (
          comments.map((comment) => (
            <div
              key={comment.id}
              className="comment-item"
            >
              <p className="comment-content">
                <strong className="comment-user-nickname">{comment.user ? comment.user.nickname : '알 수 없는 사용자'}</strong>: {comment.content}
              </p>
              <p className="comment-resource-info">
                ({comment.resourceType}: {comment.resourceId})
                {comment.createdAt && ( // 🌐 댓글 작성 시간 (선택 사항)
                  <span className="comment-timestamp">
                    {new Date(comment.createdAt).toLocaleString()}
                  </span>
                )}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default CommentPage;