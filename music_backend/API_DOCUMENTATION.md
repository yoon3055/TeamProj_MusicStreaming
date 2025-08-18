# Music Streaming API Documentation

## 개요
이 문서는 Music Streaming 프로젝트의 REST API 엔드포인트들을 설명합니다.

## 기본 정보
- **Base URL**: `http://localhost:8080`
- **Content-Type**: `application/json`
- **인증**: JWT 토큰 (일부 엔드포인트)

---

## 1. 사용자 관리 API (UserController)

### 1.1 회원가입
- **URL**: `POST /user/create`
- **설명**: 새로운 사용자 계정을 생성합니다.
- **Request Body**:
  ```json
  {
    "email": "user@example.com",
    "password": "password123",
    "name": "사용자명"
  }
  ```
- **Response**:
  - **성공 (202)**: `"success"`
  - **실패 (406)**: `"이미 가입된 사용자"`
  - **오류 (200)**: `"fail"`

### 1.2 로그인
- **URL**: `POST /user/doLogin`
- **설명**: 사용자 로그인을 처리하고 JWT 토큰을 발급합니다.
- **Request Body**:
  ```json
  {
    "email": "user@example.com",
    "password": "password123"
  }
  ```
- **Response (200)**:
  ```json
  {
    "id": 1,
    "token": "jwt_token_here"
  }
  ```

### 1.3 구글 로그인
- **URL**: `POST /user/google/doLogin`
- **설명**: 구글 OAuth를 통한 로그인을 처리합니다.
- **Request Body**:
  ```json
  {
    "code": "google_auth_code"
  }
  ```
- **Response (200)**:
  ```json
  {
    "id": 1,
    "token": "jwt_token_here"
  }
  ```

### 1.4 비밀번호 찾기
- **URL**: `POST /user/sendPw`
- **설명**: 임시 비밀번호를 생성하고 이메일로 전송합니다.
- **Parameters**: `email` (query parameter)
- **Response**:
  - **성공 (200)**: `"success"`
  - **실패 (200)**: `"fail"`

---

## 2. 플레이리스트 API (PlaylistController)

### 2.1 플레이리스트 생성
- **URL**: `POST /api/playlists`
- **설명**: 새로운 플레이리스트를 생성합니다.
- **Request Body**:
  ```json
  {
    "title": "내 플레이리스트",
    "description": "설명",
    "userId": 1,
    "isPublic": true
  }
  ```
- **Response (200)**: PlaylistDto.Response

### 2.2 내 플레이리스트 목록 조회
- **URL**: `GET /api/playlists?userId={userId}`
- **설명**: 특정 사용자의 플레이리스트 목록을 조회합니다.
- **Parameters**: `userId` (query parameter)
- **Response (200)**: List<PlaylistDto.SimpleResponse>

### 2.3 플레이리스트 상세 조회
- **URL**: `GET /api/playlists/{id}`
- **설명**: 특정 플레이리스트의 상세 정보를 조회합니다.
- **Response (200)**: PlaylistDto.Response

### 2.4 플레이리스트 수정
- **URL**: `PUT /api/playlists/{id}`
- **설명**: 플레이리스트 정보를 수정합니다.
- **Request Body**: PlaylistDto.Request
- **Response (200)**: PlaylistDto.Response

### 2.5 플레이리스트 삭제
- **URL**: `DELETE /api/playlists/{id}`
- **설명**: 플레이리스트를 삭제합니다.
- **Response (204)**: No Content

### 2.6 트랙 추가
- **URL**: `POST /api/playlists/{id}/tracks`
- **설명**: 플레이리스트에 트랙을 추가합니다.
- **Request Body**:
  ```json
  {
    "playlistId": 1,
    "songId": 1
  }
  ```
- **Response (200)**: OK

### 2.7 트랙 목록 조회
- **URL**: `GET /api/playlists/{id}/tracks`
- **설명**: 플레이리스트의 트랙 목록을 조회합니다.
- **Response (200)**: List<PlaylistSongDto.Response>

### 2.8 트랙 삭제
- **URL**: `DELETE /api/playlists/{playlistId}/tracks/{songId}`
- **설명**: 플레이리스트에서 특정 트랙을 삭제합니다.
- **Response (204)**: No Content

### 2.9 공개/비공개 전환
- **URL**: `PUT /api/playlists/{id}/visibility`
- **설명**: 플레이리스트의 공개/비공개 상태를 변경합니다.
- **Request Body**:
  ```json
  {
    "isPublic": true
  }
  ```
- **Response (200)**: PlaylistDto.Response

### 2.10 공개 플레이리스트 검색
- **URL**: `GET /api/playlists/public?keyword={keyword}&page={page}&size={size}`
- **설명**: 공개 플레이리스트를 키워드로 검색합니다.
- **Parameters**:
  - `keyword`: 검색 키워드
  - `page`: 페이지 번호 (기본값: 0)
  - `size`: 페이지 크기 (기본값: 10)
- **Response (200)**: Page<PlaylistDto.SimpleResponse>

### 2.11 상세 조회 + 조회수 증가
- **URL**: `GET /api/playlists/{id}/detail`
- **설명**: 플레이리스트 상세 정보를 조회하고 조회수를 증가시킵니다.
- **Response (200)**: PlaylistDto.Response

### 2.12 좋아요 토글
- **URL**: `POST /api/playlists/{id}/like?userId={userId}`
- **설명**: 플레이리스트 좋아요를 토글합니다.
- **Parameters**: `userId` (query parameter)
- **Response (200)**: boolean (true=좋아요, false=좋아요 취소)

---

## 3. 재생 기록 API (HistoryController)

