import React, { useState, useEffect, useRef } from 'react';
import './NicknamePopup.css';
import { useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie'
import { useUserStore } from '../../store/userStore'

const NicknameSetup = () => {
  const navigate = useNavigate();

  const [nickname, setNickname] = useState('');
  const [isNicknameValid, setIsNicknameValid] = useState(false);
  const [isNicknameChecked, setIsNicknameChecked] = useState(false);
  const [isCheckingDuplicate, setIsCheckingDuplicate] = useState(false);
  const [hintMessage, setHintMessage] = useState('2~12자 이내로 입력해주세요.');
  const [hintClass, setHintClass] = useState('text-xs text-purple-300 mt-1');
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('info');
  const [showToast, setShowToast] = useState(false);

  const starsRef = useRef(null);
  const starBurstRef = useRef(null);
  const robotRef = useRef(null);


  // 별 생성 함수
  const createStars = () => {
    if (!starsRef.current) return;

    const container = starsRef.current;
    const count = 100;

    // 기존 별들 제거
    container.innerHTML = '';

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

  // 별 뿌리기 효과
  const createStarBurst = (x, y) => {
    if (!starBurstRef.current) return;

    const container = starBurstRef.current;
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
        if (star.parentNode) {
          star.remove();
        }
      }, duration * 1000);
    }
  };

  // 로봇 애니메이션
  const animateRobot = (emotion = 'happy') => {
    if (!robotRef.current) return;

    const robotHead = robotRef.current.querySelector('.robot-head');
    const robotBody = robotRef.current.querySelector('.robot-body');
    const robotMouth = robotRef.current.querySelector('.robot-mouth');

    if (emotion === 'happy') {
      robotHead.style.transform = 'translateX(-50%) scale(1.1)';
      robotBody.style.background = '#f472b6';
      robotMouth.style.height = '15px';
      robotMouth.style.borderRadius = '5px 5px 10px 10px';
    } else if (emotion === 'sad') {
      robotHead.style.transform = 'translateX(-50%) scale(0.95)';
      robotBody.style.background = '#64748b';
      robotMouth.style.height = '15px';
      robotMouth.style.borderRadius = '10px 10px 5px 5px';
    } else if (emotion === 'thinking') {
      robotHead.style.transform = 'translateX(-50%) rotate(5deg)';
      robotBody.style.background = '#38bdf8';
      robotMouth.style.height = '5px';
      robotMouth.style.width = '20px';
      robotMouth.style.borderRadius = '5px';
    }

    // 원래 상태로 복귀
    setTimeout(() => {
      robotHead.style.transform = 'translateX(-50%) scale(1)';
      robotBody.style.background = '#8b5cf6';
      robotMouth.style.height = '10px';
      robotMouth.style.width = '30px';
      robotMouth.style.borderRadius = '5px';
    }, 800);
  };

  // 토스트 메시지 표시
  const displayToast = (message, type = 'info') => {
    setToastMessage(message);
    setToastType(type);
    setShowToast(true);

    setTimeout(() => {
      setShowToast(false);
    }, 3000);
  };

  // 닉네임 유효성 검사
  const validateNickname = (nickname) => {
    // 길이 검사 (2~12자)
    if (nickname.length < 2 || nickname.length > 12) {
      return {
        valid: false,
        message: '닉네임은 2~12자 이내로 입력해주세요.'
      };
    }

    // 허용된 문자만 사용 (한글, 영문, 숫자)
    const regex = /^[가-힣a-zA-Z0-9]+$/;
    if (!regex.test(nickname)) {
      return {
        valid: false,
        message: '한글, 영문, 숫자만 사용 가능합니다.'
      };
    }

    // 금지어 목록 (예시)
    const bannedWords = ['admin', '운영자', '관리자', '비속어', '욕설'];
    for (const word of bannedWords) {
      if (nickname.toLowerCase().includes(word)) {
        return {
          valid: false,
          message: '사용할 수 없는 단어가 포함되어 있습니다.'
        };
      }
    }

    return {
      valid: true,
      message: '사용 가능한 닉네임입니다.'
    };
  };

  // 중복 확인 (모의)
  const checkNicknameDuplicate = (nickname) => {
    // 모의 중복 닉네임 목록
    const duplicateNames = ['coby', 'admin', 'test', 'user', 'player1'];

    // 0.5초 후 결과 반환 (비동기 API 호출 모의)
    return new Promise((resolve) => {
      setTimeout(() => {
        const isDuplicate = duplicateNames.includes(nickname.toLowerCase());
        resolve({
          available: !isDuplicate,
          message: isDuplicate ? '이미 사용 중인 닉네임입니다.' : '사용 가능한 닉네임입니다.'
        });
      }, 500);
    });
  };

  // 닉네임 입력 핸들러
  const handleNicknameChange = (e) => {
    const value = e.target.value.trim();
    setNickname(value);

    // 유효성 검사
    const validation = validateNickname(value);

    if (value.length === 0) {
      setHintMessage('2~12자 이내로 입력해주세요.');
      setHintClass('text-xs text-purple-300 mt-1');
    } else {
      setHintMessage(validation.message);

      if (validation.valid) {
        setHintClass('text-xs text-green-400 mt-1');
        setIsNicknameValid(true);
      } else {
        setHintClass('text-xs text-red-400 mt-1');
        setIsNicknameValid(false);
      }
    }

    // 입력값이 변경되면 중복 확인 상태 초기화
    setIsNicknameChecked(false);
  };

  // 중복 확인 핸들러
  const handleCheckDuplicate = async () => {
    if (!isNicknameValid) {
      displayToast('유효하지 않은 닉네임입니다.', 'error');
      animateRobot('sad');
      return;
    }

    setIsCheckingDuplicate(true);
    animateRobot('thinking');

    try {
      const result = await checkNicknameDuplicate(nickname);

      if (result.available) {
        displayToast('사용 가능한 닉네임입니다.', 'success');
        setHintMessage('사용 가능한 닉네임입니다.');
        setHintClass('text-xs text-green-400 mt-1');
        setIsNicknameChecked(true);
        animateRobot('happy');

        // 별 뿌리기 효과
        const nicknameInput = document.getElementById('nickname');
        if (nicknameInput) {
          const rect = nicknameInput.getBoundingClientRect();
          createStarBurst(rect.right, rect.top + rect.height / 2);
        }
      } else {
        displayToast(result.message, 'error');
        setHintMessage(result.message);
        setHintClass('text-xs text-red-400 mt-1');
        setIsNicknameChecked(false);
        animateRobot('sad');
      }
    } catch (error) {
      displayToast('중복 확인 중 오류가 발생했습니다.', 'error');
      animateRobot('sad');
    } finally {
      setIsCheckingDuplicate(false);
    }
  };

  // 완료 버튼 핸들러
  const handleSubmit = () => {
    if (!isNicknameValid || !isNicknameChecked) {
      displayToast('닉네임 중복 확인이 필요합니다.', 'error');
      animateRobot('sad');
      return;
    }
  
    // 로봇 애니메이션
    animateRobot('happy');
  
    // 별 뿌리기 효과
    if (robotRef.current) {
      const robotHead = robotRef.current.querySelector('.robot-head');
      const rect = robotHead.getBoundingClientRect();
      createStarBurst(rect.left + rect.width / 2, rect.top + rect.height / 2);
    }
  
    // 완료 처리
    displayToast(`${nickname}님, 환영합니다!`, 'success');
  
    Cookies.set('nickname', nickname, { expires: 1 }) // 1일 유지

    // 다음 페이지로 이동
    setTimeout(() => {
      navigate('/mainpage');
    }, 1500); // 1.5초 후 페이지 이동
  };

  // 로봇 클릭 핸들러
  const handleRobotClick = () => {
    animateRobot('happy');

    // 별 뿌리기 효과
    if (robotRef.current) {
      const robotHead = robotRef.current.querySelector('.robot-head');
      const rect = robotHead.getBoundingClientRect();
      createStarBurst(rect.left + rect.width / 2, rect.top + rect.height / 2);
    }
  };

  // 컴포넌트 마운트 시 별 생성
  useEffect(() => {
    createStars();
  }, []);

  return (
    <div className="min-h-screen bg-[#0f172a] relative overflow-hidden">
      {/* 배경 별 */}
      <div className="bg-stars" ref={starsRef}></div>

      {/* 구름 효과 */}
      <div className="cloud" style={{ width: '300px', height: '300px', top: '10%', left: '5%' }}></div>
      <div className="cloud" style={{ width: '200px', height: '200px', bottom: '10%', right: '5%' }}></div>
      <div className="cloud" style={{ width: '250px', height: '250px', top: '60%', left: '15%' }}></div>

      {/* 별 뿌리기 효과 컨테이너 */}
      <div ref={starBurstRef}></div>

      {/* 토스트 메시지 */}
      <div
        className={`toast-message ${showToast ? 'show' : ''} ${toastType === 'error' ? 'error' : toastType === 'success' ? 'success' : ''}`}
      >
        {toastMessage}
      </div>

      {/* 메인 컨테이너 */}
      <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12 relative">
        {/* 로고 및 헤더 */}
        <div className="text-center mb-6 relative z-10">
          <div className="game-logo korean-font">
            COBY
            <div className="logo-badge">BETA</div>
          </div>
          <p className="text-purple-300 mt-1">Coding Online Battle with You</p>
        </div>

        {/* 로봇 캐릭터 */}
        <div className="robot mb-6" ref={robotRef} onClick={handleRobotClick}>
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

        {/* 닉네임 설정 카드 */}
        <div className="nickname-container w-full max-w-md p-8 rounded-3xl">
          {/* 닉네임 설정 제목 */}
          <div className="title-container">
            <h2 className="nickname-title text-xl sm:text-2xl font-bold korean-font">
              COBY에서 사용할 닉네임을 설정해주세요
            </h2>
          </div>

          {/* 닉네임 입력 폼 */}
          <div className="space-y-6 form-content">
            <div>
              <label htmlFor="nickname" className="block text-sm font-medium text-purple-300 mb-2">
                닉네임
              </label>
              <div className="flex gap-3">
                <input
                  type="text"
                  id="nickname"
                  className="input-field flex-1"
                  placeholder="사용할 닉네임을 입력하세요"
                  maxLength="12"
                  value={nickname}
                  onChange={handleNicknameChange}
                />
                <button
                  className="check-btn btn-click-effect whitespace-nowrap"
                  onClick={handleCheckDuplicate}
                  disabled={!isNicknameValid || isCheckingDuplicate}
                >
                  {isCheckingDuplicate ? '확인 중...' : '중복확인'}
                </button>
              </div>
              <p className={hintClass}>{hintMessage}</p>
            </div>

            {/* 닉네임 생성 정책 */}
            <div className="bg-slate-800 bg-opacity-50 p-4 rounded-xl">
              <h3 className="text-sm font-semibold text-purple-300 mb-2">닉네임 생성 정책</h3>
              <ul className="policy-list">
                <li>2~12자 이내의 한글, 영문, 숫자만 사용 가능합니다.</li>
                <li>욕설, 비속어, 성적인 표현이 포함된 닉네임은 사용할 수 없습니다.</li>
                <li>타인을 사칭하거나 혐오를 조장하는 닉네임은 제한됩니다.</li>
                <li>개인정보(전화번호, 주소 등)가 포함된 닉네임은 사용할 수 없습니다.</li>
                <li>운영정책에 위배되는 닉네임은 임의로 변경될 수 있습니다.</li>
              </ul>
            </div>

            {/* 완료 버튼 */}
            <div className="pt-2">
              <button
                className="game-btn btn-click-effect w-full"
                onClick={handleSubmit}
                disabled={!isNicknameValid || !isNicknameChecked}
              >
                완료
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NicknameSetup;