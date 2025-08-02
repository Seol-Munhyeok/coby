import React, { useState, useEffect, useRef } from 'react';
import './MyPage.css';
import { useAuth } from '../AuthContext/AuthContext';

function MyPage() {
  const { user } = useAuth()
  const nickname = user.nickname;
  const [isModalOpen, setIsModalOpen] = useState(false); // State to control modal visibility
  const [tempNickname, setTempNickname] = useState(''); // State to hold the nickname in the modal
  const nicknameInputRef = useRef(null); // Ref for the nickname input field

   // 현재 사용자 닉네임을 가져옵니다.
  const currentUser = nickname || '게스트';

  // Handler to open the modal
  const handleOpenModal = () => {
    setTempNickname(nickname || ''); // Set current nickname to modal input
    setIsModalOpen(true);
    setTimeout(() => {
      if (nicknameInputRef.current) {
        nicknameInputRef.current.focus(); // Focus on the input when modal opens
        nicknameInputRef.current.select(); // Select the text for easy editing
      }
    }, 100);
  };

  // Handler to close the modal
  const handleCloseModal = () => {
    setIsModalOpen(false);
  };


  return (
    <div>
      <meta charSet="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>COBY - 마이페이지</title>
      <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@400;500;700&display=swap" rel="stylesheet" />
      <style dangerouslySetInnerHTML={{ __html: "\n        body {\n            font-family: 'Noto Sans KR', sans-serif;\n            background-color: #0f172a;\n            color: #f8fafc;\n        }\n        .card {\n            background-color: #1e293b;\n            border-radius: 0.75rem;\n            box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);\n        }\n        .btn-primary {\n            background-color: #3b82f6;\n            transition: all 0.2s ease;\n        }\n        .btn-primary:hover {\n            background-color: #2563eb;\n            transform: translateY(-2px);\n        }\n        .btn-secondary {\n            background-color: #475569;\n            transition: all 0.2s ease;\n        }\n        .btn-secondary:hover {\n            background-color: #334155;\n            transform: translateY(-2px);\n        }\n        .progress-bar {\n            height: 8px;\n            background-color: #475569;\n            border-radius: 9999px;\n            overflow: hidden;\n        }\n        .progress-fill {\n            height: 100%;\n            border-radius: 9999px;\n            transition: width 1s ease;\n        }\n        .tab-active {\n            border-bottom: 2px solid #3b82f6;\n            color: #3b82f6;\n        }\n        .tier-badge {\n            position: relative;\n            width: 120px;\n            height: 120px;\n        }\n        .tier-badge::before {\n            content: '';\n            position: absolute;\n            top: 0;\n            left: 0;\n            width: 100%;\n            height: 100%;\n            background: linear-gradient(135deg, rgba(59, 130, 246, 0.5), rgba(16, 185, 129, 0.5));\n            border-radius: 50%;\n            z-index: -1;\n            filter: blur(10px);\n        }\n        .tier-icon {\n            width: 100%;\n            height: 100%;\n            display: flex;\n            align-items: center;\n            justify-content: center;\n            border-radius: 50%;\n            background: linear-gradient(135deg, #3b82f6, #10b981);\n            box-shadow: 0 0 20px rgba(59, 130, 246, 0.5);\n        }\n        .result-badge {\n            padding: 0.25rem 0.75rem;\n            border-radius: 9999px;\n            font-weight: 600;\n            font-size: 0.75rem;\n        }\n        .result-badge.win {\n            background-color: #10b981;\n            color: white;\n        }\n        .result-badge.lose {\n            background-color: #ef4444;\n            color: white;\n        }\n        .avatar-upload {\n            position: relative;\n            width: 120px;\n            height: 120px;\n            border-radius: 50%;\n            overflow: hidden;\n            cursor: pointer;\n        }\n        .avatar-upload:hover .avatar-overlay {\n            opacity: 1;\n        }\n        .avatar-overlay {\n            position: absolute;\n            top: 0;\n            left: 0;\n            width: 100%;\n            height: 100%;\n            background-color: rgba(0, 0, 0, 0.5);\n            display: flex;\n            align-items: center;\n            justify-content: center;\n            opacity: 0;\n            transition: opacity 0.3s ease;\n        }\n        .stat-card {\n            transition: all 0.3s ease;\n        }\n        .stat-card:hover {\n            transform: translateY(-5px);\n        }\n        .chart-container {\n            position: relative;\n            width: 100%;\n            height: 200px;\n        }\n        .chart-bar {\n            position: absolute;\n            bottom: 0;\n            width: 8%;\n            background: linear-gradient(to top, #3b82f6, #60a5fa);\n            border-radius: 4px 4px 0 0;\n            transition: height 1s ease;\n        }\n        .match-card {\n            transition: all 0.3s ease;\n        }\n        .match-card:hover {\n            transform: translateX(5px);\n        }\n        .modal {\n            position: fixed;\n            top: 0;\n            left: 0;\n            width: 100%;\n            height: 100%;\n            background-color: rgba(0, 0, 0, 0.5);\n            display: flex;\n            align-items: center;\n            justify-content: center;\n            z-index: 50;\n            opacity: 0;\n            pointer-events: none;\n            transition: opacity 0.3s ease;\n        }\n        .modal.active {\n            opacity: 1;\n            pointer-events: auto;\n        }\n        .modal-content {\n            background-color: #1e293b;\n            border-radius: 0.75rem;\n            width: 90%;\n            max-width: 500px;\n            transform: translateY(20px);\n            transition: transform 0.3s ease;\n        }\n        .modal.active .modal-content {\n            transform: translateY(0);\n        }\n    " }} />
      <div className="min-h-screen flex flex-col">
        <header className="bg-slate-800 py-4 px-6 flex justify-between items-center">
          <button className="flex items-center space-x-2" onClick={() => window.location.href='/mainpage'}>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-500" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M12.316 3.051a1 1 0 01.633 1.265l-4 12a1 1 0 11-1.898-.632l4-12a1 1 0 011.265-.633zM5.707 6.293a1 1 0 010 1.414L3.414 10l2.293 2.293a1 1 0 11-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0zm8.586 0a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 11-1.414-1.414L16.586 10l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
            <h1 className="text-xl font-bold">COBY</h1>
          </button>
        </header>
        <main className="flex-1 p-6">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-2xl font-bold mb-6">마이페이지</h2>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* 왼쪽: 프로필 정보 */}
              <div className="lg:col-span-1">
                <div className="card p-6 mb-6">
                  <div className="flex flex-col items-center mb-6">
                    <div className="avatar-upload mb-4" id="avatar-upload">
                      <img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%233b82f6'%3E%3Cpath d='M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z'/%3E%3C/svg%3E" alt="프로필 이미지" className="w-full h-full object-cover" />
                      <div className="avatar-overlay">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center justify-center mb-1">
                        <h3 className="text-xl font-bold mr-2" id="display-nickname">{currentUser}</h3>
                        <button id="edit-nickname-btn" className="text-gray-400 hover:text-blue-500" onClick={handleOpenModal}> {/* Add onClick handler */}
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                          </svg>
                        </button>
                      </div>
                      <p className="text-gray-400 text-sm">가입일: 2023년 5월 15일</p>
                    </div>
                  </div>
                  <div className="border-t border-slate-700 pt-4">
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-gray-400">레벨</span>
                      <span className="font-bold">Lv. 15</span>
                    </div>
                    <div className="mb-4">
                      <div className="flex justify-between text-xs mb-1">
                        <span>경험치</span>
                        <span>720/1000</span>
                      </div>
                      <div className="progress-bar">
                        <div className="progress-fill bg-blue-500" style={{ width: '72%' }} />
                      </div>
                    </div>
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-gray-400">보유 코인</span>
                      <span className="font-bold">2,450 코인</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">해결한 문제</span>
                      <span className="font-bold">78 문제</span>
                    </div>
                  </div>
                </div>
                <div className="card p-6">
                  <h3 className="text-lg font-bold mb-4">티어 정보</h3>
                  <div className="flex flex-col items-center mb-6">
                    <div className="tier-badge mb-4">
                      <div className="tier-icon">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                        </svg>
                      </div>
                    </div>
                    <h4 className="text-xl font-bold mb-1">골드 II</h4>
                    <p className="text-gray-400 text-sm">상위 15%</p>
                  </div>
                  <div className="border-t border-slate-700 pt-4">
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-gray-400">티어 점수</span>
                      <span className="font-bold">1,850 점</span>
                    </div>
                    <div className="mb-6">
                      <div className="flex justify-between text-xs mb-1">
                        <span>골드 II</span>
                        <span>골드 I</span>
                      </div>
                      <div className="progress-bar">
                        <div className="progress-fill bg-yellow-500" style={{ width: '85%' }} />
                      </div>
                    </div>
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-gray-400">최고 티어</span>
                      <span className="font-bold text-yellow-500">골드 I</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">시즌 시작일</span>
                      <span className="text-sm">2023년 9월 1일</span>
                    </div>
                  </div>
                </div>
              </div>
              {/* 오른쪽: 전적 및 통계 */}
              <div className="lg:col-span-2">
                <div className="card p-6 mb-6">
                  <h3 className="text-lg font-bold mb-4">전적 요약</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <div className="stat-card bg-slate-700 p-4 rounded-lg text-center">
                      <div className="text-sm text-gray-400 mb-1">총 대결 수</div>
                      <div className="text-2xl font-bold">124</div>
                    </div>
                    <div className="stat-card bg-slate-700 p-4 rounded-lg text-center">
                      <div className="text-sm text-gray-400 mb-1">승리</div>
                      <div className="text-2xl font-bold text-green-500">78</div>
                    </div>
                    <div className="stat-card bg-slate-700 p-4 rounded-lg text-center">
                      <div className="text-sm text-gray-400 mb-1">패배</div>
                      <div className="text-2xl font-bold text-red-500">46</div>
                    </div>
                    <div className="stat-card bg-slate-700 p-4 rounded-lg text-center">
                      <div className="text-sm text-gray-400 mb-1">승률</div>
                      <div className="text-2xl font-bold text-blue-500">62.9%</div>
                    </div>
                  </div>
                  <h4 className="font-medium mb-3">최근 10게임 승/패</h4>
                  <div className="flex space-x-2 mb-6">
                    <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center text-white font-bold text-xs">승</div>
                    <div className="w-8 h-8 rounded-full bg-red-500 flex items-center justify-center text-white font-bold text-xs">패</div>
                    <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center text-white font-bold text-xs">승</div>
                    <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center text-white font-bold text-xs">승</div>
                    <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center text-white font-bold text-xs">승</div>
                    <div className="w-8 h-8 rounded-full bg-red-500 flex items-center justify-center text-white font-bold text-xs">패</div>
                    <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center text-white font-bold text-xs">승</div>
                    <div className="w-8 h-8 rounded-full bg-red-500 flex items-center justify-center text-white font-bold text-xs">패</div>
                    <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center text-white font-bold text-xs">승</div>
                    <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center text-white font-bold text-xs">승</div>
                  </div>
                  <h4 className="font-medium mb-3">월별 승률 추이</h4>
                  <div className="chart-container mb-2">
                    <div className="chart-bar" style={{ left: '5%', height: '60%' }} />
                    <div className="chart-bar" style={{ left: '15%', height: '45%' }} />
                    <div className="chart-bar" style={{ left: '25%', height: '70%' }} />
                    <div className="chart-bar" style={{ left: '35%', height: '55%' }} />
                    <div className="chart-bar" style={{ left: '45%', height: '65%' }} />
                    <div className="chart-bar" style={{ left: '55%', height: '50%' }} />
                    <div className="chart-bar" style={{ left: '65%', height: '75%' }} />
                    <div className="chart-bar" style={{ left: '75%', height: '80%' }} />
                    <div className="chart-bar" style={{ left: '85%', height: '65%' }} />
                  </div>
                  <div className="flex justify-between text-xs text-gray-400">
                    <span>1월</span>
                    <span>2월</span>
                    <span>3월</span>
                    <span>4월</span>
                    <span>5월</span>
                    <span>6월</span>
                    <span>7월</span>
                    <span>8월</span>
                    <span>9월</span>
                  </div>
                </div>
                <div className="card p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-bold">최근 대결 기록</h3>
                    <button className="text-sm text-blue-500 hover:underline">전체 보기</button>
                  </div>
                  <div className="space-y-4">
                    {/* 대결 기록 1 */}
                    <div className="match-card bg-slate-800 rounded-lg p-4">
                      <div className="flex justify-between items-center mb-2">
                        <div className="flex items-center">
                          <div className="result-badge win mr-3">승리</div>
                          <div>
                            <div className="font-medium">두 수의 합</div>
                            <div className="text-xs text-gray-400">2023.09.15 14:30</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-medium">+120 XP</div>
                          <div className="text-xs text-gray-400">2등 / 4명</div>
                        </div>
                      </div>
                      <div className="flex justify-between text-xs">
                        <div>
                          <span className="text-gray-400">실행 시간:</span>
                          <span>56ms</span>
                        </div>
                        <div>
                          <span className="text-gray-400">메모리:</span>
                          <span>42.5MB</span>
                        </div>
                        <div>
                          <span className="text-gray-400">언어:</span>
                          <span>Python</span>
                        </div>
                      </div>
                    </div>
                    {/* 대결 기록 2 */}
                    <div className="match-card bg-slate-800 rounded-lg p-4">
                      <div className="flex justify-between items-center mb-2">
                        <div className="flex items-center">
                          <div className="result-badge win mr-3">승리</div>
                          <div>
                            <div className="font-medium">유효한 괄호</div>
                            <div className="text-xs text-gray-400">2023.09.14 10:15</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-medium">+150 XP</div>
                          <div className="text-xs text-gray-400">1등 / 3명</div>
                        </div>
                      </div>
                      <div className="flex justify-between text-xs">
                        <div>
                          <span className="text-gray-400">실행 시간:</span>
                          <span>48ms</span>
                        </div>
                        <div>
                          <span className="text-gray-400">메모리:</span>
                          <span>38.2MB</span>
                        </div>
                        <div>
                          <span className="text-gray-400">언어:</span>
                          <span>Python</span>
                        </div>
                      </div>
                    </div>
                    {/* 대결 기록 3 */}
                    <div className="match-card bg-slate-800 rounded-lg p-4">
                      <div className="flex justify-between items-center mb-2">
                        <div className="flex items-center">
                          <div className="result-badge lose mr-3">패배</div>
                          <div>
                            <div className="font-medium">최장 증가 부분 수열</div>
                            <div className="text-xs text-gray-400">2023.09.12 16:45</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-medium">+50 XP</div>
                          <div className="text-xs text-gray-400">3등 / 4명</div>
                        </div>
                      </div>
                      <div className="flex justify-between text-xs">
                        <div>
                          <span className="text-gray-400">실행 시간:</span>
                          <span>120ms</span>
                        </div>
                        <div>
                          <span className="text-gray-400">메모리:</span>
                          <span>45.8MB</span>
                        </div>
                        <div>
                          <span className="text-gray-400">언어:</span>
                          <span>Python</span>
                        </div>
                      </div>
                    </div>
                    {/* 대결 기록 4 */}
                    <div className="match-card bg-slate-800 rounded-lg p-4">
                      <div className="flex justify-between items-center mb-2">
                        <div className="flex items-center">
                          <div className="result-badge win mr-3">승리</div>
                          <div>
                            <div className="font-medium">회문 연결 리스트</div>
                            <div className="text-xs text-gray-400">2023.09.10 11:30</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-medium">+130 XP</div>
                          <div className="text-xs text-gray-400">1등 / 5명</div>
                        </div>
                      </div>
                      <div className="flex justify-between text-xs">
                        <div>
                          <span className="text-gray-400">실행 시간:</span>
                          <span>62ms</span>
                        </div>
                        <div>
                          <span className="text-gray-400">메모리:</span>
                          <span>40.1MB</span>
                        </div>
                        <div>
                          <span className="text-gray-400">언어:</span>
                          <span>Python</span>
                        </div>
                      </div>
                    </div>
                    {/* 대결 기록 5 */}
                    <div className="match-card bg-slate-800 rounded-lg p-4">
                      <div className="flex justify-between items-center mb-2">
                        <div className="flex items-center">
                          <div className="result-badge lose mr-3">패배</div>
                          <div>
                            <div className="font-medium">이진 트리 최대 깊이</div>
                            <div className="text-xs text-gray-400">2023.09.08 15:20</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-medium">+40 XP</div>
                          <div className="text-xs text-gray-400">4등 / 4명</div>
                        </div>
                      </div>
                      <div className="flex justify-between text-xs">
                        <div>
                          <span className="text-gray-400">실행 시간:</span>
                          <span>85ms</span>
                        </div>
                        <div>
                          <span className="text-gray-400">메모리:</span>
                          <span>44.3MB</span>
                        </div>
                        <div>
                          <span className="text-gray-400">언어:</span>
                          <span>Python</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
      {/* 닉네임 변경 모달 */}
      <div className={`modal ${isModalOpen ? 'active' : ''}`} id="nickname-modal"> {/* Dynamically add 'active' class */}
        <div className="modal-content p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold">닉네임 변경</h3>
            <button className="text-gray-400 hover:text-white" onClick={handleCloseModal}> {/* Add onClick handler */}
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div className="mb-4">
            <label htmlFor="nickname" className="block text-sm font-medium text-gray-400 mb-1">새 닉네임</label>
            <input
              type="text"
              id="nickname"
              ref={nicknameInputRef} // Attach ref to input
              className="w-full bg-slate-700 border-none rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={tempNickname} // Control input value with state
              onChange={(e) => setTempNickname(e.target.value)} // Update tempNickname on change
              placeholder="2~12자 이내"
            />
            <p className="text-xs text-gray-400 mt-1">닉네임은 2~12자 이내로 설정해주세요.</p>
          </div>
          <div className="flex justify-end space-x-3">
            <button className="btn-secondary py-2 px-4 rounded-lg text-sm font-medium" onClick={handleCloseModal}>취소</button> {/* Add onClick handler */}
            {/* <button className="btn-primary py-2 px-4 rounded-lg text-sm font-medium" onClick={handleSaveNickname}>저장</button> Add onClick handler */}
          </div>
        </div>
      </div>
    </div>
  );
}

export default MyPage;