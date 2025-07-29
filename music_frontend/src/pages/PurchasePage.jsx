import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import '../styles/PurchasePage.css';

// 더미 앨범 데이터
const DUMMY_ALBUMS_DB = {
  'album_001': { id: 'album_001', title: '별 헤는 밤', artist: '플로아', coverUrl: 'https://via.placeholder.com/200/99e699/000000?text=Album+001', price: 15000, description: '잔잔한 감성의 피아노 앨범' },
  'album_002': { id: 'album_002', title: '도시의 그림자', artist: '멜로디온', coverUrl: 'https://via.placeholder.com/200/66aaff/000000?text=Album+002', price: 18000, description: '힙합 비트와 도시적인 가사' },
  'album_003': { id: 'album_003', title: '새벽의 발자취', artist: '레몬트리', coverUrl: 'https://via.placeholder.com/200/ff99aa/000000?text=Album+003', price: 12000, description: '새로운 록 사운드를 경험하세요' },
};

export const PurchasePage = () => {
  const [album, setAlbum] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvc, setCvc] = useState('');
  const [params] = useSearchParams();
  const albumId = params.get('albumId');
  const navigate = useNavigate();
  const jwt = localStorage.getItem('jwt');

  useEffect(() => {
    console.log(`🌐 현재 albumId: ${albumId}`);
    if (!jwt) {
      setError('로그인이 필요합니다.');
      setLoading(false);
      return;
    }
    if (albumId && DUMMY_ALBUMS_DB[albumId]) {
      setTimeout(() => {
        setAlbum(DUMMY_ALBUMS_DB[albumId]);
        console.log('🌐 앨범 구매 페이지 - 더미 앨범 정보 로드 성공:', DUMMY_ALBUMS_DB[albumId]);
        setLoading(false);
      }, 500);
    } else {
      console.error('🌐 더미 앨범을 찾을 수 없거나 albumId가 없습니다:', albumId);
      setError('앨범을 찾을 수 없습니다. 기본 앨범으로 이동합니다.');
      navigate('/payment/album/album_001');
    }
  }, [albumId, jwt, navigate]);

  const generateDummyPaymentData = () => {
    const paymentKey = `pay_${Math.random().toString(36).substr(2, 9)}`;
    const orderId = `order_album_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    return { paymentKey, orderId };
  };

  const handlePurchase = async (e) => {
    e.preventDefault();
    if (!jwt) {
      setError('로그인이 필요합니다.');
      return;
    }
    if (!album) {
      setError('구매할 앨범 정보가 없습니다.');
      return;
    }
    const isValidCard = cardNumber.match(/^\d{16}$/);
    const isValidExpiry = expiry.match(/^(0[1-9]|1[0-2])\/\d{2}$/);
    const isValidCvc = cvc.match(/^\d{3}$/);
    if (!cardNumber || !expiry || !cvc) {
      setError('모든 결제 정보를 입력해주세요.');
      return;
    }
    if (!isValidCard || !isValidExpiry || !isValidCvc) {
      setError('유효한 결제 정보를 입력해주세요.');
      return;
    }
    try {
      const isSuccess = true; // 100% 성공 (테스트용)
      const { paymentKey, orderId } = generateDummyPaymentData();
      if (isSuccess) {
        console.log(`🌐 더미 앨범 구매 성공: 앨범 ID ${albumId}`);
        const successUrl = `/payment/success?paymentKey=${paymentKey}&orderId=${orderId}&amount=${album.price}&type=album&albumId=${albumId}`;
        console.log(`🌐 Navigating to: ${successUrl}`);
        navigate(successUrl);
      } else {
        throw new Error('앨범 구매 처리 중 오류가 발생했습니다.');
      }
    } catch (err) {
      console.error('🌐 앨범 구매 실패:', err);
      const failUrl = `/payment/fail?error=${encodeURIComponent(err.message)}&type=album&albumId=${albumId}`;
      console.log(`🌐 Navigating to: ${failUrl}`);
      navigate(failUrl);
    }
  };

  const handleCancel = () => {
    navigate('/subscription-plans');
  };

  if (loading) {
    return <div className="purchase-page-loading">앨범 정보를 불러오는 중입니다...</div>;
  }

  if (error || !album) {
    return (
      <div className="purchase-page-error">
        {error || '앨범 정보를 불러올 수 없습니다.'}
        <button onClick={handleCancel} className="retry-button">
          돌아가기
        </button>
      </div>
    );
  }

  return (
    <div className="purchase-page-container">
      <div className="purchase-card">
        <h2 className="purchase-title">앨범 구매</h2>
        <img src={album.coverUrl} alt={album.title} className="purchase-album-cover" />
        <h3 className="purchase-album-title">{album.title}</h3>
        <p className="purchase-album-artist">{album.artist}</p>
        <p className="purchase-album-price">₩ {album.price?.toLocaleString()}</p>
        <p className="purchase-album-description">{album.description}</p>
        <form onSubmit={handlePurchase} className="payment-form">
          <div className="form-group">
            <label htmlFor="cardNumber">카드 번호</label>
            <input
              type="text"
              id="cardNumber"
              value={cardNumber}
              onChange={(e) => setCardNumber(e.target.value)}
              placeholder="1234 5678 9012 3456"
              className="payment-input"
            />
          </div>
          <div className="form-group">
            <label htmlFor="expiry">유효 기간</label>
            <input
              type="text"
              id="expiry"
              value={expiry}
              onChange={(e) => setExpiry(e.target.value)}
              placeholder="MM/YY"
              className="payment-input"
            />
          </div>
          <div className="form-group">
            <label htmlFor="cvc">CVC</label>
            <input
              type="text"
              id="cvc"
              value={cvc}
              onChange={(e) => setCvc(e.target.value)}
              placeholder="123"
              className="payment-input"
            />
          </div>
          {error && <p className="payment-error">{error}</p>}
          <div className="payment-buttons">
            <button type="submit" className="purchase-button">
              구매 진행
            </button>
            <button type="button" onClick={handleCancel} className="user-profile-cancel-button">
              취소
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
