import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { AuthContext } from './AuthContext';




// DEV 모드용 더미 유저 (필요 시)
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
      console.warn('[DEV_MODE] 인증 우회 활성화됨 - mock 유저로 로그인 처리됨');
      setUser(mockUser);
      setIsSubscribed(mockUser.isSubscribed);
      setLoading(false);
      return;
    }

    const token = localStorage.getItem('token');
    if (token) {
      axios
        .get(`${import.meta.env.VITE_REACT_APP_API_URL}/api/auth/verify`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((response) => {
          setUser(response.data.user);
          setIsSubscribed(response.data.user.isSubscribed || false);
          setLoading(false);
        })
        .catch((error) => {
          console.error('사용자 인증 실패:', error);
          localStorage.removeItem('token');
          setUser(null);
          setIsSubscribed(false);
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, []);

  const login = async ({ identifier, password }) => {
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_REACT_APP_API_URL}/api/auth/login`,
        { identifier, password }
      );
      const { token, user } = response.data;
      localStorage.setItem('token', token);
      setUser(user);
      setIsSubscribed(user.isSubscribed || false);
      return true;
    } catch (error) {
      console.error('로그인 실패:', error);
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    setIsSubscribed(false);
  };

  return (
    <AuthContext.Provider
      value={{ user, isSubscribed, setIsSubscribed, login, logout, loading }}
    >
      {children}
    </AuthContext.Provider>
  );
};
