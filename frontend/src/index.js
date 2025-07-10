import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { BrowserRouter } from "react-router-dom";


//캐싱 및 쿠키 제거를 위한 테스트 코드 (F12 콘솔에 resetNickname() 입력)
import { useUserStore } from './store/userStore'
import Cookies from 'js-cookie'

window.resetNickname = () => {
  localStorage.removeItem('nickname')     // 캐시 삭제
  Cookies.remove('nickname')              // 쿠키 삭제
  useUserStore.getState().setNickname('') // 상태 초기화
  console.log('닉네임 정보가 초기화되었습니다.')
}


const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
    <BrowserRouter>
      <App />
    </BrowserRouter>
  );
// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();

