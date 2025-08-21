import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { AuthContext } from './AuthContext';
import axios from 'axios';

// 개발 모드 설정 (완전히 비활성화)
const DEV_MODE = false;

// 개발 모드에서 사용할 목업 데이터
const mockUser = {
  id: 1,
  email: 'ccc@ccc',
  nickname: '테스트유저',
  isSubscribed: true,
  role: 'ADMIN',
  profileBgImage: '/images/K-045.jpg',
  purchasedItems: ['song1', 'album1'],
};
const mockSubscriptionDetails = {
  planId: 'plan_premium',
  planName: 'Premium',
  expiryDate: '2025-07-01',
};

// API 기본 URL
const API_BASE_URL = import.meta.env.VITE_REACT_APP_API_URL || 'http://localhost:8080';

// Axios 인스턴스 생성 및 설정
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000, // 10초 타임아웃 추가
});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [subscriptionDetails, setSubscriptionDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [profileBgImage, setProfileBgImage] = useState('/images/K-045.jpg');

  // 로그아웃 함수
  const logout = useCallback(() => {
    localStorage.removeItem('jwt');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    setUser(null);
    setIsSubscribed(false);
    setSubscriptionDetails(null);
    setProfileBgImage('/images/K-045.jpg');
    // window.showToast('로그아웃되었습니다.', 'success');
  }, []);

  // 글로벌 에러 처리 인터셉터
  useEffect(() => {
    const requestInterceptor = apiClient.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('jwt');
        if (token) {
          config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    const responseInterceptor = apiClient.interceptors.response.use(
      (response) => response,
      async (error) => {
        if (error.response?.status === 401) {
          try {
            const refreshResponse = await axios.post(`${API_BASE_URL}/user/refresh-token`, {
              refreshToken: localStorage.getItem('refreshToken'),
            });
            const newToken = refreshResponse.data['jwt-auth-token'];
            localStorage.setItem('jwt', newToken);
            error.config.headers['Authorization'] = `Bearer ${newToken}`;
            setUser((prev) => (prev ? { ...prev, token: newToken } : null));
            return apiClient(error.config);
          } catch (refreshError) {
            // window.showToast('세션이 만료되었습니다. 다시 로그인해주세요.', 'error');
            logout();
            window.location.href = '/login';
          }
        } else if (error.response?.status === 403) {
          // window.showToast('권한이 없습니다.', 'error');
        }
        return Promise.reject(error);
      }
    );

    return () => {
      apiClient.interceptors.request.eject(requestInterceptor);
      apiClient.interceptors.response.eject(responseInterceptor);
    };
  }, [logout]);

  // 컴포넌트 마운트 시 사용자 상태 복원
  useEffect(() => {

    const verifyAuth = async () => {
      const token = localStorage.getItem('jwt');
      const storedUser = localStorage.getItem('user');

      if (!token || !storedUser) {
        setLoading(false);
        // 개발 모드이더라도 토큰이 없으면 초기 상태로 유지
        if (DEV_MODE) {
        }
        return;
      }
      
      // 로컬 스토리지에서 사용자 정보 복원
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        setIsSubscribed(parsedUser.isSubscribed || false);
        setProfileBgImage(parsedUser.profileBgImage || '/images/K-045.jpg');

        // DEV_MODE일 경우 서버 검증을 건너뛰고 바로 완료
        if (DEV_MODE) {
          setLoading(false);
          setSubscriptionDetails(mockSubscriptionDetails);
          return;
        }

      } catch (e) {
        localStorage.removeItem('user');
        setLoading(false);
        return;
      }

      // 서버에 토큰 유효성 검증 요청
      try {
        const response = await apiClient.get('/api/users/verify');
        
        // 응답 데이터 구조 확인
        if (response.data && response.data.success !== false) {
          const { user: userData, subscriptionDetails } = response.data;
          
          // 서버에서 받은 최신 정보로 상태 업데이트
          setUser({ ...userData, token });
          setIsSubscribed(userData.isSubscribed || false);
          setSubscriptionDetails(subscriptionDetails || null);
          setProfileBgImage(userData.profileBgImage || '/images/K-045.jpg');
          localStorage.setItem('user', JSON.stringify(userData));
        } else {
          // 로컬 데이터 유지
        }

        // 구독 상태를 별도로 조회
        try {
          const subscriptionResponse = await apiClient.get('/api/subscription/current');
          if (subscriptionResponse.data) {
            setSubscriptionDetails(subscriptionResponse.data);
            setIsSubscribed(subscriptionResponse.data.status === 'ACTIVE');
          }
        } catch (subscriptionError) {
          // 구독 정보 조회 실패 시 기본값 유지
          console.log('구독 정보 조회 실패:', subscriptionError);
        }
      } catch (error) {
        
        // 500 에러나 네트워크 오류 시 로컬 데이터 유지하고 계속 진행
        if (error.response?.status === 500) {
        } else if (error.response?.status === 401) {
          // 401 Unauthorized인 경우에만 로그아웃 처리
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          setUser(null);
        }
        // 다른 오류는 무시하고 로컬 데이터 유지
      } finally {
        setLoading(false);
      }
    };
    verifyAuth();
  }, []);

  // 로그인 함수
  const login = useCallback(async (credentials) => {
    setLoading(true);

    if (DEV_MODE) {
      await new Promise((resolve) => setTimeout(resolve, 500));
      localStorage.setItem('jwt', 'dummy_jwt_token_for_dev');
      localStorage.setItem('refreshToken', 'dummy_refresh_token_for_dev');
      localStorage.setItem('user', JSON.stringify(mockUser));

      setUser({ ...mockUser, token: 'dummy_jwt_token_for_dev' });
      setIsSubscribed(mockUser.isSubscribed);
      setSubscriptionDetails(mockSubscriptionDetails);
      setProfileBgImage(mockUser.profileBgImage);
      setLoading(false);
      return true;
    }

    try {
      const response = await apiClient.post('/api/users/login', {
        email: credentials.identifier,
        password: credentials.password,
      });
      const responseData = response.data;
      const token = responseData['jwt-auth-token'];
      const refreshToken = responseData['refresh-token'];
      const userData = {
        id: responseData.id,
        email: responseData.email,
        nickname: responseData.nickname,
        profileImage: responseData.profileImage,
        role: responseData.role,
        isSubscribed: responseData.isSubscribed || false,
      };

      localStorage.setItem('jwt', token);
      if (refreshToken) localStorage.setItem('refreshToken', refreshToken);
      localStorage.setItem('user', JSON.stringify(userData));
      
      setUser(userData);
      setIsSubscribed(userData.isSubscribed);
      setSubscriptionDetails(null);
      setProfileBgImage(userData.profileImage || '/images/K-045.jpg');
      return true;
    } catch (error) {
      // window.showToast(error.response?.data?.result || '로그인 중 오류가 발생했습니다.', 'error');
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  // 소셜 로그인 처리
  const handleSocialLoginToken = useCallback(async (token) => {
    localStorage.setItem('jwt', token);
    setLoading(true);

    if (DEV_MODE) {
      // DEV_MODE에서는 소셜 로그인 토큰 핸들링 로직도 목업 처리
      localStorage.setItem('refreshToken', 'dummy_refresh_token_for_dev');
      localStorage.setItem('user', JSON.stringify(mockUser));
      setUser({ ...mockUser, token });
      setIsSubscribed(mockUser.isSubscribed);
      setSubscriptionDetails(mockSubscriptionDetails);
      setProfileBgImage(mockUser.profileBgImage);
      setLoading(false);
      return true;
    }

    try {
      const response = await apiClient.get('/api/users/verify');
      const { user: userData, subscriptionDetails } = response.data;
      
      localStorage.setItem('user', JSON.stringify(userData));
      
      setUser({ ...userData, token });
      setIsSubscribed(userData.isSubscribed || false);
      setSubscriptionDetails(subscriptionDetails || null);
      setProfileBgImage(userData.profileImage || '/images/K-045.jpg');
      return true;
    } catch (error) {
      logout();
      // window.showToast('소셜 로그인에 실패했습니다.', 'error');
      return false;
    } finally {
      setLoading(false);
    }
  }, [logout]);

  const contextValue = useMemo(
    () => ({
      user,
      setUser,
      isSubscribed,
      setIsSubscribed,
      subscriptionDetails,
      login,
      handleSocialLoginToken,
      logout,
      loading,
      profileBgImage,
      setProfileBgImage,
      apiClient,
    }),
    [user, isSubscribed, subscriptionDetails, login, handleSocialLoginToken, logout, loading, profileBgImage]
  );

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>;
};