// PlayerInfoModal.jsx
/**
 * 플레이어 정보 모달을 렌더링하는 컴포넌트입니다.
 */
import '../WaitingRoom.css';

import React from 'react';

function PlayerInfoModal() {
  return (
    <div id="playerInfoModal" className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 hidden">
      {/* 모달 컨테이너의 너비와 높이를 조정 (가로 600px, 세로 450px) */}
      <div className="waitingRoom-glass-effect rounded-xl w-[600px] h-[450px] p-6 waitingRoom-animate-fade-in flex flex-col">
        <div className="flex justify-between items-center mb-4 flex-shrink-0">
          <h2 className="text-xl font-bold text-white">플레이어 정보</h2>
          <button id="closePlayerModal" className="text-blue-300 hover:text-white transition" onClick={() => document.getElementById('playerInfoModal').classList.add('hidden')}>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* 플레이어 정보 (아바타, 이름, 티어, 레벨) 및 전적 섹션 */}
        <div className="flex items-start justify-between mb-4 flex-shrink-0">
          {/* 플레이어 아바타 및 기본 정보 */}
          <div className="flex items-center">
            <div className="waitingRoom-character mr-4">
              <div id="playerAvatar" className="w-16 h-16 rounded-full bg-blue-700 flex items-center justify-center text-xl font-medium"></div>
            </div>
            <div>
              <h3 id="playerName" className="text-lg font-bold text-white"></h3>
              <div className="flex items-center">
                <div id="playerTier" className="waitingRoom-tier-badge w-6 h-6 rounded-full bg-blue-900 flex items-center justify-center mr-2">
                  <span className="text-[0.6rem] font-bold text-blue-200"></span>
                </div>
                <span id="playerLevel" className="text-sm text-blue-300"></span>
              </div>
            </div>
          </div>

          {/* 전적 섹션 */}
          <div className="waitingRoom-glass-effect rounded-lg p-4 flex-1 ml-4">
            <h4 className="text-sm font-medium text-blue-300 mb-2">전적</h4>
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="waitingRoom-glass-effect rounded-lg p-2">
                <p className="text-xs text-blue-300">승률</p>
                <p id="playerWinRate" className="text-xl font-bold text-white">92%</p>
              </div>
              <div className="waitingRoom-glass-effect rounded-lg p-2">
                <p className="text-xs text-blue-300">승리</p>
                <p id="playerWins" className="text-xl font-bold text-green-400">138</p>
              </div>
              <div className="waitingRoom-glass-effect rounded-lg p-2">
                <p className="text-xs text-blue-300">패배</p>
                <p id="playerLosses" className="text-xl font-bold text-red-400">12</p>
              </div>
            </div>
          </div>
        </div>

        {/* 모달 콘텐츠 영역: 선호 문제 유형 (오른쪽), 최근 기록 (왼쪽) */}
        <div className="grid grid-cols-2 gap-4 flex-grow overflow-y-auto waitingRoom-custom-scrollbar">
          {/* 최근 기록 섹션 (왼쪽) */}
          <div className="waitingRoom-glass-effect rounded-lg p-4">
            <h4 className="text-sm font-medium text-blue-300 mb-2">최근 기록</h4>
            <div className="space-y-2">
              <div className="flex justify-between items-center waitingRoom-glass-effect rounded-lg p-2 border-l-4 border-green-500">
                <div>
                  <p className="font-medium text-white">알고리즘 배틀 #128</p>
                  <p className="text-xs text-blue-300">2시간 전</p>
                </div>
                <span className="text-green-400 font-medium">승리</span>
              </div>
              <div className="flex justify-between items-center waitingRoom-glass-effect rounded-lg p-2 border-l-4 border-green-500">
                <div>
                  <p className="font-medium text-white">자료구조 마스터 #45</p>
                  <p className="text-xs text-blue-300">어제</p>
                </div>
                <span className="text-green-400 font-medium">승리</span>
              </div>
              <div className="flex justify-between items-center waitingRoom-glass-effect rounded-lg p-2 border-l-4 border-green-500">
                <div>
                  <p className="font-medium text-white">SQL 챌린지 #12</p>
                  <p className="text-xs text-blue-300">2일 전</p>
                </div>
                <span className="text-green-400 font-medium">승리</span>
              </div>
            </div>
          </div>

          {/* 선호 문제 유형 섹션 (오른쪽) */}
          <div className="waitingRoom-glass-effect rounded-lg p-4">
            <h4 className="text-sm font-medium text-blue-300 mb-2">선호 문제 유형</h4>
            <div className="waitingRoom-stats-chart-container">
              <canvas id="preferredTypesChart" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PlayerInfoModal;