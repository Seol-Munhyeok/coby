// src/App.js
import React, { useEffect } from 'react';
import { Outlet } from 'react-router-dom'; // useBlocker 제거

const App = () => {

  // 우클릭 방지 로직 (기존과 동일)
  useEffect(() => {
    const handleContextMenu = (e) => e.preventDefault();
    document.addEventListener('contextmenu', handleContextMenu);
    return () => document.removeEventListener('contextmenu', handleContextMenu);
  }, []);

  return (
    <Outlet /> 
  );
};

export default App;