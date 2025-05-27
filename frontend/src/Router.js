import React from "react";
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Main from "./pages/Main/Main";
// import Login from "./pages/다른경로";


const Router = () => {

  return (
    <Routes>
      <Route path="/" element={<Main />} />
      {/* <Route path="/URL상 경로" element={<TEST />} /> */}
    </Routes>
  );
};

export default Router;