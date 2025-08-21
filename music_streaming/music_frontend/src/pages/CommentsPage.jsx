// src/pages/CommentManagementPage.jsx
import React, { useState, useEffect } from 'react';
import { 
  FaComment, 
  FaSync, 
  FaRegTrashAlt, 
  FaRegEdit, 
  FaRegSave, 
  FaTimes,
  FaChevronLeft,
  FaChevronRight,
  FaAngleDoubleLeft,
  FaAngleDoubleRight,
  FaSearch,
  FaMusic
} from 'react-icons/fa';
import { Link } from 'react-router-dom';
import '../styles/CommentsPage.css';

// 개발자 모드 여부 환경변수로 읽기


// 더미 데이터 (개발자 모드용)
const dummyComments = [
  {
    id: 1,
    content: "정말 좋은 곡이네요! 매일 듣고 있어요.",
    createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30분 전
    updatedAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    song: {
      id: 'song1',
      title: '봄날',
      artist: 'BTS',
      coverUrl: '/images/spring_day.jpg'
    },
    reported: false,
    likes: 5
  },
  {
    id: 2,
    content: "이 가사 부분이 너무 감동적이에요 ㅠㅠ",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2시간 전
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    song: {
      id: 'song2',
      title: '신호등',
      artist: '이무진',
      coverUrl: '/images/traffic_light.jpg'
    },
    reported: false,
    likes: 12
  },
  {
    id: 3,
    content: "역시 최고의 아티스트! 다음 앨범도 기대됩니다.",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(), // 5시간 전
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
    song: {
      id: 'song3',
      title: 'Celebrity',
      artist: '아이유',
      coverUrl: '/images/celebrity.jpg'
    },
    reported: false,
    likes: 8
  },
  {
    id: 4,
    content: "이 곡 듣고 있으면 기분이 정말 좋아져요",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1일 전
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    song: {
      id: 'song4',
      title: 'Butter',
      artist: 'BTS',
      coverUrl: '/images/butter.jpg'
    },
    reported: true, // 신고된 댓글
    likes: 3
  },
  {
    id: 5,
    content: "라이브 버전도 들어보세요! 정말 대박이에요",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(), // 3일 전
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(),
    song: {
      id: 'song5',
      title: 'Dynamite',
      artist: 'BTS',
      coverUrl: '/images/dynamite.jpg'
    },
    reported: false,
    likes: 15
  }
];

