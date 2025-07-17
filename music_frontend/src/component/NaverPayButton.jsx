import React from 'react';

const NaverPayButton = () => {
  return (
    <div>
      {/* 네이버페이 공식 스크립트 */}
      <script src="https://pay.naver.com/customer/js/naverPay.js" async></script>
      {/* 네이버페이 버튼 렌더링용 div */}
      <div
        className="naver-pay-button"
        data-pay-method="NAVERPAY"
        data-product-name="음악 스트리밍 구독"
        data-price="10000"
        data-product-code="ORDER123"
        data-customer-name="홍길동"
        data-return-url={`${window.location.origin}/payment/success`}
        data-cancel-url={`${window.location.origin}/payment/fail`}
        style={{ width: '200px', height: '50px' }}
      />
    </div>
  );
};

export default NaverPayButton;