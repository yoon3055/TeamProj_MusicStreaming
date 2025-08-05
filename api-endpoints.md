# 🎧 Music Streaming API Endpoint Mapping

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