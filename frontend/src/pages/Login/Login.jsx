import React, { useState, useEffect } from 'react';
import './Login.css';

const Login = () => {
  const [typingComplete, setTypingComplete] = useState(false);
  const [backgroundLines, setBackgroundLines] = useState([]);

  // 배경 코드 생성
  useEffect(() => {
    const codeSnippets = [
    "function helloWorld() { console.log('Hello, World!'); }",
    "const app = express();",
    "import React, { useState } from 'react';",
    "class User { constructor(name) { this.name = name; } }",
    "SELECT * FROM users WHERE active = true;",
    "git commit -m 'Initial commit'",
    "npm install --save-dev",
    "docker-compose up -d",
    "for (let i = 0; i < array.length; i++) { }",
    "addEventListener('click', () => { })",
    "async function fetchData() { const res = await fetch('/api'); }",
    "const sum = (a, b) => a + b;",
    "try { throw new Error('Oops!') } catch (e) { console.error(e) }",
    "export default function App() { return <div>Hello</div>; }",
    "<div className='container'>{children}</div>",
    "const [count, setCount] = useState(0);",
    "useEffect(() => { document.title = `Count: ${count}`; });",
    "map(item => <li key={item.id}>{item.name}</li>)",
    "@media (max-width: 768px) { .container { padding: 1rem; } }",
    "python -m venv env && source env/bin/activate"
  ];
  
    const lines = [];
    for (let i = 0; i < 40; i++) {
      const colors = [
        'rgba(30, 58, 138, 0.3)', 
        'rgba(37, 99, 235, 0.3)', 
        'rgba(79, 70, 229, 0.3)', 
        'rgba(124, 58, 237, 0.3)'
      ];
      
      lines.push({
        id: i,
        text: codeSnippets[Math.floor(Math.random() * codeSnippets.length)],
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * 100}%`,
        fontSize: `${Math.random() * 1.0 + 1.0}rem`,
        animationDelay: `${Math.random() * 15}s`,
        animationDuration: `${Math.random() * 20 + 20}s`,
        color: colors[Math.floor(Math.random() * colors.length)]
      });
    }
    setBackgroundLines(lines);
  }, []);

  // 타이핑 애니메이션
  const TypingText = () => {
    const [displayText, setDisplayText] = useState('');
    const text = 'Hello, World!';
    const colors = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981'];

    useEffect(() => {
      let charIndex = 0;
      const typingInterval = setInterval(() => {
        if (charIndex < text.length) {
          setDisplayText(text.substring(0, charIndex + 1));
          charIndex++;
        } else {
          clearInterval(typingInterval);
          setTimeout(() => setTypingComplete(true), 500);
        }
      }, 150);

      return () => clearInterval(typingInterval);
    }, []);

    return (
      <div className="typing-text">
        {displayText.split('').map((char, index) => (
          <span
            key={index}
            className="char animated-char"
            style={{ 
              color: colors[Math.floor(Math.random() * colors.length)],
              animationDelay: `${index * 0.1}s`
            }}
          >
            {char}
          </span>
        ))}
      </div>
    );
  };

  const handleGoogleLogin = () => {
    // Google 로그인 로직
    console.log('Google 로그인');
  };

  const handleKakaoLogin = () => {
    // 카카오 로그인 로직
    console.log('카카오 로그인');
  };

  const handleGithubLogin = () => {
    // GitHub 로그인 로직
    console.log('GitHub 로그인');
  };

  // const handleNicknameRedirect = () => {
  //   // 닉네임 페이지로 이동
  //   window.location.href = '2-nickname.html'; // 나중에 변경
  // };

  return (
    <div className="login-page">
      {/* 배경 코드 텍스트 */}
      <div className="code-bg">
        {backgroundLines.map((line) => (
          <div
            key={line.id}
            className="code-line"
            style={{
              left: line.left,
              top: line.top,
              fontSize: line.fontSize,
              animationDelay: line.animationDelay,
              animationDuration: line.animationDuration,
              color: line.color
            }}
          >
            {line.text}
          </div>
        ))}
      </div>

      <div className="container">
        {/* 타이핑 애니메이션 텍스트 */}
        <TypingText />

        {/* 로그인 컨테이너 */}
        <div className={`login-container ${typingComplete ? 'visible' : ''}`}>
          <div className="login-content">
            <div className="logo-section">
              <img src="./그림1.png" width="300" height="300" alt="Logo" />
            </div>

            <div className="button-section">
              <button 
                className="social-btn google-btn"
                onClick={handleGoogleLogin}
              >
                <svg className="btn-icon" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"></path>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"></path>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"></path>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"></path>
                </svg>
                Google 로그인
              </button>

              <button 
                className="social-btn kakao-btn"
                onClick={handleKakaoLogin}
              >
                <svg className="btn-icon" viewBox="0 0 24 24" fill="none">
                  <path d="M12 3C7.03 3 3 6.14 3 10C3 12.08 4.02 13.97 5.72 15.28C5.67 15.72 5.4 16.98 5.16 17.82C4.9 18.67 4.68 19.29 4.68 19.31C4.57 19.55 4.65 19.84 4.87 20C4.98 20.08 5.11 20.12 5.24 20.12C5.37 20.12 5.5 20.08 5.61 20C5.62 20.01 6.97 19.26 7.86 18.73C9.14 19.27 10.53 19.58 12 19.58C16.97 19.58 21 16.44 21 12.58C21 8.72 16.97 3 12 3Z" fill="currentColor"></path>
                </svg>
                카카오 로그인
              </button>

              <button 
                className="social-btn github-btn"
                onClick={handleGithubLogin}
              >
                <svg className="btn-icon" viewBox="0 0 24 24" fill="white">
                  <path d="M12 2C6.477 2 2 6.477 2 12C2 16.418 4.865 20.166 8.84 21.49C9.34 21.58 9.52 21.27 9.52 21C9.52 20.77 9.51 20.14 9.51 19.31C6.73 19.91 6.14 17.97 6.14 17.97C5.68 16.81 5.03 16.5 5.03 16.5C4.12 15.88 5.1 15.9 5.1 15.9C6.1 15.97 6.63 16.93 6.63 16.93C7.5 18.45 8.97 18 9.54 17.76C9.63 17.11 9.89 16.67 10.17 16.42C7.95 16.17 5.62 15.31 5.62 11.5C5.62 10.39 6 9.5 6.65 8.79C6.55 8.54 6.2 7.5 6.75 6.15C6.75 6.15 7.59 5.88 9.5 7.17C10.29 6.95 11.15 6.84 12 6.84C12.85 6.84 13.71 6.95 14.5 7.17C16.41 5.88 17.25 6.15 17.25 6.15C17.8 7.5 17.45 8.54 17.35 8.79C18 9.5 18.38 10.39 18.38 11.5C18.38 15.32 16.04 16.16 13.81 16.41C14.17 16.72 14.5 17.33 14.5 18.26C14.5 19.6 14.49 20.68 14.49 21C14.49 21.27 14.67 21.59 15.17 21.49C19.14 20.16 22 16.42 22 12C22 6.477 17.523 2 12 2Z"></path>
                </svg>
                GitHub 로그인
              </button>
            </div>
          </div>

          <div className="footer-info">
            <p>Team 404</p>
            <p>404@test.com</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;