### 3.1 재생 기록 생성
- **URL**: `POST /api/histories`
- **설명**: 새로운 재생 기록을 생성합니다.
- **Request Body**:
  ```json
  {
    "userId": 1,
    "songId": 1,
    "playedAt": "2024-01-01T12:00:00"
  }
  ```
- **Response (201)**: HistoryDto.Response (Location 헤더 포함)

### 3.2 사용자별 전체 재생 기록
- **URL**: `GET /api/histories/user/{userId}`
- **설명**: 특정 사용자의 모든 재생 기록을 조회합니다.
- **Response (200)**: List<HistoryDto.SimpleResponse>

### 3.3 사용자별 최근 재생 기록
- **URL**: `GET /api/histories/user/{userId}/recent?limit={limit}`
- **설명**: 특정 사용자의 최근 N개 재생 기록을 조회합니다.
- **Parameters**: `limit` (기본값: 10)
- **Response (200)**: List<HistoryDto.SimpleResponse>

### 3.4 곡별 전체 재생 기록
- **URL**: `GET /api/histories/song/{songId}`
- **설명**: 특정 곡의 모든 재생 기록을 조회합니다.
- **Response (200)**: List<HistoryDto.SimpleResponse>

### 3.5 사용자별 기간 내 재생 기록
- **URL**: `GET /api/histories/user/{userId}/between?start={start}&end={end}`
- **설명**: 특정 사용자의 기간 내 재생 기록을 조회합니다.
- **Parameters**:
  - `start`: 시작 시간 (ISO DateTime 형식)
  - `end`: 종료 시간 (ISO DateTime 형식)
- **Response (200)**: List<HistoryDto.SimpleResponse>

---

## 4. 구독 API (SubscriptionController)

### 4.1 구독 신청
- **URL**: `POST /api/subscriptions/subscribe?userId={userId}&planId={planId}`
- **설명**: 사용자가 구독 플랜에 가입합니다.
- **Headers**: `X-AUTH-TOKEN` (JWT 토큰)
- **Parameters**:
  - `userId`: 사용자 ID
  - `planId`: 구독 플랜 ID
- **Response (200)**: UserSubscriptionDto.Response

---

## 5. 구독 플랜 API (SubscriptionPlanController)

### 5.1 모든 구독 플랜 조회
- **URL**: `GET /api/subscription-plans`
- **설명**: 등록된 모든 구독 플랜을 조회합니다.
- **Response (200)**:
  ```json
  [
    {
      "id": 1,
      "name": "Basic Plan",
      "price": 9900,
      "durationDays": 30
    }
  ]
  ```

---

## 6. 추천 API (RecommendationController)

### 6.1 추천 생성
- **URL**: `POST /api/recommendations`
- **설명**: 새로운 추천을 생성합니다.
- **Request Body**:
  ```json
  {
    "userId": 1,
    "songId": 1,
    "reason": "추천 이유"
  }
  ```
- **Response (201)**: RecommendationDto.Response (Location 헤더 포함)

### 6.2 사용자별 추천 목록 조회
- **URL**: `GET /api/recommendations/user/{userId}`
- **설명**: 특정 사용자에 대한 추천 목록을 조회합니다.
- **Response (200)**: List<RecommendationDto.SimpleResponse>

### 6.3 곡별 추천 목록 조회
- **URL**: `GET /api/recommendations/song/{songId}`
- **설명**: 특정 곡에 대한 추천 목록을 조회합니다.
- **Response (200)**: List<RecommendationDto.SimpleResponse>

### 6.4 익명 추천 목록 조회
- **URL**: `GET /api/recommendations/anonymous`
- **설명**: 익명 사용자를 위한 추천 목록을 조회합니다.
- **Response (200)**: List<RecommendationDto.SimpleResponse>

---

## 공통 응답 코드

| 상태 코드 | 설명 |
|----------|------|
| 200 | 성공 |
| 201 | 생성됨 |
| 202 | 수락됨 |
| 204 | 내용 없음 |
| 400 | 잘못된 요청 |
| 401 | 인증되지 않음 |
| 403 | 권한 없음 |
| 404 | 찾을 수 없음 |
| 406 | 수락할 수 없음 |
| 500 | 서버 오류 |

---

## 인증

일부 API는 JWT 토큰을 통한 인증이 필요합니다. 토큰은 로그인 API를 통해 발급받을 수 있으며, 요청 헤더에 다음과 같이 포함해야 합니다:

```
Authorization: Bearer {jwt_token}
```

또는

```
X-AUTH-TOKEN: {jwt_token}
```

---

## 예시 사용법

### 1. 사용자 등록 및 로그인
```bash
# 회원가입
curl -X POST http://localhost:8080/user/create \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123","name":"테스트사용자"}'

# 로그인
curl -X POST http://localhost:8080/user/doLogin \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

### 2. 플레이리스트 생성 및 조회
```bash
# 플레이리스트 생성
curl -X POST http://localhost:8080/api/playlists \
  -H "Content-Type: application/json" \
  -d '{"title":"내 플레이리스트","description":"좋아하는 음악들","userId":1,"isPublic":true}'

# 내 플레이리스트 목록 조회
curl -X GET "http://localhost:8080/api/playlists?userId=1"
```

### 3. 재생 기록 생성
```bash
curl -X POST http://localhost:8080/api/histories \
  -H "Content-Type: application/json" \
  -d '{"userId":1,"songId":1,"playedAt":"2024-01-01T12:00:00"}'
```

---

## 참고사항

1. 모든 날짜/시간은 ISO 8601 형식을 사용합니다.
2. 페이징이 지원되는 API는 `page`와 `size` 파라미터를 사용합니다.
3. 검색 API는 키워드 매칭을 지원합니다.
4. 일부 API는 JWT 토큰 인증이 필요하며, 토큰 만료 시 재로그인이 필요합니다.
