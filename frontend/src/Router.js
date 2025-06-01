import React from "react";
import { Routes, Route } from "react-router-dom";
// import Main from "./pages/Main/Main";
import Login from "./pages/Login/Login";
import NicknamePopup from "./pages/NickName/NicknamePopup";
import MainPage from "./pages/Main/MainPage";
import WaitingRoom from "./pages/WaitingRoom/WaitingRoom";
import MyPage from "./pages/MyPage/MyPage";


const Router = () => {

  return (
    <Routes>
      <Route path="/" element={<Login />} />
      {/* <Route path="/URL상 경로" element={<TEST />} /> */}
      <Route path="/nickname" element={<NicknamePopup />}/>
      <Route path="/mainpage" element={<MainPage />}/>
      <Route path="/waitingRoom" element={<WaitingRoom />}/>      
      <Route path="/myPage" element={<MyPage />}/>      


    </Routes>
  );
};

export default Router;