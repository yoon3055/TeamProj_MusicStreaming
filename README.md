# 🎵 Music Platform Project

음악 스트리밍 및 플레이리스트 관리 플랫폼입니다. Spring Boot 백엔드와 React 프론트엔드로 구성된 풀스택 웹 애플리케이션입니다.

## 👥 팀원

- **김윤범** - 팀장, 프로젝트 총괄, SpringBoot 기반 서버 구축, 코드 통합 관리
- **이정민** - 팀원, 스트리밍 플레이어 설계 및 개발, 통계/조회 기능
- **김지훈** - 팀원, MySQL 기반 ERD 테이블 설계, DB 설계 및 관리

## 📋 프로젝트 개요

이 프로젝트는 사용자들이 음악을 검색하고, 플레이리스트를 생성/관리하며, 다른 사용자들과 음악을 공유할 수 있는 종합적인 음악 플랫폼입니다.

### 주요 기능

- 🎵 **음악 검색 및 재생**: 다양한 음악 검색 및 스트리밍
- 📝 **플레이리스트 관리**: 개인 플레이리스트 생성, 편집, 삭제
- 👥 **소셜 기능**: 좋아요, 댓글, 공유 기능
- 🔐 **사용자 인증**: JWT 기반 로그인/회원가입
- 📊 **추천 시스템**: 개인화된 음악 추천
- 📱 **반응형 UI**: 모바일 및 데스크톱 지원

## 🏗️ 프로젝트 구조

```
250728_02_test/
├── music/                 # Spring Boot 백엔드
│   ├── src/main/java/com/music/
│   │   ├── common/        # 공통 설정 (Security, JWT, Swagger)
│   │   ├── music/         # 음악 관련 엔티티 및 서비스
│   │   ├── playlist/      # 플레이리스트 관리
│   │   ├── user/          # 사용자 관리
│   │   ├── interaction/   # 좋아요, 댓글 등 상호작용
│   │   └── recommendation/ # 추천 시스템
│   ├── build.gradle       # Gradle 빌드 설정
│   └── ...
└── music_frontend/        # React 프론트엔드
    ├── src/
    │   ├── components/    # 재사용 가능한 컴포넌트
    │   ├── pages/         # 페이지 컴포넌트
    │   ├── context/       # React Context (인증 등)
    │   ├── api/           # API 호출 함수
    │   └── styles/        # 스타일 파일
    ├── package.json       # npm 의존성 관리
    └── ...
```

## ERD 테이블
![alt text](250702_final_1조_ERD테이블.png)

## 🛠️ 기술 스택

### 백엔드 (Spring Boot)
- **Framework**: Spring Boot 3.5.3
- **Language**: Java 17
- **Database**: MySQL
- **Security**: Spring Security + JWT
- **Documentation**: Swagger/OpenAPI 3
- **Build Tool**: Gradle

### 프론트엔드 (React)
- **Framework**: React 19.1.0
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **Routing**: React Router DOM
- **HTTP Client**: Axios
- **Animation**: Framer Motion
- **Payment**: TossPayments SDK

## 🚀 설치 및 실행

### 사전 요구사항
- Java 17 이상
- Node.js 18 이상
- MySQL 8.0 이상

### 백엔드 실행

1. **프로젝트 클론 및 디렉토리 이동**
   ```bash
   cd music
   ```

2. **MySQL 데이터베이스 설정**
   - MySQL 서버 실행
   - 데이터베이스 생성
   ```sql
   CREATE DATABASE music_platform;
   ```

3. **애플리케이션 실행**
   ```bash
   ./gradlew bootRun
   ```

4. **API 문서 확인**
   - Swagger UI: http://localhost:8080/swagger-ui.html

### 프론트엔드 실행

1. **디렉토리 이동**
   ```bash
   cd music_frontend
   ```

2. **의존성 설치**
   ```bash
   npm install
   ```

3. **개발 서버 실행**
   ```bash
   npm run dev
   ```

4. **애플리케이션 접속**
   - 브라우저에서 http://localhost:5173 접속

