import React, { useState, useEffect, useContext, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import '../styles/UserProfilePage.css';

const UserProfilePage = () => {
  const {
    user,
    setUser,
    isSubscribed,
    setIsSubscribed,
    subscriptionDetails,
    logout,
    profileBgImage,
    setProfileBgImage,
    loading: authLoading
  } = useContext(AuthContext);

  const [profile, setProfile] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [nickname, setNickname] = useState('');
  const [password, setPassword] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const jwt = localStorage.getItem('jwt');

  const fetchProfile = useCallback(() => {
    if (!user) {
      setError('로그인이 필요합니다.');
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      setProfile({
        email: user.email,
        nickname: user.nickname,
        subscriptionStatus: isSubscribed ? 'active' : 'inactive',
        profileImageUrl: profileBgImage || '/images/default-profile.jpg'
      });
      setNickname(user.nickname);
    } catch (err) {
      setError('프로필을 불러오는 데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  }, [user, isSubscribed, profileBgImage]);

  useEffect(() => {
    if (user) {
      fetchProfile();
    } else {
      setLoading(false);
      setError('로그인 후 프로필을 확인할 수 있습니다.');
    }
  }, [user, fetchProfile]);

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

      if (password && password.trim() !== '') {
        const passwordResponse = await fetch('http://localhost:8080/api/users/password', {
          method: 'POST',
          headers: headers,
          body: JSON.stringify({
            currentPassword: currentPassword,
            newPassword: password,
            confirmPassword: password
          })
        });

        if (!passwordResponse.ok) {
          const errorData = await passwordResponse.json();
          throw new Error(errorData.message || '비밀번호 변경에 실패했습니다.');
        }
      }

      const updatedProfile = { ...profile, nickname };
      setProfile(updatedProfile);
      setEditMode(false);
      setPassword('');
      setCurrentPassword('');
      
      if (nickname && nickname !== profile.nickname) {
        const updatedUser = { ...user, nickname };
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
      }
      
      alert('프로필이 성공적으로 업데이트되었습니다!');
      fetchProfile();
      
    } catch (err) {
      window.showToast && window.showToast('업데이트 실패: ' + err.message, 'error');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert('파일 크기는 5MB 이하여야 합니다.');
      return;
    }

    if (!file.type.startsWith('image/')) {
      alert('이미지 파일만 업로드 가능합니다.');
      return;
    }

    if (!jwt) {
      alert('로그인이 필요합니다.');
      return;
    }

    try {
      const reader = new FileReader();
      
      reader.onload = async (e) => {
        try {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          const img = new Image();
          
          img.onload = async () => {
            try {
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
              ctx.drawImage(img, 0, 0, width, height);
              
              const imageDataUrl = canvas.toDataURL('image/jpeg', 0.3);
              
              const requestBody = {
                email: user.email,
                profileImage: imageDataUrl
              };
              
              const response = await fetch('http://localhost:8080/api/users', {
                method: 'PUT',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${jwt}`
                },
                body: JSON.stringify(requestBody)
              });

              if (!response.ok) {
                throw new Error(`프로필 이미지 업데이트에 실패했습니다. 상태: ${response.status}`);
              }

              setProfileBgImage(imageDataUrl);
              setProfile(prev => ({ ...prev, profileImageUrl: imageDataUrl }));
              
              const updatedUser = { ...user, profileImage: imageDataUrl };
              setUser(updatedUser);
              localStorage.setItem('user', JSON.stringify(updatedUser));
              
              setError(null);
              window.showToast && window.showToast('프로필 이미지가 성공적으로 변경되었습니다!', 'success');
              
            } catch (err) {
              window.showToast && window.showToast('프로필 이미지 업데이트 실패: ' + err.message, 'error');
            }
          };
          
          img.src = e.target.result;
          
        } catch (err) {
          window.showToast && window.showToast('이미지 처리 중 오류가 발생했습니다.', 'error');
        }
      };
      
      reader.onerror = () => {
        window.showToast && window.showToast('파일을 읽는 중 오류가 발생했습니다.', 'error');
      };
      
      reader.readAsDataURL(file);
      
    } catch (err) {
      window.showToast && window.showToast('파일을 읽는 중 오류가 발생했습니다.', 'error');
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
    <div className="user-profile-box profile-info-box">
      <div className="user-profile-overlay-dark">
        <div className="profile-image-section">
          <div className="profile-image-circle">
            <img 
              src={profile.profileImageUrl} 
              alt="프로필 이미지" 
              onError={(e) => { 
                e.target.onerror = null; 
                e.target.src = '/images/default-profile.jpg'; 
              }} 
            />
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
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="현재 비밀번호"
                className="user-profile-input"
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

      </div>
    </div>
  );
};

export default UserProfilePage;