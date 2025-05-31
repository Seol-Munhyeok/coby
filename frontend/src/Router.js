import React from "react";
import { Routes, Route } from "react-router-dom";
// import Main from "./pages/Main/Main";
import Login from "./pages/Login/Login";
import NicknamePopup from "./pages/NickName/NicknamePopup";

const Router = () => {

  return (
    <Routes>
      <Route path="/" element={<Login />} />
      {/* <Route path="/URL상 경로" element={<TEST />} /> */}
      <Route path="/nickname" element={<NicknamePopup />}/>
    
    </Routes>
  );
};

export default Router;