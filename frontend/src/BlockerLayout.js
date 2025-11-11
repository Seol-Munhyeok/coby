import React, { useEffect } from 'react';
import { Outlet, useBlocker } from 'react-router-dom'; 

const BlockerLayout = () => {
  
  // --- 1. SPA 내부 뒤로가기 방지 (navigate, <Link> 사용 후) ---
  // (브라우저 뒤로가기 'POP' 액션만 차단)
  const blocker = useBlocker(({ historyAction }) => {
    return historyAction === 'POP';
  });

//   useEffect(() => {
//     // 'blocked' 상태일 때 (POP 액션 감지 시)
//     if (blocker.state === 'blocked') {
//       if (window.confirm('정말 뒤로 가시겠습니까?')) {
//         blocker.proceed(); // "확인": 이동 허용
//       } else {
//         blocker.reset(); // "취소": 이동 차단
//       }
//     }
//   }, [blocker]);

    useEffect(() => {
        // 'blocked' 상태일 때 (POP 액션 감지 시)
        if (blocker.state === 'blocked') {
            // 'confirm' 창 없이 즉시 뒤로가기를 차단(reset)합니다.
            blocker.reset(); // "취소": 이동 차단
        }
    }, [blocker]);

  // 자식 라우트(모든 페이지)를 렌더링합니다.
  return <Outlet />;
};

export default BlockerLayout;