## 📡 API 엔드포인트



## 🎵 Music Upload (관리자용)
- **POST** `/api/admin/music/upload` : 음악 파일 업로드
- **GET** `/api/admin/music/list` : 업로드된 음악 파일 목록 조회
- **GET** `/api/admin/music/formats` : 지원 파일 형식 조회 
- **DELETE** `/api/admin/music/{songId}` : 음악 파일 삭제

## 👤 User Controller
- **GET** `/api/users` : 전체 유저 조회
- **PUT** `/api/users` : 회원 정보 수정
- **PUT** `/api/users/nickname` : 닉네임 변경
- **POST** `/api/users/send-password` : 비밀번호 찾기
- **POST** `/api/users/register` : 회원가입
- **POST** `/api/users/password` : 비밀번호 변경
- **POST** `/api/users/logout` : 로그아웃
- **POST** `/api/users/login` : 로그인
- **GET** `/api/users/search` : 닉네임으로 검색
- **GET** `/api/users/me` : 내 정보 조회
- **GET** `/api/users/check-email` : 이메일 중복 확인

## 🎶 Playlist Controller
- **GET** `/api/playlists/{id}` : 플레이리스트 상세 조회
- **PUT** `/api/playlists/{id}` : 플레이리스트 수정
- **DELETE** `/api/playlists/{id}` : 플레이리스트 삭제
- **PUT** `/api/playlists/{id}/visibility` : 공개/비공개 변경
- **GET** `/api/playlists` : 내 플레이리스트 목록 조회
- **POST** `/api/playlists` : 플레이리스트 생성
- **GET** `/api/playlists/{id}/tracks` : 트랙 목록 조회
- **POST** `/api/playlists/{id}/tracks` : 트랙 추가
- **POST** `/api/playlists/{id}/like` : 좋아요 토글
- **GET** `/api/playlists/{id}/detail` : 상세조회 + 조회수 증가
- **GET** `/api/playlists/public` : 공개 플레이리스트 검색
- **DELETE** `/api/playlists/{playlistId}/tracks/{songId}` : 트랙 삭제

## 📝 Lyrics Controller
- **GET** `/api/lyrics/{songId}` : 가사 조회
- **PUT** `/api/lyrics/{songId}` : 가사 수정
- **POST** `/api/lyrics` : 가사 저장

## 💬 Interaction Controller
- **PUT** `/api/comments/{commentId}` : 댓글 수정
- **DELETE** `/api/comments/{commentId}` : 댓글 삭제
- **GET** `/api/songs/{songId}/comments` : 댓글 목록 조회
- **POST** `/api/songs/{songId}/comments` : 댓글 작성
- **POST** `/api/reports` : 신고 추가
- **POST** `/api/likes` : 좋아요 토글
- **POST** `/api/likes/{targetType}/{targetId}/increase` : 좋아요 수 증가
- **GET** `/api/songs/{songId}/likes/users` : 곡 좋아요한 사용자 목록
- **GET** `/api/songs/{id}/likes/count` : 곡 좋아요 수 조회
- **GET** `/api/reports/{targetType}/{targetId}` : 신고 목록 조회
- **GET** `/api/artists/{artistId}/likes/count` : 아티스트 좋아요 수 조회
- **GET** `/api/albums/{albumId}/likes/count` : 앨범 좋아요 수 조회

## 🎤 Artist Controller
- **GET** `/api/artists/{id}` : 단일 아티스트 조회
- **PUT** `/api/artists/{id}` : 아티스트 정보 수정
- **DELETE** `/api/artists/{id}` : 아티스트 삭제
- **GET** `/api/artists` : 전체 아티스트 조회
- **POST** `/api/artists` : 아티스트 생성
- **GET** `/api/artists/{id}/like` : 좋아요 여부 확인
- **POST** `/api/artists/{id}/like` : 좋아요 토글
- **GET** `/api/artists/{id}/like-count` : 좋아요 수 조회

