// src/Router.js
import React from "react";
import { Routes, Route } from "react-router-dom";
import Login from "./pages/Login/Login";
import NicknamePopup from "./pages/NickName/NicknamePopup";
import MainPage from "./pages/Main/MainPage";
import WaitingRoom from "./pages/WaitingRoom/WaitingRoom";
import BattleRoom from "./pages/BattleRoom/BattleRoom";
import ResultRoom from "./pages/ResultRoom/ResultRoom";
import WebSocketLayout from "./pages/WebSocket/WebSocketLayout";
import AuthLayout from "./pages/AuthContext/AuthLayout";
import DirectAccessProtection from "./pages/DirectAccessProtection";

const Router = () => {
  return (
    <Routes>
      {/* 로그인 화면은 ContextAPI로 감싸지 않습니다. */}
      <Route path="/" element={<Login />} />

      {/* 로그인 화면을 제외한 모든 경로를 AuthProvider로 감쌉니다. */}
      <Route element={<AuthLayout />}>
        <Route path="/nickname" element={<NicknamePopup />} />
        <Route path="/mainpage" element={<MainPage />} />

        {/* URL 직접 접근을 막고 싶은 라우트들을 DirectAccessProtection으로 감쌉니다. */}
        <Route element={<DirectAccessProtection />}>
          {/* WebSocket이 필요한 라우트들을 WebSocketProvider로 감쌉니다. */}
          <Route element={<WebSocketLayout />}>
            <Route path="/waitingRoom/:roomId" element={<WaitingRoom />} />
            <Route path="/gamepage/:roomId" element={<BattleRoom />} />
            <Route path="/resultpage/:roomId" element={<ResultRoom />} />
          </Route>
        </Route>
      </Route>
    </Routes>
  );
};

export default Router;