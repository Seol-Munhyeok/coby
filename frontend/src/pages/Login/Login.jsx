import React, { useEffect, useRef } from 'react';
import './Login.css';
import { useNavigate } from 'react-router-dom';

const CobyLoginPage = () => {
  const navigate = useNavigate();
  const starsRef = useRef(null);
  const bubblesRef = useRef(null);
  const starBurstRef = useRef(null);
  const codeParticlesRef = useRef(null);
  const enterRoomBtn1 = () => {
    alert('닉네임 입력페이지로 이동합니다');
    navigate('/nickname');
  };  // 별 생성
  const createStars = () => {
    const container = starsRef.current;
    if (!container) return;

    const count = 100;

    for (let i = 0; i < count; i++) {
      const star = document.createElement('div');
      star.classList.add('star');

      // 랜덤 크기
      const size = Math.random() * 3 + 1;
      star.style.width = `${size}px`;
      star.style.height = `${size}px`;

      // 랜덤 위치
      star.style.left = `${Math.random() * 100}%`;
      star.style.top = `${Math.random() * 100}%`;

      // 랜덤 깜빡임
      const duration = Math.random() * 3 + 2;
      star.style.animation = `blink ${duration}s infinite alternate`;

      container.appendChild(star);
    }
  };

  // 버블 생성
  const createBubbles = () => {
    const container = bubblesRef.current;
    if (!container) return;

    const count = 20;

    for (let i = 0; i < count; i++) {
      setTimeout(() => {
        const bubble = document.createElement('div');
        bubble.classList.add('bubble');

        // 랜덤 크기
        const size = Math.random() * 30 + 10;
        bubble.style.width = `${size}px`;
        bubble.style.height = `${size}px`;

        // 랜덤 위치
        bubble.style.left = `${Math.random() * 100}%`;
        bubble.style.bottom = '0';

        // 랜덤 애니메이션 지연
        const delay = Math.random() * 10;
        const duration = Math.random() * 10 + 10;
        bubble.style.animation = `rise ${duration}s ${delay}s infinite linear`;

        container.appendChild(bubble);
      }, i * 1000);
    }
  };

  // 별 뿌리기 효과
  const createStarBurst = (x, y) => {
    const container = starBurstRef.current;
    if (!container) return;

    const count = 20;

    for (let i = 0; i < count; i++) {
      const star = document.createElement('div');
      star.classList.add('star-burst');

      // 위치 설정
      star.style.left = `${x}px`;
      star.style.top = `${y}px`;

      // 랜덤 방향
      const angle = Math.random() * Math.PI * 2;
      const distance = Math.random() * 100 + 50;
      const tx = Math.cos(angle) * distance;
      const ty = Math.sin(angle) * distance;

      star.style.setProperty('--tx', `${tx}px`);
      star.style.setProperty('--ty', `${ty}px`);

      // 랜덤 색상
      const colors = ['#8b5cf6', '#f472b6', '#38bdf8', '#f9a8d4', '#ffffff'];
      star.style.background = colors[Math.floor(Math.random() * colors.length)];

      // 랜덤 크기
      const size = Math.random() * 6 + 2;
      star.style.width = `${size}px`;
      star.style.height = `${size}px`;

      // 애니메이션
      const duration = Math.random() * 0.5 + 0.5;
      star.style.animation = `burst ${duration}s forwards`;

      container.appendChild(star);

      // 애니메이션 종료 후 제거
      setTimeout(() => {
        star.remove();
      }, duration * 1000);
    }
  };

  // 코드 파티클 생성
  const createCodeParticles = (x, y) => {
    const container = codeParticlesRef.current;
    if (!container) return;

    const count = 8;
    const codeSymbols = ['{ }', '< >', '[ ]', '( )', '//', '/*', '*/', ';;', '==', '++', '--', '=>', '&&', '||'];

    for (let i = 0; i < count; i++) {
      const particle = document.createElement('div');
      particle.classList.add('code-particle');

      // 랜덤 코드 심볼
      particle.textContent = codeSymbols[Math.floor(Math.random() * codeSymbols.length)];

      // 위치 설정
      particle.style.left = `${x}px`;
      particle.style.top = `${y}px`;

      // 랜덤 회전
      const rotate = Math.random() * 360 - 180;
      particle.style.setProperty('--rotate', `${rotate}deg`);

      // 랜덤 색상
      const colors = ['#8b5cf6', '#f472b6', '#38bdf8', '#f9a8d4', '#ffffff'];
      particle.style.color = colors[Math.floor(Math.random() * colors.length)];

      // 애니메이션
      const duration = Math.random() * 1 + 1;
      particle.style.animation = `float-up ${duration}s forwards`;

      container.appendChild(particle);

      // 애니메이션 종료 후 제거
      setTimeout(() => {
        particle.remove();
      }, duration * 1000);
    }
  };

  // 로봇 애니메이션
  const animateRobot = () => {
    const robotHead = document.querySelector('.robot-head');
    const robotBody = document.querySelector('.robot-body');
    const robotMouth = document.querySelector('.robot-mouth');

    // 머리 애니메이션
    if (robotHead) robotHead.style.transform = 'translateX(-50%) scale(1.1)';

    // 몸체 색상 변경
    if (robotBody) robotBody.style.background = '#f472b6';

    // 입 애니메이션
    if (robotMouth) {
      robotMouth.style.height = '15px';
      robotMouth.style.borderRadius = '5px 5px 10px 10px';
    }

    // 코드 파티클 생성
    if (robotHead) {
      const rect = robotHead.getBoundingClientRect();
      createCodeParticles(rect.left + rect.width / 2, rect.top);
    }

    // 원래 상태로 복귀
    setTimeout(() => {
      if (robotHead) robotHead.style.transform = 'translateX(-50%) scale(1)';
      if (robotBody) robotBody.style.background = '#8b5cf6';
      if (robotMouth) {
        robotMouth.style.height = '10px';
        robotMouth.style.borderRadius = '5px';
      }
    }, 500);
  };

  // 소셜 로그인 처리 함수
  const handleSocialLogin = (provider) => {
    const buttons = document.querySelectorAll('.social-btn');
    buttons.forEach(btn => {
      btn.classList.add('opacity-50');
      btn.disabled = true;
    });

    // 로봇 애니메이션
    animateRobot();

    // 별 뿌리기 효과
    const robotHead = document.querySelector('.robot-head');
    if (robotHead) {
      const rect = robotHead.getBoundingClientRect();
      createStarBurst(rect.left + rect.width / 2, rect.top + rect.height / 2);
    }

    setTimeout(() => {
      alert(`${provider} 로그인 성공! COBY 코딩 대결에 오신 것을 환영합니다!`);
      buttons.forEach(btn => {
        btn.classList.remove('opacity-50');
        btn.disabled = false;
      });
    }, 800);
  };

  // 프로그래밍 언어 로고 클릭 처리
  const handleLogoClick = (e) => {
    e.currentTarget.style.transform = 'scale(1.2) rotate(15deg)';
    createStarBurst(e.clientX, e.clientY);

    setTimeout(() => {
      e.currentTarget.style.transform = '';
    }, 500);
  };

  // 로봇 클릭 처리
  const handleRobotClick = () => {
    animateRobot();

    // 별 뿌리기 효과
    const robotHead = document.querySelector('.robot-head');
    if (robotHead) {
      const rect = robotHead.getBoundingClientRect();
      createStarBurst(rect.left + rect.width / 2, rect.top + rect.height / 2);
    }
  };

  useEffect(() => {
    createStars();
    createBubbles();
  }, []);

  return (
    <div className='login'>
      <div className="min-h-screen bg-[#0f172a] relative overflow-hidden">        {/* 배경 별 */}
        <div className="bg-stars" ref={starsRef}></div>

        {/* 구름 효과 */}
        <div className="cloud" style={{ width: '300px', height: '300px', top: '10%', left: '5%' }}></div>
        <div className="cloud" style={{ width: '200px', height: '200px', bottom: '10%', right: '5%' }}></div>
        <div className="cloud" style={{ width: '250px', height: '250px', top: '60%', left: '15%' }}></div>

        {/* 부유하는 프로그래밍 언어 로고들 */}
        <div className="floating-item" style={{ top: '15%', left: '10%', animationDelay: '0s' }}>
          <svg width="50" height="50" viewBox="0 0 128 128" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path fill="#0074BD" d="M47.617 98.12s-4.767 2.774 3.397 3.71c9.892 1.13 14.947.968 25.845-1.092 0 0 2.871 1.795 6.873 3.351-24.439 10.47-55.308-.607-36.115-5.969zm-2.988-13.665s-5.348 3.959 2.823 4.805c10.567 1.091 18.91 1.18 33.354-1.6 0 0 1.993 2.025 5.132 3.131-29.542 8.64-62.446.68-41.309-6.336z"></path>
            <path fill="#EA2D2E" d="M69.802 61.271c6.025 6.935-1.58 13.17-1.58 13.17s15.289-7.891 8.269-17.777c-6.559-9.215-11.587-13.792 15.635-29.58 0 .001-42.731 10.67-22.324 34.187z"></path>
            <path fill="#0074BD" d="M102.123 108.229s3.529 2.91-3.888 5.159c-14.102 4.272-58.706 5.56-71.094.171-4.451-1.938 3.899-4.625 6.526-5.192 2.739-.593 4.303-.485 4.303-.485-4.953-3.487-32.013 6.85-13.743 9.815 49.821 8.076 90.817-3.637 77.896-9.468zM49.912 70.294s-22.686 5.389-8.033 7.348c6.188.828 18.518.638 30.011-.326 9.39-.789 18.813-2.474 18.813-2.474s-3.308 1.419-5.704 3.053c-23.042 6.061-67.544 3.238-54.731-2.958 10.832-5.239 19.644-4.643 19.644-4.643zm40.697 22.747c23.421-12.167 12.591-23.86 5.032-22.285-1.848.385-2.677.72-2.677.72s.688-1.079 2-1.543c14.953-5.255 26.451 15.503-4.823 23.725 0-.002.359-.327.468-.617z"></path>
            <path fill="#EA2D2E" d="M76.491 1.587S89.459 14.563 64.188 34.51c-20.266 16.006-4.621 25.13-.007 35.559-11.831-10.673-20.509-20.07-14.688-28.815C58.041 28.42 81.722 22.195 76.491 1.587z"></path>
            <path fill="#0074BD" d="M52.214 126.021c22.476 1.437 57-.8 57.817-11.436 0 0-1.571 4.032-18.577 7.231-19.186 3.612-42.854 3.191-56.887.874 0 .001 2.875 2.381 17.647 3.331z"></path>
          </svg>
        </div>

        <div className="floating-item" style={{ top: '70%', left: '85%', animationDelay: '1s' }}>
          <img src="/python-logo.svg" alt="Python Logo" width="50" height="50" />
        </div>
        <div className="floating-item" style={{ top: '30%', left: '80%', animationDelay: '1s' }}>
          <img src="/c++-logo.svg" alt="c++ Logo" width="50" height="50" />
        </div>

        

        <div className="floating-item" style={{ top: '60%', left: '15%', animationDelay: '1.5s' }}>
          <svg width="50" height="50" viewBox="0 0 128 128" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path fill="#F0DB4F" d="M1.408 1.408h125.184v125.185H1.408z"></path>
            <path fill="#323330" d="M116.347 96.736c-.917-5.711-4.641-10.508-15.672-14.981-3.832-1.761-8.104-3.022-9.377-5.926-.452-1.69-.512-2.642-.226-3.665.821-3.32 4.784-4.355 7.925-3.403 2.023.678 3.938 2.237 5.093 4.724 5.402-3.498 5.391-3.475 9.163-5.879-1.381-2.141-2.118-3.129-3.022-4.045-3.249-3.629-7.676-5.498-14.756-5.355l-3.688.477c-3.534.893-6.902 2.748-8.877 5.235-5.926 6.724-4.236 18.492 2.975 23.335 7.104 5.332 17.54 6.545 18.873 11.531 1.297 6.104-4.486 8.08-10.234 7.378-4.236-.881-6.592-3.034-9.139-6.949-4.688 2.713-4.688 2.713-9.508 5.485 1.143 2.499 2.344 3.63 4.26 5.795 9.068 9.198 31.76 8.746 35.83-5.176.165-.478 1.261-3.666.38-8.581zM69.462 58.943H57.753l-.048 30.272c0 6.438.333 12.34-.714 14.149-1.713 3.558-6.152 3.117-8.175 2.427-2.059-1.012-3.106-2.451-4.319-4.485-.333-.584-.583-1.036-.667-1.071l-9.52 5.83c1.583 3.249 3.915 6.069 6.902 7.901 4.462 2.678 10.459 3.499 16.731 2.059 4.082-1.189 7.604-3.652 9.448-7.401 2.666-4.915 2.094-10.864 2.07-17.444.06-10.735.001-21.468.001-32.237z"></path>
          </svg>
        </div>

        {/* 코드 파티클 컨테이너 */}
        <div ref={codeParticlesRef}></div>

        {/* 버블 효과 */}
        <div ref={bubblesRef}></div>

        {/* 메인 컨테이너 */}
        <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12 relative">
          {/* 로고 및 헤더 */}
          <div className="text-center mb-8 relative z-10">
            <div className="game-logo korean-font">
              COBY
              <div className="logo-badge">BETA</div>
            </div>
            <p className="text-purple-300 mt-2">코딩 대결의 세계로 오세요!</p>
          </div>

          {/* 로봇 캐릭터 */}
          <div className="robot mb-6" onClick={handleRobotClick}>
            <div className="robot-antenna"></div>
            <div className="robot-head">
              <div className="robot-face">
                <div className="robot-eyes">
                  <div className="robot-eye"></div>
                  <div className="robot-eye"></div>
                </div>
                <div className="robot-mouth"></div>
              </div>
            </div>
            <div className="robot-body">
              <div className="robot-arm left"></div>
              <div className="robot-arm right"></div>
            </div>
            <div className="robot-leg left"></div>
            <div className="robot-leg right"></div>
            <div className="robot-shadow"></div>
          </div>

          {/* 로그인 카드 */}
          <div className="login-container w-full max-w-md p-8 rounded-3xl">
            <h2 className="text-2xl font-bold text-center mb-6 korean-font">코딩 대결을 시작해볼까요?</h2>

            {/* 소셜 로그인 */}
            <div className="space-y-4">
              <button
                onClick={enterRoomBtn1}
                className="social-btn btn-click-effect w-full bg-white text-gray-800"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                <span>Google로 로그인</span>
              </button>

              <button
                onClick={() => handleSocialLogin('Kakao')}
                className="social-btn btn-click-effect w-full bg-yellow-300 text-gray-800"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
                  <path fillRule="evenodd" clipRule="evenodd" d="M12 4C7.58172 4 4 6.78579 4 10.2c0 2.2049 1.21636 4.1256 3.05426 5.2921-.1982.7396-.6356 2.6549-.7278 3.0654-.1132.5077.1872.5003.3925.3635.1637-.1094 2.5944-1.7471 3.6297-2.4545.5462.0786 1.1148.1235 1.6513.1235 4.4183 0 8-2.7858 8-6.2C20 6.78579 16.4183 4 12 4Z" fill="#3A1D1D" />
                </svg>
                <span>카카오로 로그인</span>
              </button>

              <button
                onClick={() => handleSocialLogin('GitHub')}
                className="social-btn btn-click-effect w-full bg-gray-800 text-white"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                </svg>
                <span>GitHub로 로그인</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
export default CobyLoginPage;
