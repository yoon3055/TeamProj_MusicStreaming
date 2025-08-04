// src/pages/CommentManagement.jsx
import React, { useState, useEffect } from 'react';
import LoadingToast from '../component/LoadingToast';
import '../styles/CommentManagement.css';
//import axios from 'axios';

// 모의 데이터
const mockComments = [
  { id: 'cmt1', user: { nickname: 'UserOne' }, content: '좋은 곡이에요!', resourceId: 'song1', resourceType: 'song', createdAt: '2025-08-01T12:00:00Z' },
  { id: 'cmt2', user: { nickname: 'UserTwo' }, content: '최고의 앨범!', resourceId: 'album1', resourceType: 'album', createdAt: '2025-08-02T14:00:00Z' },
  { id: 'cmt3', user: { nickname: 'UserThree' }, content: '최근에 많이 듣는 곡입니다.', resourceId: 'song2', resourceType: 'song', createdAt: '2025-08-03T09:00:00Z' },
  { id: 'cmt4', user: { nickname: 'UserOne' }, content: '아티스트 좋아요!', resourceId: 'artist1', resourceType: 'artist', createdAt: '2025-08-03T18:30:00Z' },
  { id: 'cmt5', user: { nickname: 'UserTwo' }, content: '가사가 정말 좋아요!', resourceId: 'song3', resourceType: 'song', createdAt: '2025-08-04T10:00:00Z' },
  { id: 'cmt6', user: { nickname: 'UserFour' }, content: '이 앨범 진짜 명반이네요.', resourceId: 'album2', resourceType: 'album', createdAt: '2025-08-04T11:00:00Z' },
  { id: 'cmt7', user: { nickname: 'UserThree' }, content: '추천받아서 들었는데 너무 좋네요.', resourceId: 'song4', resourceType: 'song', createdAt: '2025-08-05T12:00:00Z' },
  { id: 'cmt8', user: { nickname: 'UserFive' }, content: '다음 앨범도 기대됩니다!', resourceId: 'artist2', resourceType: 'artist', createdAt: '2025-08-05T13:00:00Z' },
];

const CommentManagement = () => {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  useEffect(() => {
    // 실제 API 호출 (주석 처리)
    
    const fetchComments = async () => {
      try {
        window.showToast('댓글 데이터를 불러오는 중...', 'info');

        // 모의 데이터 사용
        setTimeout(() => {
          setComments(mockComments);
          setLoading(false);
          window.showToast('댓글 데이터를 성공적으로 불러왔습니다.', 'success');
        }, 1000);
      } catch (err) {
        setError(err , '댓글을 불러오는 중 오류가 발생했습니다.');
        setLoading(false);
        window.showToast('댓글 데이터를 불러오지 못했습니다.', 'error');
      }
    };
    fetchComments();
  }, []);

  // 삭제 기능
  const handleDelete = (commentId) => {
    if (window.confirm('정말 이 댓글을 삭제하시겠습니까?')) {
      // 실제 API 호출 로직 (주석 처리)
      // axios.delete(...)

      setComments(comments.filter(comment => comment.id !== commentId));
      window.showToast('댓글이 삭제되었습니다.', 'success');
    }
  };
  
  // 페이징 처리
  const indexOfLastComment = currentPage * itemsPerPage;
  const indexOfFirstComment = indexOfLastComment - itemsPerPage;
  const currentComments = comments.slice(indexOfFirstComment, indexOfLastComment);
  
  const totalPages = Math.ceil(comments.length / itemsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <div className="comment-management-container">
      <h2 className="comment-management-title">댓글 관리</h2>
      <LoadingToast isLoading={loading} onDismiss={() => setLoading(false)} />
      {error && <p className="comment-management-error">{error}</p>}

      <div className="comment-management-list">
        {currentComments.length === 0 ? (
          <p className="comment-management-empty">표시할 댓글이 없습니다.</p>
        ) : (
          currentComments.map(comment => (
            <div key={comment.id} className="comment-management-item">
              <p className="comment-management-content">
                <strong>{comment.user?.nickname || '알 수 없는 사용자'}</strong>: {comment.content}
              </p>
              <p className="comment-management-info">
                ({comment.resourceType}: {comment.resourceId})
                <span className="comment-management-timestamp">
                  {new Date(comment.createdAt).toLocaleString()}
                </span>
              </p>
              <div className="comment-management-actions">
                <button
                  onClick={() => handleDelete(comment.id)}
                  className="comment-management-btn comment-management-btn-delete"
                >
                  삭제
                </button>
              </div>
            </div>
          ))
        )}
      </div>
      
      <div className="pagination">
        {Array.from({ length: totalPages }, (_, i) => (
          <button
            key={i + 1}
            onClick={() => paginate(i + 1)}
            className={`pagination-btn ${currentPage === i + 1 ? 'active' : ''}`}
          >
            {i + 1}
          </button>
        ))}
      </div>
    </div>
  );
};

export default CommentManagement;