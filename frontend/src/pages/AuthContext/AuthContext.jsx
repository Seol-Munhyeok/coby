// src/contexts/AuthContext.js
import React, { createContext, useState, useEffect, useContext } from "react";
import { useNavigate, useLocation } from "react-router-dom";

export const AuthContext = createContext(null);

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null); // 사용자 정보를 저장
  const [loading, setLoading] = useState(true); // 로딩 상태 관리
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch(`${process.env.REACT_APP_API_URL}/api/users/me`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
        });
    
        if (!response.ok) {
          // HTTP 상태 코드가 200번대가 아니면 에러로 간주
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const userData = await response.json();
        setUser(userData);

        // 닉네임이 null이라면 /nickname 페이지에 머무르게 합니다.
        if (userData.nickname === null && location.pathname !== "/nickname") {
          navigate("/nickname");
        } 
        // 닉네임이 존재한다면 /mainpage로 이동시킵니다.
        else if (userData.nickname !== null && location.pathname === "/nickname") {
          navigate("/mainpage");
        }
      } catch (error) {
        console.error("사용자 정보를 가져오는 데 실패했습니다:", error);
        // API 요청 실패 시 (예: 인증되지 않은 사용자), 로그인 페이지로 리디렉션
        // navigate("/"); 개발중 주석처리
      } finally {
        setLoading(false);
      }
    };

    // 새로고침 시 context의 데이터가 없어지는 것을 이용하여,
    // /nickname 페이지가 아님에도 context 정보가 없다면 그냥 /로 이동시킴
    // 단, 처음 로드 시에는 API 요청을 통해 사용자 정보를 가져와야 하므로 이 조건은 나중에 처리합니다.
    //개발중 주석처리
    // if (!user && location.pathname !== "/nickname" && !loading) {
    //     navigate("/");
    //     return;
    // }

    // `user` 상태가 비어있고, 로딩 중이 아닐 때만 사용자 정보를 가져옵니다.
    // 이는 불필요한 API 호출을 방지하고, 초기 로드 시에만 실행되도록 합니다.
    if (!user && loading) {
        fetchUser();
    }
  }, [user, navigate, location.pathname, loading]);

  // 로딩 중일 때는 아무것도 렌더링하지 않거나 로딩 스피너를 보여줄 수 있습니다.
  if (loading) {
    return <div className="nick-loading-overlay-centered">
                    <div className="nick-loading-spinner"></div>
                    <p className="nick-loading-text">사용자 정보를 확인 중입니다...</p>
                </div>;
  }

  return (
    <AuthContext.Provider value={{ user, setUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;

// Context 값을 사용하기 위한 커스텀 훅
export const useAuth = () => {
  return useContext(AuthContext);
};