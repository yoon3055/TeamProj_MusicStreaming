import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { AuthContext } from './AuthContext';
import axios from 'axios';

// 개발자 모드 여부
const DEV_MODE = import.meta.env.VITE_DEV_MODE === 'true';

const mockUser = {
  id: 1,
  email: 'mockuser@example.com',
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

const API_BASE_URL = import.meta.env.VITE_REACT_APP_API_URL || 'http://localhost:8080';

// 인증 필요 요청에만 사용하는 전용 axios 인스턴스
const apiClient = axios.create({
  baseURL: API_BASE_URL,
});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [subscriptionDetails, setSubscriptionDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [profileBgImage, setProfileBgImage] = useState('/images/K-045.jpg');

  // ✅ JWT 자동 추가 인터셉터 (로그인 이후에만 작동)
  useEffect(() => {
    const requestInterceptor = apiClient.interceptors.request.use((config) => {
      const token = localStorage.getItem('jwt');
      if (token) config.headers['Authorization'] = `Bearer ${token}`;
      return config;
    });

    const responseInterceptor = apiClient.interceptors.response.use(
      response => response,
      async (error) => {
        if (error.response?.status === 401) {
          try {
            const refreshResponse = await axios.post(`${API_BASE_URL}/user/refresh-token`, {
              refreshToken: localStorage.getItem('refreshToken'),
            });
            const newToken = refreshResponse.data['jwt-auth-token'];
            localStorage.setItem('jwt', newToken);
            error.config.headers['Authorization'] = `Bearer ${newToken}`;
            setUser(prev => prev ? { ...prev, token: newToken } : null);
            return apiClient(error.config);
          } catch (_refreshError) {
            console.error('[TOKEN_REFRESH_FAILED]', _refreshError);
            localStorage.removeItem('jwt');
            localStorage.removeItem('refreshToken');
            setUser(null);
            setIsSubscribed(false);
            setSubscriptionDetails(null);
            window.location.href = '/login';
          }
        }
        return Promise.reject(error);
      }
    );

    return () => {
      apiClient.interceptors.request.eject(requestInterceptor);
      apiClient.interceptors.response.eject(responseInterceptor);
    };
  }, []);

  // ✅ 초기 인증 확인
  useEffect(() => {
    if (DEV_MODE) {
      setUser({ ...mockUser, token: 'dummy_jwt_token_for_dev' });
      setIsSubscribed(mockUser.isSubscribed);
      setSubscriptionDetails(mockSubscriptionDetails);
      localStorage.setItem('jwt', 'dummy_jwt_token_for_dev');
      setLoading(false);
      return;
    }

    const verifyAuth = async () => {
      const token = localStorage.getItem('jwt');
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const response = await apiClient.get('/user/verify');
        const { user: userData, subscriptionDetails } = response.data;
        setUser({ ...userData, token });
        setIsSubscribed(userData.isSubscribed || false);
        setSubscriptionDetails(subscriptionDetails || null);
        setProfileBgImage(userData.profileBgImage || '/images/K-045.jpg');
        console.log('[VERIFY_AUTH_SUCCESS]', userData);
      } catch (error) {
        console.error('[VERIFY_AUTH_FAILED]', error);
        localStorage.removeItem('jwt');
        localStorage.removeItem('refreshToken');
      } finally {
        setLoading(false);
      }
    };

    verifyAuth();
  }, []);

  // ✅ 일반 로그인
  const login = useCallback(async ({ email, password }) => {
    setLoading(true);

    if (DEV_MODE) {
      await new Promise(resolve => setTimeout(resolve, 300));
      setUser({ ...mockUser, token: 'dummy_jwt_token_for_dev' });
      setIsSubscribed(mockUser.isSubscribed);
      setSubscriptionDetails(mockSubscriptionDetails);
      localStorage.setItem('jwt', 'dummy_jwt_token_for_dev');
      setLoading(false);
      return true;
    }

    try {
      const response = await axios.post(`${API_BASE_URL}/api/users/login`, {
        email,
        password,
      });

      const data = response.data;
      const token = data['jwt-auth-token'];
      const refreshToken = data['refresh-token'];

      const userData = {
        id: data.id,
        email: data.email,
        nickname: data.nickname,
        profileImage: data.profileImage,
        role: data.role,
        token,
      };

      localStorage.setItem('jwt', token);
      if (refreshToken) localStorage.setItem('refreshToken', refreshToken);

      setUser(userData);
      setIsSubscribed(data.isSubscribed || false);
      setSubscriptionDetails(null);
      setProfileBgImage(data.profileImage || '/images/K-045.jpg');

      console.log('[LOGIN_SUCCESS]', userData);
      return true;
    } catch (err) {
      console.error('[LOGIN_FAILED]', err);
      throw err; // 로그인 페이지에서 직접 처리
    } finally {
      setLoading(false);
    }
  }, []);

  // ✅ 소셜 로그인 (토큰으로 인증)
  const handleSocialLoginToken = useCallback(async (token) => {
    localStorage.setItem('jwt', token);
    setLoading(true);
    try {
      const response = await apiClient.get('/user/verify');
      const { user: userData, subscriptionDetails } = response.data;
      setUser({ ...userData, token });
      setIsSubscribed(userData.isSubscribed || false);
      setSubscriptionDetails(subscriptionDetails || null);
      setProfileBgImage(userData.profileImage || '/images/K-045.jpg');
      console.log('[SOCIAL_LOGIN_SUCCESS]', userData);
      return true;
    } catch (error) {
      console.error('[SOCIAL_LOGIN_FAILED]', error);
      localStorage.removeItem('jwt');
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  // ✅ 로그아웃
  const logout = useCallback(() => {
    localStorage.removeItem('jwt');
    localStorage.removeItem('refreshToken');
    setUser(null);
    setIsSubscribed(false);
    setSubscriptionDetails(null);
    setProfileBgImage('/images/K-045.jpg');
    console.log('[LOGOUT_SUCCESS]');
  }, []);

  const contextValue = useMemo(() => ({
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
  }), [
    user,
    isSubscribed,
    subscriptionDetails,
    login,
    handleSocialLoginToken,
    logout,
    loading,
    profileBgImage,
  ]);

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};
