import React, { useState, useEffect, useContext, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import Equalizer from '../component/Equalizer';
import '../styles/UserProfilePage.css';

const UserProfilePage = () => {
  const {
    user,
    setUser, // setUser 함수 추가
    isSubscribed,
    setIsSubscribed,
    subscriptionDetails,
    logout,
    profileBgImage, // AuthContext에서 가져온 profileBgImage
    setProfileBgImage,
    loading: authLoading
  } = useContext(AuthContext);

  const [profile, setProfile] = useState(null);
  const [history, setHistory] = useState([]);
  const [editMode, setEditMode] = useState(false);
  const [nickname, setNickname] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const jwt = localStorage.getItem('jwt'); // JWT는 실제 백엔드 연동 시 필요

  // 사용자 프로필 정보를 가져오는 함수
  const fetchProfile = useCallback(() => {
    if (!user) { // user 객체가 없으면 로그인 필요
      setError('로그인이 필요합니다.');
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      // AuthContext의 user 객체에서 실제 이메일과 닉네임을 가져와 설정
      setProfile({
        email: user.email, // 로그인한 유저의 이메일 사용
        nickname: user.nickname, // 로그인한 유저의 닉네임 사용
        subscriptionStatus: isSubscribed ? 'active' : 'inactive', // AuthContext의 isSubscribed 사용
        profileImageUrl: profileBgImage || '/images/default-profile.jpg' // 기본 이미지 경로 추가
      });
      setNickname(user.nickname); // 닉네임 초기화 (편집 모드용)
    } catch (err) {
      setError('프로필을 불러오는 데 실패했습니다.');
      console.error('Fetch profile error:', err);
    } finally {
      setLoading(false);
    }
  }, [user, isSubscribed, profileBgImage]); // 의존성 배열에 user, isSubscribed, profileBgImage 추가

  // 구독 이력을 가져오는 함수 (목업 데이터)
  const fetchHistory = useCallback(() => {
    if (!jwt) return; // 실제 API 호출 시 JWT 필요
    // 실제 API 호출 대신 목업 데이터 사용
    setHistory([
      {
        id: 'sub_001',
        planName: 'Premium',
        subscribedAt: '2025-06-01T00:00:00Z',
        expiresAt: '2025-07-01T00:00:00Z',
        price: 14900,
      },
      {
        id: 'sub_002',
        planName: 'Standard',
        subscribedAt: '2024-05-01T00:00:00Z',
        expiresAt: '2024-06-01T00:00:00Z',
        price: 9900,
      },
    ]);
  }, [jwt]);

  // 컴포넌트 마운트 시 프로필 및 이력 가져오기
  useEffect(() => {
    if (user) {
      fetchProfile();
      fetchHistory();
    } else {
      setLoading(false);
      setError('로그인 후 프로필을 확인할 수 있습니다.');
    }
  }, [user, fetchProfile, fetchHistory]); // 의존성 배열 업데이트

  // 프로필 업데이트 처리
  const handleUpdate = async (e) => {
    e.preventDefault();
    
    if (!jwt) {
      alert('로그인이 필요합니다.');
      return;
    }

    try {
      const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${jwt}`
      };

      // 닉네임 업데이트
      if (nickname && nickname !== profile.nickname) {
        const nicknameResponse = await fetch('http://localhost:8080/api/users', {
          method: 'PUT',
          headers: headers,
          body: JSON.stringify({
            nickname: nickname,
            email: user.email
          })
        });

        if (!nicknameResponse.ok) {
          throw new Error('닉네임 업데이트에 실패했습니다.');
        }
      }

      // 비밀번호 변경 (비밀번호가 입력된 경우에만)
      if (password && password.trim() !== '') {
        const passwordResponse = await fetch('http://localhost:8080/api/users/password', {
          method: 'POST',
          headers: headers,
          body: JSON.stringify({
            newPassword: password,
            // 현재 비밀번호는 임시로 빈 값으로 설정 (실제로는 현재 비밀번호 입력 필드가 필요)
            currentPassword: ''
          })
        });

        if (!passwordResponse.ok) {
          throw new Error('비밀번호 변경에 실패했습니다.');
        }
      }

      // 성공 시 로컬 상태 업데이트
      const updatedProfile = { ...profile, nickname };
      setProfile(updatedProfile);
      setEditMode(false);
      setPassword(''); // 비밀번호 초기화
      
      // AuthContext의 user 정보도 업데이트 (닉네임이 변경된 경우)
      if (nickname && nickname !== profile.nickname) {
        const updatedUser = { ...user, nickname };
        setUser(updatedUser);
        // localStorage의 user 정보도 업데이트
        localStorage.setItem('user', JSON.stringify(updatedUser));
      }
      
      alert('프로필이 성공적으로 업데이트되었습니다!');
      
      // 프로필 정보 다시 가져오기
      fetchProfile();
      
    } catch (err) {
      console.error('Profile update error:', err);
      alert('업데이트 실패: ' + err.message);
    }
  };

  // 구독 해지 처리
  const handleUnsubscribe = async () => {
    try {
      // 실제 백엔드 연동 로직 (현재는 목업)
      setIsSubscribed(false); // AuthContext 업데이트
      setProfile(prev => ({ ...prev, subscriptionStatus: 'inactive' })); // 로컬 프로필 상태 업데이트
      alert('구독 해지 완료');
      navigate('/subscription'); // 구독 페이지로 이동
    } catch (err) {
      alert('구독 해지 실패: ' + err.message);
    }
  };

  // 구독 연장 처리
  const handleExtend = () => {
    if (subscriptionDetails?.planId) {
      navigate(`/payment/${subscriptionDetails.planId}`); // 특정 플랜 ID로 결제 페이지 이동
    } else {
      navigate('/subscription-plans'); // 구독 플랜 선택 페이지로 이동
    }
  };

  // 로그아웃 처리
  const handleLogout = () => {
    logout(); // AuthContext의 logout 함수 호출
    navigate('/login'); // 로그인 페이지로 이동
  };

  // 프로필 이미지 업로드 처리
  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // 파일 크기 체크 (5MB 제한)
    if (file.size > 5 * 1024 * 1024) {
      alert('파일 크기는 5MB 이하여야 합니다.');
      return;
    }

    // 파일 타입 체크
    if (!file.type.startsWith('image/')) {
      alert('이미지 파일만 업로드 가능합니다.');
      return;
    }

    if (!jwt) {
      alert('로그인이 필요합니다.');
      return;
    }

    try {
      console.log('프로필 이미지 업로드 시작');
      console.log('사용자 이메일:', user.email);
      console.log('JWT 토큰 존재:', !!jwt);
      console.log('파일 크기:', file.size);
      
      // FileReader를 사용하여 Base64로 직접 변환 (CSP 에러 방지)
      const reader = new FileReader();
      
      reader.onload = async (e) => {
        try {
          // 이미지 크기 최적화를 위한 캔버스 처리
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          const img = new Image();
          
          img.onload = async () => {
            try {
              // 이미지 크기 조정 (최대 300x300)
              const maxSize = 300;
              let { width, height } = img;
              
              if (width > height) {
                if (width > maxSize) {
                  height = (height * maxSize) / width;
                  width = maxSize;
                }
              } else {
                if (height > maxSize) {
                  width = (width * maxSize) / height;
                  height = maxSize;
                }
              }
              
              canvas.width = width;
              canvas.height = height;
              
              // 캔버스에 이미지 그리기
              ctx.drawImage(img, 0, 0, width, height);
              
              // 압축된 이미지를 Base64로 변환 (품질 0.3 - 더 높은 압축률)
              const imageDataUrl = canvas.toDataURL('image/jpeg', 0.3);
              
              console.log('이미지 데이터 크기:', imageDataUrl.length);
              
              // 백엔드 API로 프로필 이미지 업데이트
              const requestBody = {
                email: user.email,
                profileImage: imageDataUrl
              };
              
              console.log('백엔드로 전송할 데이터:', {
                email: requestBody.email,
                profileImageLength: requestBody.profileImage.length
              });
              
              const response = await fetch('http://localhost:8080/api/users', {
                method: 'PUT',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${jwt}`
                },
                body: JSON.stringify(requestBody)
              });

              console.log('백엔드 응답 상태:', response.status);
              console.log('백엔드 응답 OK:', response.ok);

              if (!response.ok) {
                const errorText = await response.text();
                console.error('백엔드 에러 응답:', errorText);
                throw new Error(`프로필 이미지 업데이트에 실패했습니다. 상태: ${response.status}`);
              }

              const responseText = await response.text();
              console.log('백엔드 성공 응답:', responseText);

              // 성공 시 로컬 상태 업데이트
              setProfileBgImage(imageDataUrl); // AuthContext에 이미지 저장
              setProfile(prev => ({ ...prev, profileImageUrl: imageDataUrl })); // 로컬 프로필 상태 업데이트
              
              // AuthContext의 user 정보도 업데이트
              const updatedUser = { ...user, profileImage: imageDataUrl };
              setUser(updatedUser);
              localStorage.setItem('user', JSON.stringify(updatedUser));
              
              setError(null);
              alert('프로필 이미지가 성공적으로 변경되었습니다!');
              
            } catch (err) {
              console.error('Profile image update error:', err);
              alert('프로필 이미지 업데이트 실패: ' + err.message);
            }
          };
          
          // CSP 에러를 피하기 위해 Base64 데이터 URL 직접 사용
          img.src = e.target.result;
          
        } catch (err) {
          console.error('Image processing error:', err);
          alert('이미지 처리 중 오류가 발생했습니다.');
        }
      };
      
      reader.onerror = () => {
        console.error('File reading error');
        alert('파일을 읽는 중 오류가 발생했습니다.');
      };
      
      // 파일을 Base64로 읽기
      reader.readAsDataURL(file);
      
    } catch (err) {
      console.error('File reading error:', err);
      alert('파일을 읽는 중 오류가 발생했습니다.');
    }
  };

  if (loading || authLoading) {
    return <div className="user-profile-page-loading">프로필을 불러오는 중입니다...</div>;
  }

  if (error || !profile) {
    return (
      <div className="user-profile-page-loading user-profile-page-error">
        {error || '로그인 상태를 확인해주세요.'}
      </div>
    );
  }

  return (
    <div className="user-profile-page-container">
      <div className="user-profile-main-wrapper">
        <div className="user-profile-columns">
          {/* 프로필 편집 영역 */}
          <div className="user-profile-column">
            <div className="user-profile-box profile-info-box" style={{ backgroundImage: `url(${profileBgImage})` }}>
              <div className="user-profile-overlay-dark">
                {/* 상단 프로필 이미지 및 닉네임 섹션 */}
                <div className="profile-image-section">
                  <div className="profile-image-circle">
                    {/* profile.profileImageUrl이 없거나 로드 실패 시 기본 이미지 사용 */}
                    <img src={profile.profileImageUrl} alt="프로필 이미지" onError={(e) => { e.target.onerror = null; e.target.src = '/images/default-profile.jpg'; }} />
                  </div>
                  <h2 className="profile-nickname-display">{profile.nickname}</h2>
                  <p className="profile-email-display">{profile.email}</p>
                </div>

                <div className="user-profile-section">
                  <h3 className="user-profile-section-title">프로필 정보</h3>
                  {editMode ? (
                    <form className="user-profile-form" onSubmit={handleUpdate}>
                      <input
                        type="text"
                        value={nickname}
                        onChange={(e) => setNickname(e.target.value)}
                        className="user-profile-input"
                        placeholder="새 닉네임"
                      />
                      <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="새 비밀번호 (선택 사항)"
                        className="user-profile-input"
                      />
                      <div className="user-profile-button-row">
                        <button
                          type="button"
                          onClick={() => setEditMode(false)}
                          className="btn-default"
                        >
                          취소
                        </button>
                        <button type="submit" className="btn-default">
                          저장
                        </button>
                      </div>
                    </form>
                  ) : (
                    <div className="user-profile-info-display">
                      <p>
                        <strong>이메일:</strong> {profile.email}
                      </p>
                      <p>
                        <strong>닉네임:</strong> {profile.nickname}
                      </p>
                      <button onClick={() => setEditMode(true)} className="btn-default">
                        프로필 수정
                      </button>
                    </div>
                  )}
                </div>

                <div className="user-profile-section">
                  <h3 className="user-profile-section-title">프로필 이미지 변경</h3>
                  <div className="profile-image-upload-container">
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={handleImageUpload} 
                      id="profile-image-input"
                      style={{ display: 'none' }}
                    />
                    <button 
                      type="button"
                      onClick={() => document.getElementById('profile-image-input').click()}
                      className="btn-default"
                    >
                      프로필 이미지 변경
                    </button>
                    <p className="upload-help-text">JPG, PNG 파일만 업로드 가능합니다.</p>
                  </div>
                </div>

                <div className="user-profile-section">
                  <h3 className="user-profile-section-title">기타 기능</h3>
                  <h5>다양한 설정과 관리가 가능합니다.</h5>
                  <button onClick={handleLogout} className="btn-default">
                    로그아웃
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* 구독 정보 영역 */}
          <div className="user-profile-column">
            <div className="user-profile-box">
              <div className="user-profile-overlay-dark">
                <h3 className="user-profile-section-title green">구독 정보</h3>
                <p
                  className={`user-profile-subscription-status ${
                    profile.subscriptionStatus === 'active' ? 'active' : 'inactive'
                  }`}
                >
                  {profile.subscriptionStatus === 'active'
                    ? '활성화 : 구독 중'
                    : '비활성화 : 구독 없음'}
                </p>
                {/* 구독 중일 때만 이퀄라이저 활성화 */}
                {profile.subscriptionStatus === 'active' && (
                  <Equalizer isPlaying={true} />
                )}
                
                {profile.subscriptionStatus === 'active' && (
                  <div className="user-profile-button-row">
                    <button onClick={handleExtend} className="btn-green">
                      구독 연장
                    </button>
                    <button onClick={handleUnsubscribe} className="btn-red">
                      구독 해지
                    </button>
                  </div>
                )}
                <button onClick={() => navigate('/subscription')} className="btn-default">
                  구독 상태 확인
                </button>

                <div className="user-profile-section">
                  <h3 className="user-profile-section-title green">구독 이력</h3>
                  <ul className="subscription-history-list">
                    {history.length === 0 ? (
                      <li>이력이 없습니다.</li>
                    ) : (
                      history.map((h, idx) => (
                        <li key={h.id || idx}>
                          <strong>{h.planName}</strong>
                          <br />
                          {new Date(h.subscribedAt).toLocaleDateString()} ~{' '}
                          {new Date(h.expiresAt).toLocaleDateString()}
                          <br />
                          ₩{h.price.toLocaleString()}
                        </li>
                      ))
                    )}
                  </ul>
                  <button
                    onClick={() => navigate('/my-subscription')}
                    className="btn-default"
                  >
                    전체 이력 보기
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfilePage;