import React, { useState, useEffect, useCallback, useMemo } from 'react';
import API from '../api/api';
import { AuthContext } from './AuthContext';

const DEV_MODE = false;
const mockUser = {
  id: 1,
  email: 'ccc@ccc',
  nickname: 'fdsk',
  isSubscribed: true,
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (DEV_MODE) {
      setUser(mockUser);
      setIsSubscribed(mockUser.isSubscribed);
      setLoading(false);
      return;
    }

    const verifyAuth = async () => {
      setLoading(true);
      const token = localStorage.getItem('jwt');
      if (!token) {
        setUser(null);
        setIsSubscribed(false);
        setLoading(false);
        return;
      }

      try {
        const response = await API.get('/api/auth/verify');
        setUser(response.data.user);
        setIsSubscribed(response.data.user.isSubscribed || false);
      } catch (error) {
        console.error('인증 검증 오류:', error);
        localStorage.removeItem('jwt');
        setUser(null);
        setIsSubscribed(false);
      } finally {
        setLoading(false);
      }
    };

    verifyAuth();
  }, []);

  const login = useCallback(async ({ email, password }) => {
    setLoading(true);
    try {
      const response = await API.post('/api/auth/login', { email, password });
      const { token, user: userData } = response.data;
      localStorage.setItem('jwt', token);
      setUser(userData);
      setIsSubscribed(userData.isSubscribed || false);
      return true;
    } catch (error) {
      console.error('로그인 오류:', error);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('jwt');
    setUser(null);
    setIsSubscribed(false);
  }, []);

  const contextValue = useMemo(() => ({
    user,
    setUser,         // ★ 이 부분 꼭 포함해야 함 ★
    isSubscribed,
    setIsSubscribed,
    login,
    logout,
    loading,
  }), [user, setUser, isSubscribed, setIsSubscribed, login, logout, loading]);

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};