## 👮‍♀️ Admin - User Controller
- **PUT** `/api/admin/users/{userId}` : 사용자 정보 수정
- **DELETE** `/api/admin/users/{userId}` : 사용자 삭제
- **GET** `/api/admin/users` : 사용자 목록 조회

## 👮 Admin - User Subscription
- **PUT** `/api/admin/subscriptions/users/{userId}` : 사용자 구독 플랜 변경

## 💰 Admin - Plan Controller
- **PUT** `/api/admin/subscription-plans/{planId}` : 요금제 수정
- **DELETE** `/api/admin/subscription-plans/{planId}` : 요금제 삭제
- **GET** `/api/admin/subscription-plans` : 전체 요금제 목록
- **POST** `/api/admin/subscription-plans` : 요금제 생성

## 🗨️ Admin - Comment Controller
- **PUT** `/api/admin/comments/{commentId}` : 댓글 수정
- **DELETE** `/api/admin/comments/{commentId}` : 댓글 삭제
- **GET** `/api/admin/comments` : 전체 댓글 조회

## 💳 Subscription Controller
- **POST** `/api/subscriptions/subscribe` : 구독 신청

## ❤️ Song Like Controller
- **POST** `/api/songs/{songId}/likes` : 곡 좋아요 토글
- **GET** `/api/songs/{songId}/likes/is-liked` : 좋아요 여부 확인
- **GET** `/api/songs/{songId}/likes/count` : 곡 좋아요 수 조회

## 🤖 Recommendation Controller
- **POST** `/api/recommendations` : 추천 생성
- **GET** `/api/recommendations/user/{userId}` : 사용자 추천 목록 조회
- **GET** `/api/recommendations/song/{songId}` : 곡별 추천 목록 조회
- **GET** `/api/recommendations/anonymous` : 익명 추천 목록 조회

## 🔄 Index Sync
- **POST** `/api/indexes/{type}/{id}/sync` : 인덱스 동기화 요청

## 📜 History Controller
- **POST** `/api/histories` : 재생 기록 생성
- **GET** `/api/histories/user/{userId}` : 전체 재생 기록 조회
- **GET** `/api/histories/user/{userId}/recent` : 최근 재생 기록 조회
- **GET** `/api/histories/user/{userId}/between` : 기간 내 재생 기록 조회
- **GET** `/api/histories/song/{songId}` : 곡별 재생 기록 조회

## 🔗 Follow Controller
- **POST** `/api/follows/users` : 유저 팔로우/언팔로우
- **POST** `/api/follows/artists` : 아티스트 팔로우/언팔로우

## 💿 Album Like Controller
- **POST** `/api/albums/{albumId}/likes` : 앨범 좋아요 토글
- **GET** `/api/albums/{albumId}/likes/is-liked` : 앨범 좋아요 여부 확인

## 🧑‍💼 Admin Subscription Controller
- **POST** `/api/admin/subscriptions/{userId}/subscribe/{planId}` : 사용자에게 구독 플랜 부여
- **POST** `/api/admin/subscriptions/{subscriptionId}/cancel` : 구독 취소

## 📦 Subscription Plan Controller
- **GET** `/api/subscription-plans` : 전체 구독 플랜 조회
## 🔧 환경 설정

### 백엔드 설정 (application.properties)
```properties
# 데이터베이스 설정
spring.datasource.url=jdbc:mysql://localhost:3306/music_platform
spring.datasource.username=your_username
spring.datasource.password=your_password

# JWT 설정
jwt.secret=your_jwt_secret_key
jwt.expiration=86400000
```

### 프론트엔드 설정 (.env)
```env
VITE_API_BASE_URL=http://localhost:8080/api
```

## 🧪 테스트

### 백엔드 테스트
```bash
cd music
./gradlew test
```

### 프론트엔드 테스트
```bash
cd music_frontend
npm run test
```

## 📦 빌드 및 배포

### 백엔드 빌드
```bash
cd music
./gradlew build
```

### 프론트엔드 빌드
```bash
cd music_frontend
npm run build
```





