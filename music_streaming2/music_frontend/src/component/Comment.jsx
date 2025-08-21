import React, { useState, useEffect, useContext, useCallback } from 'react';
import axios from 'axios'; // 🌐 백엔드 통신을 위한 axios 임포트
import { AuthContext } from '../context/AuthContext'; // 🌐 사용자 인증 정보
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom'; // 로그인 링크용

const Comment = ({ resourceId, resourceType, hasPurchasedResource = false }) => {
  const { user } = useContext(AuthContext); // 🌐 로그인한 사용자 정보
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');

  // 댓글 수정 관련 상태
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editedContent, setEditedContent] = useState('');

  // 🌐 댓글 목록을 가져오는 함수
  const fetchComments = useCallback(async () => {
    try {
      const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/comments`, {
        params: { resourceId, resourceType },
      });
      setComments(res.data);
    } catch (err) {
      console.error('🌐 댓글 가져오기 실패:', err);
    }
  }, [resourceId, resourceType]); // ✅ fetchComments의 의존성: resourceId, resourceType

  // ✅ useEffect의 의존성 배열에 fetchComments를 추가합니다.
  useEffect(() => {
    fetchComments();
  }, [fetchComments]); // ✅ fetchComments를 의존성 배열에 포함

  // 🌐 새 댓글 작성 처리
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      alert('로그인 후 리뷰를 작성할 수 있습니다.');
      return;
    }
    // ✅ 앨범 구매 여부 확인
    if (!hasPurchasedResource) {
      alert('앨범 구매 후 리뷰를 작성할 수 있습니다.');
      return;
    }
    if (newComment.trim() === '') {
      alert('리뷰 내용을 입력해주세요.');
      return;
    }
    try {
      await axios.post(
        `${process.env.REACT_APP_API_URL}/api/comments`,
        {
          resourceId,
          resourceType,
          content: newComment,
        },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        }
      );
      setNewComment('');
      fetchComments(); // ✅ fetchComments 호출
    } catch (err) {
      alert('🌐 리뷰 작성 실패: ' + (err.response?.data?.message || err.message));
      console.error('🌐 리뷰 작성 오류:', err);
    }
  };

  // 🌐 댓글 수정 시작
  const handleEditClick = (comment) => {
    setEditingCommentId(comment.id);
    setEditedContent(comment.content);
  };

  // 🌐 댓글 수정 취소
  const handleCancelEdit = () => {
    setEditingCommentId(null);
    setEditedContent('');
  };

  // 🌐 댓글 수정 완료
  const handleSaveEdit = async (commentId) => {
    if (editedContent.trim() === '') {
      alert('수정할 내용을 입력해주세요.');
      return;
    }
    try {
      await axios.put(
        `${process.env.REACT_APP_API_URL}/api/comments/${commentId}`,
        { content: editedContent },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        }
      );
      setEditingCommentId(null);
      setEditedContent('');
      fetchComments(); // ✅ fetchComments 호출
    } catch (err) {
      alert('🌐 리뷰 수정 실패: ' + (err.response?.data?.message || err.message));
      console.error('🌐 리뷰 수정 오류:', err);
    }
  };

  // 🌐 댓글 삭제
  const handleDelete = async (commentId) => {
    if (!window.confirm('정말로 이 리뷰를 삭제하시겠습니까?')) {
      return;
    }
    try {
      await axios.delete(
        `${process.env.REACT_APP_API_URL}/api/comments/${commentId}`,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        }
      );
      fetchComments(); // ✅ fetchComments 호출
    } catch (err) {
      alert('🌐 리뷰 삭제 실패: ' + (err.response?.data?.message || err.message));
      console.error('🌐 리뷰 삭제 오류:', err);
    }
  };

  const showCommentForm = user && hasPurchasedResource;

  return (
    <div
      className="
        bg-gray-800 p-6 rounded-lg shadow-lg my-8 max-w-4xl mx-auto
      "
    >
      <h4 className="text-white text-xl font-semibold mb-4">리뷰</h4>
      {comments.length === 0 ? (
        <p className="text-gray-400 text-center py-4">아직 리뷰가 없습니다. 첫 리뷰를 남겨주세요!</p>
      ) : (
        comments.map((comment) => (
          <div
            key={comment.id}
            className="
              bg-gray-700 p-4 rounded-md mb-3 border border-gray-600
            "
          >
            {editingCommentId === comment.id ? (
              <div>
                <textarea
                  value={editedContent}
                  onChange={(e) => setEditedContent(e.target.value)}
                  className="
                    w-full p-2 rounded-md bg-gray-600 text-white border border-gray-500
                    focus:outline-none focus:ring-2 focus:ring-blue-500 mb-2
                  "
                  rows="2"
                />
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleSaveEdit(comment.id)}
                    className="
                      bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-md text-xs
                      transition-colors duration-200
                    "
                  >
                    저장
                  </button>
                  <button
                    onClick={handleCancelEdit}
                    className="
                      bg-gray-600 hover:bg-gray-700 text-white px-3 py-1 rounded-md text-xs
                      transition-colors duration-200
                    "
                  >
                    취소
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <p className="text-gray-200 text-sm">
                  <strong className="text-blue-400 font-bold">
                    {comment.user ? comment.user.nickname : '알 수 없는 사용자'}
                  </strong>
                  : {comment.content}
                </p>
                {user && comment.user && user.id === comment.user.id && (
                  <div className="flex space-x-2 mt-2">
                    <button
                      onClick={() => handleEditClick(comment)}
                      className="
                        bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-md text-xs
                        transition-colors duration-200
                      "
                    >
                      수정
                    </button>
                    <button
                      onClick={() => handleDelete(comment.id)}
                      className="
                        bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-md text-xs
                        transition-colors duration-200
                      "
                    >
                      삭제
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        ))
      )}

      {showCommentForm ? (
        <form onSubmit={handleSubmit} className="mt-6">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="리뷰를 작성하세요."
            className="
              w-full p-3 rounded-md bg-gray-700 text-white border border-gray-600
              focus:outline-none focus:ring-2 focus:ring-blue-500 mb-3
            "
            rows="3"
          />
          <button
            type="submit"
            className="
              bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2 rounded-md
              font-semibold transition-colors duration-200 float-right
            "
          >
            리뷰 작성
          </button>
          <div className="clear-both"></div>
        </form>
      ) : (
        <p className="text-gray-400 text-center mt-4">
          {!user ? (
            <span>리뷰를 작성하려면 <Link to="/login" className="text-blue-400 hover:underline">로그인</Link>해주세요.</span>
          ) : (
            <span>이 앨범에 대한 리뷰는 앨범 구매 후 작성할 수 있습니다.</span>
          )}
        </p>
      )}
    </div>
  );
};

Comment.propTypes = {
  resourceId: PropTypes.string.isRequired,
  resourceType: PropTypes.string.isRequired,
  hasPurchasedResource: PropTypes.bool,
};

export default Comment;