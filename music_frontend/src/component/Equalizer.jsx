import React, { useRef, useEffect } from 'react';
import PropTypes from 'prop-types';

import '../styles/Equalizer.css';

const Equalizer = ({ mode = 'linked', isPlaying = true }) => {
  const barsRef = useRef([]);
  // 모드별 기본 크기 설정 (CSS에서 반응형으로 조정)
  const sizes = {
    dynamic: { width: 150, height: 80, barWidth: 15 },
    linked: { width: 100, height: 60, barWidth: 10 },
    static: { width: 80, height: 40, barWidth: 8 },
  };
  const { width, height, barWidth } = sizes[mode] || sizes.linked;

  useEffect(() => {
    let animationFrameId;
    let startTime = null;

    const drawDynamicWave = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const elapsed = (timestamp - startTime) / 1000; // 초 단위
      const period = 5; // 5초 주기
      const phase = (elapsed % period) / period; // 0~1

      barsRef.current.forEach((bar, i) => {
        if (bar) {
          const maxHeight = height * 0.9; // 진폭 증가 (80% → 90%)
          const minHeight = height * 0.1; // 최소 높이 낮춤
          // 사인파 웨이브: 속도 증가 및 역동성 강화
          const wave = Math.sin(2 * Math.PI * (phase * 2 - i / 5)); // phase * 2로 속도 2배
          const normalized = (wave + 1) / 2; // -1~1 → 0~1
          const dynamicHeight = isPlaying ? minHeight + normalized * (maxHeight - minHeight) : minHeight;
          const y = height - dynamicHeight;
          bar.setAttribute('height', dynamicHeight.toString());
          bar.setAttribute('y', y.toString());
        }
      });
      animationFrameId = requestAnimationFrame(drawDynamicWave);
    };

    const initializeBars = () => {
      barsRef.current.forEach((bar) => {
        if (bar) {
          const minHeight = height * 0.2;
          bar.setAttribute('height', minHeight.toString());
          bar.setAttribute('y', (height - minHeight).toString());
        }
      });
    };

    const drawLinkedEqualizer = () => {
      barsRef.current.forEach((bar) => {
        if (bar) {
          const maxHeight = height * 0.8;
          const minHeight = height * 0.2;
          const dynamicHeight = isPlaying ? Math.random() * (maxHeight - minHeight) + minHeight : minHeight;
          const y = height - dynamicHeight;
          bar.setAttribute('height', dynamicHeight.toString());
          bar.setAttribute('y', y.toString());
        }
      });
      animationFrameId = requestAnimationFrame(drawLinkedEqualizer);
    };

    if (mode === 'dynamic' && isPlaying) {
      drawDynamicWave(performance.now());
    } else if (mode === 'linked' && isPlaying) {
      drawLinkedEqualizer();
    } else {
      initializeBars();
    }

    return () => cancelAnimationFrame(animationFrameId);
  }, [mode, isPlaying, height]);

  return (
    <div className={`equalizer-container equalizer-${mode}`}>
      <svg
        width="100%" // CSS에서 너비 조정
        height={height}
        className="equalizer-svg-icon"
        viewBox={`0 0 ${width} ${height}`}
        preserveAspectRatio="xMidYMid meet"
      >
        {[...Array(5)].map((_, i) => (
          <rect
            key={i}
            ref={(el) => (barsRef.current[i] = el)}
            x={i * (barWidth * 2) + 5}
            y={(height - height * 0.2).toString()}
            width={barWidth}
            height={(height * 0.2).toString()}
            fill="currentColor"
            rx="2"
          />
        ))}
      </svg>
    </div>
  );
};

Equalizer.propTypes = {
  mode: PropTypes.oneOf(['dynamic', 'linked', 'static']),
  isPlaying: PropTypes.bool,
};

export default Equalizer;