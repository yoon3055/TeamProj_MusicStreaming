import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { AuthContext } from './AuthContext';
import axios from 'axios';

// 🌐 개발 모드 변수
const DEV_MODE = false;

// 더미 데이터 (개발 모드에서만 사용)
const mockUser = {
  id: 1,
  email: 'mockuser@example.com',
  nickname: '테스트유저',
  isSubscribed: true,
  role: 'ADMIN',
  profileBgImage: '/images/K-045.jpg',
  purchasedItems: ['song1', 'album1'], // 구매한 항목 추가
};
const mockSubscriptionDetails = {
  planId: 'plan_premium',
  planName: 'Premium',
  expiryDate: '2025-07-01',
};

const API_BASE_URL = import.meta.env.VITE_REACT_APP_API_URL || 'http://localhost:8080';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [subscriptionDetails, setSubscriptionDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [profileBgImage, setProfileBgImage] = useState('/images/K-045.jpg');

  // JWT 토큰을 모든 요청에 자동으로 포함시키는 인터셉터 설정
  useEffect(() => {
    const requestInterceptor = apiClient.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('jwt');
        if (token) {
          config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    return () => apiClient.interceptors.request.eject(requestInterceptor);
  }, []);

  // 페이지 로드 시 JWT 토큰으로 사용자 인증 상태 확인
  useEffect(() => {
    if (DEV_MODE) {
      setUser(mockUser);
      setIsSubscribed(mockUser.isSubscribed);
      setSubscriptionDetails(mockSubscriptionDetails);
      setLoading(false);
      localStorage.setItem('jwt', 'dummy_jwt_token_for_dev');
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
        
        setUser(userData);
        setIsSubscribed(userData.isSubscribed || false);
        setSubscriptionDetails(subscriptionDetails || null);
        setProfileBgImage(userData.profileBgImage || '/images/K-045.jpg');
        console.log('[AUTH_PROVIDER_EFFECT] Token verified, user logged in:', userData);
      } catch (error) {
        console.error('[AUTH_PROVIDER_EFFECT] Token verification failed:', error);
        localStorage.removeItem('jwt');
      } finally {
        setLoading(false);
      }
    };
    verifyAuth();
  }, []);

  // ✅ 일반 로그인 함수
  const login = useCallback(async (credentials) => {
    setLoading(true);
    if (DEV_MODE) {
      await new Promise(resolve => setTimeout(resolve, 500));
      setUser(mockUser);
      setIsSubscribed(mockUser.isSubscribed);
      setSubscriptionDetails(mockSubscriptionDetails);
      setLoading(false);
      localStorage.setItem('jwt', 'dummy_jwt_token_for_dev');
      return true;
    }

    try {
      console.log('[AUTH_PROVIDER_LOGIN] Sending login request:', credentials);
      const response = await apiClient.post('/user/doLogin', { 
        email: credentials.identifier, 
        password: credentials.password 
      });
      
      console.log('[AUTH_PROVIDER_LOGIN] Response received:', response.data);
      
      const responseData = response.data;
      
      // 백엔드 응답 구조에 맞게 수정
      const token = responseData['jwt-auth-token'];
      const userData = {
        id: responseData.id,
        email: responseData.email,
        nickname: responseData.nickname,
        profileImage: responseData.profileImage,
        role: responseData.role
      };
      
      localStorage.setItem('jwt', token);
      
      setUser(userData);
      setIsSubscribed(userData.isSubscribed || false);
      setSubscriptionDetails(null); // 구독 정보는 별도 API로 가져와야 함
      setProfileBgImage(userData.profileImage || '/images/K-045.jpg');
      
      console.log('[AUTH_PROVIDER_LOGIN] Login successful:', userData);
      return true;
    } catch (error) {
      console.error('[AUTH_PROVIDER_LOGIN] Login failed:', error);
      console.error('[AUTH_PROVIDER_LOGIN] Error response:', error.response?.data);
      
      // 에러를 다시 throw하여 LoginPage에서 catch할 수 있도록 함
      if (error.response?.status === 401) {
        throw new Error(error.response.data?.result || '이메일 또는 비밀번호가 올바르지 않습니다.');
      } else {
        throw new Error('로그인 중 오류가 발생했습니다.');
      }
    } finally {
      setLoading(false);
    }
  }, []);
  
  // ✅ 소셜 로그인 후 토큰 처리 함수
  const handleSocialLoginToken = useCallback(async (token) => {
    localStorage.setItem('jwt', token);
    setLoading(true);
    try {
      const response = await apiClient.get('/user/verify');
      const { user: userData, subscriptionDetails } = response.data;
      
      setUser(userData);
      setIsSubscribed(userData.isSubscribed || false);
      setSubscriptionDetails(subscriptionDetails || null);
      setProfileBgImage(userData.profileImage || '/images/K-045.jpg');
      console.log('[AUTH_PROVIDER_SOCIAL] Social login successful:', userData);
      return true;
    } catch (error) {
      console.error('[AUTH_PROVIDER_SOCIAL] Social login failed:', error);
      localStorage.removeItem('jwt');
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('jwt');
    setUser(null);
    setIsSubscribed(false);
    setSubscriptionDetails(null);
    setProfileBgImage('/images/K-045.jpg');
    console.log('[AUTH_PROVIDER_LOGOUT] user', null, 'subscriptionDetails', null, 'loading', false);
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
    setProfileBgImage
  }), [user, isSubscribed, subscriptionDetails, login, handleSocialLoginToken, logout, loading, profileBgImage]);

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};