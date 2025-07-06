// src/components/WebSocketLayout.jsx
import React from 'react';
import { Outlet } from 'react-router-dom'; // Outlet 임포트
import { WebSocketProvider } from './WebSocketContext'; // WebSocketProvider 임포트 (경로 확인)

const WebSocketLayout = () => {
  return (
    <WebSocketProvider>
      <Outlet /> {/* WebSocketProvider 내부에서 하위 라우트 컴포넌트가 렌더링될 위치 */}
    </WebSocketProvider>
  );
};

export default WebSocketLayout;