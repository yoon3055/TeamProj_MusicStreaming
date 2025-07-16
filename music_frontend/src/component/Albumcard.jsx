import React from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';

const Albumcard = ({ album, size = 'md' }) => {
  // `size` prop에 따라 카드의 크기를 동적으로 설정합니다.
  const cardSizeClasses = {
    sm: 'w-36', // 144px (작은 카드)
    md: 'w-40', // 160px (기본 카드 크기)
    lg: 'w-56', // 224px (앨범 디테일 페이지 상단 등 큰 카드)
  };
  const imageHeightClasses = {
    sm: 'h-36',
    md: 'h-40',
    lg: 'h-56',
  };

  const currentCardSize = cardSizeClasses[size] || cardSizeClasses.md;
  const currentImageHeight = imageHeightClasses[size] || imageHeightClasses.md;
  const currentTextSize = size === 'lg' ? 'text-lg' : 'text-base';
  const currentArtistTextSize = size === 'lg' ? 'text-base' : 'text-sm';

  return (
    <div
      className={`
        flex-shrink-0       /* flex 컨테이너 안에서 카드 크기가 줄어들지 않도록 합니다. */
        ${currentCardSize}  /* 카드의 동적 너비 설정 */
        rounded-lg          /* 모서리를 둥글게 만듭니다. */
        overflow-hidden     /* 둥근 모서리 밖으로 내용이 넘치지 않도록 합니다. */
        bg-gray-800         /* 카드 배경색을 어두운 회색으로 설정합니다. */
        shadow-md           /* 카드에 은은한 그림자 효과를 추가하여 입체감을 줍니다. */
        cursor-pointer      /* 마우스 커서를 포인터로 변경하여 클릭 가능함을 나타냅니다. */
        hover:scale-105     /* 마우스 오버 시 카드를 105% 확대하여 인터랙션 효과를 줍니다. */
        transition-transform /* transform 속성 변경 시 부드러운 전환 효과를 적용합니다. */
        duration-200        /* 전환 효과 지속 시간을 200ms로 설정합니다. */
      `}
    >
      <Link to={`/album/${album.id}`} className="block"> {/* 전체 카드가 클릭 가능하도록 링크를 블록 요소로 만듭니다. */}
        <img
          src={album.coverUrl || 'https://via.placeholder.com/160/333333/FFFFFF?text=Album'}
          alt={album.title}
          className={`
            w-full          /* 이미지가 카드 너비에 꽉 차도록 합니다. */
            ${currentImageHeight} /* 이미지의 동적 높이 설정 */
            object-cover    /* 이미지의 비율을 유지하면서 영역을 채우도록 자릅니다. */
          `}
        />
        <div className="p-3"> {/* 텍스트 내용에 12px의 내부 여백을 추가합니다. */}
          <h4
            className={`
              ${currentTextSize} /* 동적 텍스트 크기 설정 */
              font-semibold   /* 글꼴을 세미볼드로 설정합니다. */
              text-white      /* 텍스트 색상을 흰색으로 설정합니다. */
              truncate        /* 텍스트가 너무 길면 말줄임표(...)로 표시합니다. */
              mb-1            /* 제목 아래에 4px의 마진을 추가합니다. */
            `}
          >
            {album.title}
          </h4>
          <p
            className={`
              ${currentArtistTextSize} /* 동적 아티스트 텍스트 크기 설정 */
              text-gray-400   /* 텍스트 색상을 연한 회색으로 설정합니다. */
              truncate        /* 텍스트가 너무 길면 말줄임표(...)로 표시합니다. */
            `}
          >
            {album.artist}
          </p>
        </div>
      </Link>
    </div>
  );
};

Albumcard.propTypes = {
  album: PropTypes.shape({
    id: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    artist: PropTypes.string.isRequired,
    coverUrl: PropTypes.string.isRequired,
  }).isRequired,
  size: PropTypes.oneOf(['sm', 'md', 'lg']), // 카드 크기 옵션
};

export default Albumcard;