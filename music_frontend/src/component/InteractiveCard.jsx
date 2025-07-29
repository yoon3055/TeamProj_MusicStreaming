// src/component/InteractiveCard.jsx
import React from 'react';
import { useSpring, animated } from '@react-spring/web';
import { useDrag } from '@use-gesture/react';
import PropTypes from 'prop-types';

import '../styles/InteractiveCard.css'; // ✨ CSS 파일 임포트

const InteractiveCard = ({ children }) => {
  // x, y, scale 애니메이션은 react-spring이 관리합니다.
  const [style, api] = useSpring(() => ({
    x: 0,
    y: 0,
    scale: 1,
    config: { mass: 1, tension: 350, friction: 30 }, // 애니메이션 설정 (부드러움 조절)
  }));

  // useDrag 훅을 사용하여 드래그 동작을 바인딩합니다.
  const bind = useDrag(({ down, movement: [mx, my] }) => {
    api.start({
      x: down ? mx : 0, // 드래그 중이면 마우스 이동 값, 아니면 0
      y: down ? my : 0, // 드래그 중이면 마우스 이동 값, 아니면 0
      scale: down ? 1.05 : 1, // 드래그 중이면 1.05배 확대, 아니면 원래 크기
    });
  }, {
    // 옵션: 축 제한 (필요시)
    // axis: 'x', // 가로로만 드래그 가능
  });

  return (
    <animated.div
      {...bind()} // 드래그 이벤트 바인딩
      style={style} // react-spring 애니메이션 스타일 적용
      className="interactive-card-container" /* ✨ 클래스 적용 */
    >
      {children}
    </animated.div>
  );
};

InteractiveCard.propTypes = {
  children: PropTypes.node.isRequired,
};

export default InteractiveCard;