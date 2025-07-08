// PlayerInfoModal.jsx
/**
 * 플레이어 정보 모달을 렌더링하는 컴포넌트입니다.
 */

import React, { useEffect, useState } from 'react'; // Import useEffect and useState
import PieChart from './PieChart';

// Define a mapping of preferred type names to specific colors for consistency
const TYPE_COLORS = {
  '알고리즘': 'rgba(255, 99, 132, 0.8)',
  '자료구조': 'rgba(54, 162, 235, 0.8)',
  'SQL': 'rgba(255, 206, 86, 0.8)',
  '동적계획법': 'rgba(75, 192, 192, 0.8)',
  // Add more types and colors as needed
};

function PlayerInfoModal({ showModal, onClose, playerData, selectedPlayerName }) { // Accept props
  // State to hold chart data
  const [chartData, setChartData] = useState({
    labels: [],
    datasets: [
      {
        label: '# of Problems',
        data: [],
        backgroundColor: [],
        borderColor: [],
        borderWidth: 1,
      },
    ],
  });

  useEffect(() => {
    // Update chart data when playerData changes
    if (playerData && playerData.preferredTypes) {
      const labels = Object.keys(playerData.preferredTypes);
      const dataValues = Object.values(playerData.preferredTypes);
      const backgroundColors = labels.map(label => TYPE_COLORS[label] || 'rgba(153, 102, 255, 0.8)'); // Fallback color
      const borderColors = backgroundColors.map(color => color.replace('0.8', '1')); // Make border opaque

      setChartData({
        labels: labels,
        datasets: [
          {
            label: '# of Problems',
            data: dataValues,
            backgroundColor: backgroundColors,
            borderColor: borderColors,
            borderWidth: 1,
          },
        ],
      });
    }
  }, [playerData]); // Re-run effect when playerData changes


  // Helper function to render recent games
  const renderRecentGames = (games) => {
    if (!games || games.length === 0) {
      return <p className="waitingRoom-text text-center">최근 기록이 없습니다.</p>;
    }
    return games.map((game, index) => (
      <div key={index} className={`flex justify-between items-center waitingRoom-glass-effect rounded-lg p-2 border-l-4 ${game.result === '승리' ? 'border-green-500' : 'border-red-500'}`}>
        <div>
          <p className="font-medium ">{game.name}</p>
          <p className="text-xs waitingRoom-text">{game.time}</p>
        </div>
        <span className={`font-medium ${game.result === '승리' ? 'text-green-400' : 'text-red-400'}`}>{game.result}</span>
      </div>
    ));
  };

  if (!showModal || !playerData) { // Only render if showModal is true and playerData is available
    return null;
  }

  return (
    <div id="playerInfoModal" className={`fixed inset-0 bg-black/70 flex items-center justify-center z-50 ${showModal ? '' : 'hidden'}`}> {/* Control visibility with showModal prop */}
      {/* 모달 컨테이너의 너비와 높이를 조정 (가로 600px, 세로 450px) */}
      <div className="waitingRoom-glass-effect rounded-xl w-[750px] h-[550px] p-6 waitingRoom-animate-fade-in flex flex-col">
        <div className="flex justify-between items-center mb-4 flex-shrink-0">
          <h2 className="text-xl font-bold ">플레이어 정보</h2>
          <button id="closePlayerModal" className="waitingRoom-text hover: transition" onClick={onClose}> {/* Use onClose prop */}
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
              <div id="playerAvatar" className="w-16 h-16 rounded-full bg-blue-700 flex items-center justify-center text-xl font-medium"
                style={{ backgroundColor: playerData.avatarColor || 'bg-blue-700' }}> {/* Use playerData.avatarColor */}
                {playerData.avatar} {/* Use playerData.avatar */}
              </div>
            </div>
            <div>
              <h3 id="playerName" className="text-lg font-bold ">{selectedPlayerName}</h3> {/* Use selectedPlayerName */}
              <div className="flex items-center">
                <div id="playerTier" className="waitingRoom-tier-badge w-6 h-6 rounded-full bg-blue-900 flex items-center justify-center mr-2">
                  <span className="text-[0.6rem] font-bold text-blue-200">{playerData.tier}</span> {/* Use playerData.tier */}
                </div>
                <span id="playerLevel" className="text-sm waitingRoom-text">Lv.{playerData.level}</span> {/* Use playerData.level */}
              </div>
            </div>
          </div>

          {/* 전적 섹션 */}
          <div className="waitingRoom-glass-effect rounded-lg p-4 flex-1 ml-4">
            <h4 className="text-sm font-medium waitingRoom-text mb-2">전적</h4>
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="waitingRoom-glass-effect rounded-lg p-2">
                <p className="text-xs waitingRoom-text">승률</p>
                <p id="playerWinRate" className="text-xl font-bold ">{playerData.winRate}</p> {/* Use playerData.winRate */}
              </div>
              <div className="waitingRoom-glass-effect rounded-lg p-2">
                <p className="text-xs waitingRoom-text">승리</p>
                <p id="playerWins" className="text-xl font-bold text-green-400">{playerData.wins}</p> {/* Use playerData.wins */}
              </div>
              <div className="waitingRoom-glass-effect rounded-lg p-2">
                <p className="text-xs waitingRoom-text">패배</p>
                <p id="playerLosses" className="text-xl font-bold text-red-400">{playerData.losses}</p> {/* Use playerData.losses */}
              </div>
            </div>
          </div>
        </div>

        {/* 모달 콘텐츠 영역: 선호 문제 유형 (오른쪽), 최근 기록 (왼쪽) */}
        <div className="grid grid-cols-2 gap-4 flex-grow overflow-y-auto waitingRoom-custom-scrollbar">
          {/* 최근 기록 섹션 (왼쪽) */}
          <div className="waitingRoom-glass-effect rounded-lg p-4">
            <h4 className="text-sm font-medium waitingRoom-text mb-2">최근 기록</h4>
            <div className="space-y-2">
              {renderRecentGames(playerData.recentGames)} {/* Render recent games dynamically */}
            </div>
          </div>

          {/* 선호 문제 유형 섹션 (오른쪽) */}
          <div className="waitingRoom-glass-effect rounded-lg p-4">
            <h4 className="text-sm font-medium waitingRoom-text mb-2">선호 문제 유형</h4>
            <div className="waitingRoom-stats-chart-container">
              <PieChart data={chartData} /> {/* Pass chartData state to PieChart */}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PlayerInfoModal;