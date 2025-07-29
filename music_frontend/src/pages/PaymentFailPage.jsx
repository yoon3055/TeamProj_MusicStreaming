import React from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import '../styles/SubscriptionPage.css';

// 더미 데이터
const dummyPlans = [
  { id: 'plan_basic', name: 'Basic', price: 9900 },
  { id: 'plan_premium', name: 'Premium', price: 14900 },
  { id: 'plan_pro', name: 'Pro', price: 19900 },
];
const dummyAlbums = {
  'album_001': { id: 'album_001', title: '별 헤는 밤', artist: '플로아', price: 15000 },
  'album_002': { id: 'album_002', title: '도시의 그림자', artist: '멜로디온', price: 18000 },
  'album_003': { id: 'album_003', title: '새벽의 발자취', artist: '레몬트리', price: 12000 },
};

const PaymentFailPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const error = searchParams.get('error');
  const type = searchParams.get('type');
  const planId = searchParams.get('planId');
  const albumId = searchParams.get('albumId');

  console.log(`🌐 PaymentFailPage: type=${type}, planId=${planId}, albumId=${albumId}`);

  // 결제 항목이 유효한지 체크
  const item = type === 'subscription'
    ? dummyPlans.find((p) => p.id === planId)
    : type === 'album'
    ? dummyAlbums[albumId]
    : null;

  // 오류 메시지 설정
  const errorMessage = decodeURIComponent(error) || '결제 처리 중 오류가 발생했습니다.';

  const handleNavigate = () => {
    if (type === 'subscription') {
      navigate('/subscription-plans', { replace: true });
    } else if (type === 'album') {
      navigate('/mypage', { replace: true });
    } else {
      navigate('/mypage', { replace: true }); // 기본 fallback 페이지
    }
  };

  return (
    <div className="subscription-page-container subscription-page-error">
      <h2>결제 실패</h2>
      <p>{errorMessage}</p>
      {item && type === 'subscription' && (
        <>
          <p>구독 요금제: {item.name}</p>
          <button onClick={handleNavigate} className="retry-button">
            요금제 페이지로 돌아가기
          </button>
        </>
      )}
      {item && type === 'album' && (
        <>
          <p>앨범: {item.title} - {item.artist}</p>
          <button onClick={handleNavigate} className="retry-button">
            마이페이지로 돌아가기
          </button>
        </>
      )}
      {!item && (
        <>
          <p>결제 항목 정보를 불러올 수 없습니다.</p>
          <button onClick={handleNavigate} className="retry-button">
            마이페이지로 돌아가기
          </button>
        </>
      )}
    </div>
  );
};

export default PaymentFailPage;
