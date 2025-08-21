import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import '../styles/AdminSubscriptionPlansPage.css';

const AdminSubscriptionPlansPage = () => {
  const { apiClient } = useContext(AuthContext);
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editingPlan, setEditingPlan] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    durationDays: 30,
    description: ''
  });

  // 구독 플랜 목록 조회
  const fetchPlans = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/api/admin/subscription-plans');
      setPlans(response.data);
    } catch (error) {
      console.error('구독 플랜 조회 실패:', error);
      setError('구독 플랜을 불러오는 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  // 폼 데이터 변경 처리
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'price' || name === 'durationDays' ? Number(value) : value
    }));
  };

  // 새 플랜 추가 모달 열기
  const handleAddPlan = () => {
    setEditingPlan(null);
    setFormData({
      name: '',
      price: '',
      durationDays: 30,
      description: ''
    });
    setShowModal(true);
  };

  // 플랜 수정 모달 열기
  const handleEditPlan = (plan) => {
    setEditingPlan(plan);
    setFormData({
      name: plan.name,
      price: plan.price,
      durationDays: plan.durationDays,
      description: plan.description || ''
    });
    setShowModal(true);
  };

  // 플랜 저장 (추가/수정)
  const handleSavePlan = async (e) => {
    e.preventDefault();
    
    try {
      if (editingPlan) {
        // 수정
        await apiClient.put(`/api/admin/subscription-plans/${editingPlan.id}`, formData);
        window.showToast('구독 플랜이 성공적으로 수정되었습니다.', 'success');
      } else {
        // 추가
        await apiClient.post('/api/admin/subscription-plans', formData);
        window.showToast('새 구독 플랜이 성공적으로 추가되었습니다.', 'success');
      }
      
      setShowModal(false);
      fetchPlans();
    } catch (error) {
      console.error('구독 플랜 저장 실패:', error);
      window.showToast('구독 플랜 저장 중 오류가 발생했습니다.', 'error');
    }
  };

  // 플랜 삭제
  const handleDeletePlan = async (planId) => {
    if (!window.confirm('정말로 이 구독 플랜을 삭제하시겠습니까?')) {
      return;
    }

    try {
      await apiClient.delete(`/api/admin/subscription-plans/${planId}`);
      window.showToast('구독 플랜이 성공적으로 삭제되었습니다.', 'success');
      fetchPlans();
    } catch (error) {
      console.error('구독 플랜 삭제 실패:', error);
      window.showToast('구독 플랜 삭제 중 오류가 발생했습니다.', 'error');
    }
  };

  // 모달 닫기
  const handleCloseModal = () => {
    setShowModal(false);
    setEditingPlan(null);
  };

  if (loading) {
    return (
      <div className="admin-subscription-plans">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>구독 플랜을 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-subscription-plans">
        <div className="error-container">
          <div className="error-icon">⚠️</div>
          <h3>오류 발생</h3>
          <p>{error}</p>
          <button className="retry-btn" onClick={fetchPlans}>
            다시 시도
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-subscription-plans">
      <div className="page-header">
        <h1>구독 플랜 관리</h1>
        <button className="add-plan-btn" onClick={handleAddPlan}>
          + 새 플랜 추가
        </button>
      </div>

      <div className="plans-grid">
        {plans.map(plan => (
          <div key={plan.id} className="plan-card">
            <div className="plan-header">
              <h3>{plan.name}</h3>
              <div className="plan-actions">
                <button 
                  className="edit-btn"
                  onClick={() => handleEditPlan(plan)}
                >
                  수정
                </button>
                <button 
                  className="delete-btn"
                  onClick={() => handleDeletePlan(plan.id)}
                >
                  삭제
                </button>
              </div>
            </div>
            <div className="plan-content">
              <div className="plan-price">
                {plan.price?.toLocaleString()}원/월
              </div>
              <div className="plan-duration">
                {plan.durationDays}일 구독
              </div>
              {plan.description && (
                <div className="plan-description">
                  {plan.description}
                </div>
              )}
            </div>
          </div>
        ))}
        
        {plans.length === 0 && (
          <div className="empty-state">
            <div className="empty-icon">📋</div>
            <h3>등록된 구독 플랜이 없습니다</h3>
            <p>새 구독 플랜을 추가해보세요.</p>
          </div>
        )}
      </div>

      {/* 플랜 추가/수정 모달 */}
      {showModal && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingPlan ? '구독 플랜 수정' : '새 구독 플랜 추가'}</h2>
              <button className="close-btn" onClick={handleCloseModal}>×</button>
            </div>
            
            <form onSubmit={handleSavePlan} className="plan-form">
              <div className="form-group">
                <label htmlFor="name">플랜명</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="예: basic, plus, premium"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="price">가격 (원)</label>
                <input
                  type="number"
                  id="price"
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  placeholder="9900"
                  min="0"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="durationDays">구독 기간 (일)</label>
                <input
                  type="number"
                  id="durationDays"
                  name="durationDays"
                  value={formData.durationDays}
                  onChange={handleInputChange}
                  min="1"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="description">설명</label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="플랜에 대한 설명을 입력하세요"
                  rows="3"
                />
              </div>

              <div className="form-actions">
                <button type="button" className="cancel-btn" onClick={handleCloseModal}>
                  취소
                </button>
                <button type="submit" className="save-btn">
                  {editingPlan ? '수정' : '추가'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminSubscriptionPlansPage;
