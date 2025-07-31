// src/Router.js
import React from "react";
import { Routes, Route } from "react-router-dom";
import Login from "./pages/Login/Login";
import NicknamePopup from "./pages/NickName/NicknamePopup";
import MainPage from "./pages/Main/MainPage";
import WaitingRoom from "./pages/WaitingRoom/WaitingRoom";
import MyPage from "./pages/MyPage/MyPage";
import BattleRoom from "./pages/BattleRoom/BattleRoom";
import ResultRoom from "./pages/ResultRoom/ResultRoom";
import WebSocketLayout from "./pages/WebSocket/WebSocketLayout";
import AuthProvider from "./pages/AuthContext/AuthContext"; // AuthProvider 임포트

const Router = () => {
  return (
    <Routes>
      {/* 로그인 화면은 ContextAPI로 감싸지 않습니다. */}
      <Route path="/" element={<Login />} />

      {/* 로그인 화면을 제외한 모든 경로를 AuthProvider로 감쌉니다. */}
      <Route element={<AuthProvider />}>
        <Route path="/nickname" element={<NicknamePopup />} />
        <Route path="/mainpage" element={<MainPage />} />
        <Route path="/myPage" element={<MyPage />} />

        {/* WebSocket이 필요한 라우트들을 WebSocketProvider로 감쌉니다. */}
        <Route element={<WebSocketLayout />}>
          <Route path="/waitingRoom/:roomId" element={<WaitingRoom />} />
          <Route path="/gamepage/:roomId" element={<BattleRoom />} />
          <Route path="/resultpage/:roomId" element={<ResultRoom />} />
        </Route>
      </Route>
    </Routes>
  );
};

export default Router;