import React from 'react';

// AuthContext 생성 및 useAuth 훅 정의
export const AuthContext = React.createContext();

export const useAuth = () => React.useContext(AuthContext);