import React from 'react';
import { Outlet } from 'react-router-dom'; // Outlet 임포트
import AuthProvider, { WebSocketProvider } from './AuthContext'; 

const AuthLayout = () => {
  return (
    <AuthProvider>
      <Outlet />
    </AuthProvider>
  );
};

export default AuthLayout;