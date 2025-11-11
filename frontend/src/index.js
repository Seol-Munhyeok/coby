// src/index.js
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import reportWebVitals from './reportWebVitals';
import './index.css';

// 1. Router.js에 있던 모든 페이지 컴포넌트를 import 합니다.
import Login from "./pages/Login/Login";
import NicknamePopup from "./pages/NickName/NicknamePopup";
import MainPage from "./pages/Main/MainPage";
import WaitingRoom from "./pages/WaitingRoom/WaitingRoom";
import BattleRoom from "./pages/BattleRoom/BattleRoom";
import ResultRoom from "./pages/ResultRoom/ResultRoom";
import WebSocketLayout from "./pages/WebSocket/WebSocketLayout";
import AuthLayout from "./pages/AuthContext/AuthLayout";
import DirectAccessProtection from "./pages/DirectAccessProtection";
import BlockerLayout from './BlockerLayout';

const router = createBrowserRouter([
  {
    element: <App />, // 최상위 (우클릭 방지 등)
    children: [
      {
        // 2. BlockerLayout이 모든 라우트를 감싸도록 설정
        element: <BlockerLayout />, 
        children: [
          // 3. 기존의 모든 라우트를 BlockerLayout의 자식으로 이동
          { path: "/", element: <Login /> },
          {
            element: <AuthLayout />,
            children: [
              { path: "/nickname", element: <NicknamePopup /> },
              { path: "/mainpage", element: <MainPage /> },
              {
                element: <DirectAccessProtection />,
                children: [
                  {
                    element: <WebSocketLayout />,
                    children: [
                      { path: "/waitingRoom/:roomId", element: <WaitingRoom /> },
                      { path: "/gamepage/:roomId", element: <BattleRoom /> },
                      { path: "/resultpage/:roomId", element: <ResultRoom /> },
                    ]
                  }
                ]
              }
            ]
          }
        ]
      }
    ]
  }
]);

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode> 
     {/* 3. <BrowserRouter> 대신 <RouterProvider router={router} />를 렌더링합니다. */}
    <RouterProvider router={router} />
  </React.StrictMode>
);

reportWebVitals();