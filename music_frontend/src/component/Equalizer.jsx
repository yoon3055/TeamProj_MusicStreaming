// src/component/Equalizer.jsx
import React, { useRef, useEffect } from 'react';
import PropTypes from 'prop-types';

import '../styles/Equalizer.css'; // ✨ CSS 파일 임포트

const Equalizer = ({ isPlaying = true }) => {
  const barsRef = useRef([]);
  const svgHeight = 60; // SVG의 고정 높이 (픽셀)

  useEffect(() => {
    // 이퀄라이저 로직은 SVG rect 요소를 직접 조작하므로, 캔버스 컨텍스트는 사용되지 않습니다.
    let animationFrameId;

    const drawEqualizer = () => {
      barsRef.current.forEach((bar) => {
        if (bar) {
          // isPlaying이 true일 때 높이를 10에서 50 사이로 랜덤하게 설정, 아니면 10으로 고정
          const height = isPlaying ? Math.random() * 40 + 10 : 10;
          const y = svgHeight - height; // SVG 좌표계에서 Y축은 위에서 아래로 증가

          bar.setAttribute('height', height.toString()); // 높이 적용
          bar.setAttribute('y', y.toString()); // y 좌표 적용
        }
      });
      animationFrameId = requestAnimationFrame(drawEqualizer);
    };

    const initializeBars = () => {
      barsRef.current.forEach((bar) => {
        if (bar) {
          bar.setAttribute('height', '10'); // 초기 높이
          bar.setAttribute('y', (svgHeight - 10).toString()); // 초기 y 좌표 (바닥에 붙도록)
        }
      });
    };

    if (isPlaying) {
      drawEqualizer();
    } else {
      initializeBars();
    }

    return () => cancelAnimationFrame(animationFrameId);
  }, [isPlaying]);

  return (
    <div className="equalizer-container"> {/* ✨ 클래스 적용 */}
      <svg
        width="100"       /* SVG의 고정 너비를 100px로 설정합니다. */
        height="60"       /* SVG의 고정 높이를 60px로 설정합니다. */
        className="equalizer-svg-icon" /* ✨ 클래스 적용 */
        viewBox="0 0 100 60" /* SVG의 뷰포트를 정의하여 내부 요소의 좌표계를 설정합니다. */
        preserveAspectRatio="xMidYMid meet" /* SVG가 컨테이너 내에서 어떻게 비율을 유지할지 설정합니다. */
      >
        {[...Array(5)].map((_, i) => (
          <rect
            key={i}
            ref={(el) => (barsRef.current[i] = el)}
            x={i * 20 + 5} /* 각 바의 x 좌표를 설정합니다. */
            y={(svgHeight - 10).toString()} /* 초기 y 좌표 (바닥에 붙도록) */
            width="10"    /* 바의 너비를 10px로 설정합니다. */
            height="10"   /* 바의 초기 높이를 10px로 설정합니다. */
            fill="currentColor" /* 부모 요소(SVG)의 text-emerald-500 색상을 상속받아 채웁니다. */
            rx="2"        /* 바의 모서리를 둥글게 만듭니다. */
          />
        ))}
      </svg>
    </div>
  );
};

Equalizer.propTypes = {
  isPlaying: PropTypes.bool,
};

export default Equalizer;