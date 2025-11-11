import React, { useContext, useEffect, useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
// 1. AuthContext를 임포트합니다. (파일 경로는 실제 위치에 맞게 조정하세요)
import { AuthContext } from './AuthContext/AuthContext'; 

/**
 * URL 직접 접근을 막고, 인증 상태에 따라 다른 페이지로 리디렉션합니다.
 * alert 알림을 띄웁니다.
 */
function DirectAccessProtection() {
  // 2. AuthContext에서 인증 상태(로그인 여부)를 가져옵니다.
  //    (제공되는 변수명이 isAuthenticated가 아니라면 맞게 수정해주세요)
  const { isAuthenticated } = useContext(AuthContext); 
  
  const [redirectPath, setRedirectPath] = useState(null);

  useEffect(() => {
    // 세션 스토리지에서 '정상 접근' 플래그 확인
    const isValid = sessionStorage.getItem('isValidNavigation');

    if (!isValid) {
      // 플래그가 없는 'URL 직접 접근'인 경우
      if (isAuthenticated) {
        // 3. 인증된 사용자(로그인함)
        alert("잘못된 접근입니다. 메인 페이지로 이동합니다.");
        setRedirectPath("/mainpage");
      } else {
        // 4. 인증되지 않은 사용자(로그인 안 함)
        alert("잘못된 접근입니다. 로그인 페이지로 이동합니다.");
        setRedirectPath("/");
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]); // 컴포넌트 마운트 시 인증 상태를 기반으로 한 번만 체크

  // 5. 리디렉션 경로가 설정되었다면 해당 경로로 즉시 이동
  if (redirectPath) {
    return <Navigate to={redirectPath} replace />;
  }

  // 6. 정상 접근이거나(isValid=true) 아직 체크 중일 때
  //    (isValid가 true이면 useEffect가 실행되지 않아 redirectPath가 null로 유지됨)
  //    자식 컴포넌트(WebSocketLayout 등)를 렌더링
  return <Outlet />;
}

export default DirectAccessProtection;