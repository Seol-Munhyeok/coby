// import logo from './logo.svg';
import React, { useEffect } from 'react';
import Router from './Router'; // Router 컴포넌트가 Router.js에 있다고 가정

const App = () => {
  useEffect(() => {
    const handleContextMenu = (e) => {
      e.preventDefault();
    };

    // document에 'contextmenu' 이벤트 리스너 추가
    document.addEventListener('contextmenu', handleContextMenu);

    // 컴포넌트 언마운트 시 이벤트 리스너 제거
    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
    };
  }, []); // 빈 의존성 배열은 마운트 시 한 번 실행되고 언마운트 시 정리됨을 의미

  return (
    <Router />
  );
};

export default App;