const CommentsPage = () => {
  const [comments, setComments] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 10;
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);

  const [loading, setLoading] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [error, setError] = useState(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [searchInput, setSearchInput] = useState('');

  const [editingId, setEditingId] = useState(null);
  const [editingText, setEditingText] = useState('');

  const getAuthHeader = () => {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  // 댓글 리스트 조회
  const fetchComments = async (page = 1, q = '') => {
    {
      // 개발자 모드 - 더미 데이터 세팅
      setLoading(true);
      setError(null);
      
      setTimeout(() => {
        // 검색 필터링
        const filtered = dummyComments.filter(c =>
          c.content.toLowerCase().includes(q.toLowerCase()) ||
          c.song.title.toLowerCase().includes(q.toLowerCase()) ||
          c.song.artist.toLowerCase().includes(q.toLowerCase())
        );

        // 페이지네이션 시뮬레이션
        const startIndex = (page - 1) * rowsPerPage;
        const endIndex = startIndex + rowsPerPage;
        const paginatedComments = filtered.slice(startIndex, endIndex);

        setComments(paginatedComments);
        setTotalPages(Math.max(1, Math.ceil(filtered.length / rowsPerPage)));
        setTotalElements(filtered.length);
        setLoading(false);
      }, 300);
      return;
    }

    // 실제 API 호출
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      params.append('page', String(page - 1)); // 0-based for backend
      params.append('size', String(rowsPerPage));
      if (q) params.append('q', q);

      const res = await fetch(`/api/user/comments?${params.toString()}`, {
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeader()
        }
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || `댓글 조회 실패 (${res.status})`);
      }

      const data = await res.json();

      const list = data.comments ?? data.content ?? [];
      const tp = data.totalPages ?? Math.max(1, Math.ceil((data.totalElements ?? list.length) / rowsPerPage));
      const te = data.totalElements ?? (data.totalElements === 0 ? 0 : list.length);

      setComments(list);
      setTotalPages(tp);
      setTotalElements(te);
    } catch (err) {
      console.error(err);
      setError(err.message || '댓글을 불러오는 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // 초기 로딩 및 검색 처리
  useEffect(() => {
    const timeout = setTimeout(() => {
      setCurrentPage(1);
      fetchComments(1, searchTerm);
    }, 300);
    return () => clearTimeout(timeout);
  }, [searchTerm]);

  // 페이지 변경 시 로딩
  useEffect(() => {
    fetchComments(currentPage, searchTerm);
  }, [currentPage]);

  // 서버와 동기화
  const syncWithServer = async () => {
    {
      setIsSyncing(true);
      setTimeout(() => {
        fetchComments(currentPage, searchTerm);
        setIsSyncing(false);
        window.showToast?.('댓글이 동기화되었습니다.', 'success');
      }, 1000);
      return;
    }

    try {
      setIsSyncing(true);
      
      // 서버에서 최신 댓글 데이터 가져오기
      await fetchComments(currentPage, searchTerm);
      window.showToast?.('댓글이 동기화되었습니다.', 'success');
      
    } catch (err) {
      setError('서버 동기화 중 오류가 발생했습니다.');
      console.error('Sync failed:', err);
      window.showToast?.('동기화에 실패했습니다.', 'error');
    } finally {
      setIsSyncing(false);
    }
  };

  // 댓글 삭제
  const handleDelete = async (commentId) => {
    {
      if (!window.confirm('댓글을 삭제하시겠습니까? (개발자 모드에서는 실제로 삭제되지 않습니다)')) return;
      window.showToast?.('개발자 모드에서는 실제 댓글 삭제가 불가능합니다.', 'info');
      return;
    }

    if (!window.confirm('댓글을 삭제하시겠습니까?')) return;

    try {
      const res = await fetch(`/api/comments/${commentId}`, {
        method: 'DELETE',
        headers: getAuthHeader()
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || `삭제 실패 (${res.status})`);
      }

      // 현재 페이지에서 마지막 항목이었다면 이전 페이지로 이동
      const isLastItemOnPage = comments.length === 1 && currentPage > 1;
      if (isLastItemOnPage) {
        setCurrentPage((p) => p - 1);
      } else {
        fetchComments(currentPage, searchTerm);
      }
      
      window.showToast?.('댓글이 삭제되었습니다.', 'success');
    } catch (err) {
      console.error(err);
      window.showToast?.(err.message || '댓글 삭제 중 오류가 발생했습니다.', 'error');
    }
  };

  // 편집 시작
  const startEdit = (id, content) => {
    {
      window.showToast?.('개발자 모드에서는 댓글 수정이 불가능합니다.', 'info');
      return;
    }
    setEditingId(id);
    setEditingText(content);
  };

  // 편집 취소
  const cancelEdit = () => {
    setEditingId(null);
    setEditingText('');
  };

  // 편집 저장
  const saveEdit = async (commentId) => {
    if (!editingText.trim()) {
      window.showToast?.('수정할 내용을 입력하세요.', 'warning');
      return;
    }

    {
      window.showToast?.('개발자 모드에서는 댓글 수정이 불가능합니다.', 'info');
      return;
    }

    try {
      const res = await fetch(`/api/comments/${commentId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeader()
        },
        body: JSON.stringify({ content: editingText.trim() })
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || `수정 실패 (${res.status})`);
      }

      setEditingId(null);
      setEditingText('');
      fetchComments(currentPage, searchTerm);
      window.showToast?.('댓글이 수정되었습니다.', 'success');
    } catch (err) {
      console.error(err);
      window.showToast?.(err.message || '댓글 수정 중 오류가 발생했습니다.', 'error');
    }
  };

  // 페이징 계산 (10개씩 그룹)
  const startPage = Math.floor((currentPage - 1) / 10) * 10 + 1;
  const endPage = Math.min(startPage + 9, totalPages);

  const goToPage = (page) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  };

  // 로딩 상태
  if (loading && comments.length === 0) {
    return (
      <div className="page-container">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>댓글을 불러오는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      {/* 헤더 */}
      <div className="page-header">
        <h1 className="page-title">
          <FaComment className="page-title-icon" />
          내 댓글 관리
        </h1>
        <button
          onClick={syncWithServer}
          disabled={isSyncing}
          className="sync-button"
        >
          <FaSync className={`sync-button-icon ${isSyncing ? 'spinning' : ''}`} />
          {isSyncing ? '동기화 중...' : '동기화'}
        </button>
      </div>

      {/* 검색 */}
      <div className="search-container">
        <div className="search-input-wrapper">
          <FaSearch className="search-icon" />
          <input
            type="search"
            className="search-input"
            placeholder="댓글 내용, 곡 제목, 아티스트로 검색..."
            value={searchInput}
            onChange={(e) => {
              setSearchInput(e.target.value);
              clearTimeout(window.__comment_search_timeout);
              window.__comment_search_timeout = setTimeout(() => {
                setSearchTerm(e.target.value.trim());
              }, 300);
            }}
          />
        </div>
      </div>

      {/* 댓글 리스트 */}
      <div className="content-section">
        <div className="table-container">
          {loading && (
            <div className="table-loading-overlay">
              <div className="loading-spinner"></div>
            </div>
          )}

          {error && (
            <div className="error-container">
              <p className="error-message">{error}</p>
              <button className="retry-button" onClick={() => fetchComments(currentPage, searchTerm)}>
                다시 시도
              </button>
            </div>
          )}

          {!loading && !error && comments.length === 0 && (
            <div className="empty-state">
              <FaComment className="empty-icon" />
              <h3 className="empty-title">댓글이 없습니다</h3>
              <p className="empty-description">
                {searchTerm ? '검색 결과가 없습니다.' : '작성한 댓글이 없습니다.'}
              </p>
            </div>
          )}

          {!loading && !error && comments.length > 0 && (
            <div className="table-wrapper">
              <table className="comment-table">
                <thead>
                  <tr>
                    <th>곡 정보</th>
                    <th>댓글 내용</th>
                    <th>작성일</th>
                    <th>좋아요</th>
                    <th>상태</th>
                    <th>액션</th>
                  </tr>
                </thead>
                <tbody>
                  {comments.map((comment) => (
                    <tr key={comment.id} className={comment.reported ? 'reported-comment' : ''}>
                      <td className="song-info-cell">
                        <Link to={`/song/${comment.song.id}`} className="song-link">
                          <img 
                            src={comment.song.coverUrl || '/images/default_cover.png'} 
                            alt={comment.song.title}
                            className="song-cover"
                          />
                          <div className="song-details">
                            <div className="song-title">{comment.song.title}</div>
                            <div className="song-artist">{comment.song.artist}</div>
                          </div>
                        </Link>
                      </td>
                      <td className="comment-content-cell">
                        {editingId === comment.id ? (
                          <textarea
                            className="edit-textarea"
                            value={editingText}
                            onChange={(e) => setEditingText(e.target.value)}
                            rows={3}
                            maxLength={500}
                          />
                        ) : (
                          <div className="comment-text">{comment.content}</div>
                        )}
                      </td>
                      <td className="comment-date-cell">
                        <div className="date-text">
                          {new Date(comment.createdAt).toLocaleDateString()}
                        </div>
                        <div className="time-text">
                          {new Date(comment.createdAt).toLocaleTimeString()}
                        </div>
                        {comment.updatedAt !== comment.createdAt && (
                          <div className="updated-text">
                            (수정됨)
                          </div>
                        )}
                      </td>
                      <td className="likes-cell">
                        <span className="likes-count">{comment.likes || 0}</span>
                      </td>
                      <td className="status-cell">
                        {comment.reported ? (
                          <span className="status-badge reported">신고됨</span>
                        ) : (
                          <span className="status-badge normal">정상</span>
                        )}
                      </td>
                      <td className="action-cell">
                        {editingId === comment.id ? (
                          <div className="edit-actions">
                            <button 
                              className="save-btn" 
                              onClick={() => saveEdit(comment.id)} 
                              title="저장"
                            >
                              <FaRegSave />
                            </button>
                            <button 
                              className="cancel-btn" 
                              onClick={cancelEdit} 
                              title="취소"
                            >
                              <FaTimes />
                            </button>
                          </div>
                        ) : (
                          <div className="comment-actions">
                            <button 
                              className="edit-btn" 
                              onClick={() => startEdit(comment.id, comment.content)} 
                              title="수정"
                            >
                              <FaRegEdit />
                            </button>
                            <button 
                              className="delete-btn" 
                              onClick={() => handleDelete(comment.id)} 
                              title="삭제"
                            >
                              <FaRegTrashAlt />
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* 페이지네이션 */}
        {totalPages > 1 && (
          <div className="pagination-container">
            <button
              onClick={() => goToPage(Math.max(1, startPage - 10))}
              disabled={startPage === 1}
              title="10페이지 이전"
              className="pagination-btn"
            >
              <FaAngleDoubleLeft />
            </button>

            <button
              onClick={() => goToPage(currentPage - 1)}
              disabled={currentPage === 1}
              title="이전 페이지"
              className="pagination-btn"
            >
              <FaChevronLeft />
            </button>

            {Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i).map((p) => (
              <button
                key={p}
                className={`pagination-btn ${p === currentPage ? 'active' : ''}`}
                onClick={() => goToPage(p)}
              >
                {p}
              </button>
            ))}

            <button
              onClick={() => goToPage(currentPage + 1)}
              disabled={currentPage === totalPages}
              title="다음 페이지"
              className="pagination-btn"
            >
              <FaChevronRight />
            </button>

            <button
              onClick={() => goToPage(Math.min(totalPages, startPage + 10))}
              disabled={startPage + 9 >= totalPages}
              title="10페이지 다음"
              className="pagination-btn"
            >
              <FaAngleDoubleRight />
            </button>
          </div>
        )}

        <div className="pagination-info">
          총 댓글 {totalElements}개, 페이지 {currentPage} / {totalPages}
        </div>
      </div>
    </div>
  );
};

export default CommentsPage;