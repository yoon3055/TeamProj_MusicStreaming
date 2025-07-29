import React, { useEffect, useRef, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import '../styles/SubscriptionPage.css';

const dummyPlans = [
  { id: 'plan_basic', name: 'Basic', price: 9900, durationDays: 30 },
  { id: 'plan_premium', name: 'Premium', price: 14900, durationDays: 30 },
  { id: 'plan_pro', name: 'Pro', price: 19900, durationDays: 30 },
];
const dummyAlbums = {
  'album_001': { id: 'album_001', title: '별 헤는 밤', artist: '플로아', price: 15000 },
  'album_002': { id: 'album_002', title: '도시의 그림자', artist: '멜로디온', price: 18000 },
  'album_003': { id: 'album_003', title: '새벽의 발자취', artist: '레몬트리', price: 12000 },
};

const PaymentSuccessPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const hasLogged = useRef(false);
  const [error, setError] = useState(null);
  
  const paymentKey = searchParams.get('paymentKey');
  const orderId = searchParams.get('orderId');
  const amount = searchParams.get('amount');
  const type = searchParams.get('type');
  const planId = searchParams.get('planId');
  const albumId = searchParams.get('albumId');

  useEffect(() => {
    if (!hasLogged.current) {
      if (!paymentKey || !orderId || !amount || !type) {
        setError('필수 결제 정보가 누락되었습니다.');
      } else {
        console.log(`🌐 PaymentSuccessPage: type=${type}, planId=${planId}, albumId=${albumId}, amount=${amount}, paymentKey=${paymentKey}, orderId=${orderId}`);
      }
      hasLogged.current = true;
    }
  }, [type, planId, albumId, amount, paymentKey, orderId]);

  const item = type === 'subscription'
    ? dummyPlans.find((p) => p.id === planId)
    : type === 'album'
    ? dummyAlbums[albumId]
    : null;

  const navigateToPreviousPage = () => {
    if (type === 'subscription') {
      navigate('/subscription-plans', { replace: true });
    } else if (type === 'album') {
      navigate('/myPage', { replace: true });
    }
  };

  return (
    <div className="subscription-page-container">
      <h2>결제 성공</h2>
      {error ? (
        <div>
          <p>{error}</p>
          <button onClick={navigateToPreviousPage} className="retry-button">다시 시도</button>
        </div>
      ) : (
        <>
          <p>결제가 성공적으로 완료되었습니다!</p>
          {item && type === 'subscription' && (
            <>
              <p>구독 요금제: {item.name}</p>
              <p>금액: ₩ {Number(amount).toLocaleString()}</p>
              <p>기간: {item.durationDays}일</p>
              <p>결제 키: {paymentKey}</p>
              <p>주문 ID: {orderId}</p>
              <button onClick={navigateToPreviousPage} className="retry-button">요금제 페이지로 돌아가기</button>
            </>
          )}
          {item && type === 'album' && (
            <>
              <p>앨범: {item.title} - {item.artist}</p>
              <p>금액: ₩ {Number(amount).toLocaleString()}</p>
              <p>결제 키: {paymentKey}</p>
              <p>주문 ID: {orderId}</p>
              <button onClick={navigateToPreviousPage} className="retry-button">마이페이지로 돌아가기</button>
            </>
          )}
          {!item && (
            <>
              <p>결제 항목 정보를 불러올 수 없습니다. (type: {type}, planId: {planId}, albumId: {albumId})</p>
              <button onClick={navigateToPreviousPage} className="retry-button">마이페이지로 돌아가기</button>
            </>
          )}
        </>
      )}
    </div>
  );
};

export default PaymentSuccessPage;
