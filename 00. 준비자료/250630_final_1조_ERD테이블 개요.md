[User]                      -- 회원 정보 (이메일, 닉네임, 프로필 등)
- id (PK)
- email (UNIQUE)
- password
- nickname
- profile_image
- is_verified              -- 이메일 인증 여부
- created_at

[VerificationToken]        -- 이메일 인증용 토큰 저장
- id (PK)
- user_id (FK -> User.id)
- token
- expires_at
- is_used

[Artist]                   -- 아티스트 정보
- id (PK)
- name
- bio
- image_url

[Album]                    -- 앨범 정보 (아티스트 소속)
- id (PK)
- title
- artist_id (FK -> Artist.id)
- release_date
- cover_image

[Song]                     -- 개별 곡 정보
- id (PK)
- title
- album_id (FK -> Album.id)
- artist_id (FK -> Artist.id)
- duration                 -- 재생 시간 (초)
- audio_url                -- 음원 파일 링크
- genre
- created_at

[SongLyrics]               -- 곡의 가사 (다국어 지원 가능)
- id (PK)
- song_id (FK -> Song.id)
- language
- lyrics (TEXT)

[Playlist]                 -- 유저가 만든 재생목록
- id (PK)
- user_id (FK -> User.id)
- title
- is_public               -- 공개/비공개 여부
- created_at

[PlaylistSong]             -- 재생목록에 포함된 곡과 순서
- playlist_id (FK -> Playlist.id)
- song_id (FK -> Song.id)
- order

[Like]                     -- 유저가 좋아요 표시한 곡
- id (PK)
- user_id (FK -> User.id)
- song_id (FK -> Song.id)
- liked_at

[History]                  -- 유저가 재생한 기록
- id (PK)
- user_id (FK -> User.id)
- song_id (FK -> Song.id)
- played_at

[Recommendation]           -- 추천 음악 데이터
- id (PK)
- user_id (FK -> User.id)
- song_id (FK -> Song.id)
- recommended_at
- reason                   -- 추천 이유 (예: "비슷한 곡 기반")

[Follow]                   -- 유저 간 팔로우 관계
- id (PK)
- follower_id (FK -> User.id)
- following_id (FK -> User.id)

[SubscriptionPlan]         -- 구독 요금제 정보 (Free, Premium 등)
- id (PK)
- name
- price
- duration_days
- description

[UserSubscription]         -- 유저의 구독 상태 기록
- id (PK)
- user_id (FK -> User.id)
- plan_id (FK -> SubscriptionPlan.id)
- start_date
- end_date
- is_active

[Comment]                  -- 곡에 달린 댓글
- id (PK)
- user_id (FK -> User.id)
- song_id (FK -> Song.id)
- content
- created_at

[Report]                   -- 신고 기능 (댓글, 곡, 사용자 대상)
- id (PK)
- user_id (FK -> User.id)
- target_type              -- 'comment' | 'song' | 'user'
- target_id                -- 신고 대상 ID
- reason
- created_at
