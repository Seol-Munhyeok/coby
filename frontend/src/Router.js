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

const Router = () => {
  return (
    <Routes>
      {/* WebSocket이 필요 없는 라우트들 */}
      <Route path="/" element={<Login />} />
      <Route path="/nickname" element={<NicknamePopup />} />
      <Route path="/mainpage" element={<MainPage />} />
      <Route path="/myPage" element={<MyPage />} />

      {/* WebSocket이 필요한 라우트들을 WebSocketProvider로 감쌉니다. */}
      {/* 이 라우트들 사이를 이동할 때 WebSocket 연결이 유지됩니다. */}
      <Route element={<WebSocketLayout />}>
        <Route path="/waitingRoom/:roomId" element={<WaitingRoom />} />
        <Route path="/gamepage/:roomId" element={<BattleRoom />} />
        <Route path="/resultpage/:roomId" element={<ResultRoom />} />
      </Route>
    </Routes>
  );
};

export default Router;