import React, { useState, useEffect, useRef } from 'react';
import './WaitingRoom.css';
import { useNavigate } from 'react-router-dom';

function WaitingRoom() {
  const navigate = useNavigate();

  const [isReady, setIsReady] = useState(false);
  const [showContextMenu, setShowContextMenu] = useState(false);
  const [contextMenuPos, setContextMenuPos] = useState({ x: 0, y: 0 });
  const [selectedPlayer, setSelectedPlayer] = useState(null); // Stores data of the clicked player
  
  // Assume '코드마스터' is the current user's name
  const currentUser = "코드마스터";
  // For demonstration, let's assume '사용자1' is the host.
  // In a real app, this would come from props or a global state.
  const roomHost = "사용자1"; 
  const isCurrentUserHost = currentUser === roomHost;

  const contextMenuRef = useRef(null);

  const enterRoomBtn1 = () => {
    alert('방에 입장합니다!');
    navigate('/gamepage');
  };

  const quickbtn = () => {
    alert('방에서 나갑니다');
    navigate('/mainpage');
  };

  const toggleReady = () => {
    setIsReady(prevIsReady => !prevIsReady);
  };

  const handlePlayerCardClick = (event, player) => {
    // Prevent default right-click menu for onContextMenu
    event.preventDefault(); 
    
    setSelectedPlayer(player);
    setContextMenuPos({ x: event.clientX, y: event.clientY });
    setShowContextMenu(true);
  };

  const handleViewInfo = () => {
    // Here you would typically open the player info modal and populate it
    const playerInfoModal = document.getElementById('playerInfoModal');
    if (playerInfoModal) {
        playerInfoModal.classList.remove('hidden');
        // Populate modal with selectedPlayer data (e.g., playerInfoModal.querySelector('#playerName').innerText = selectedPlayer.name;)
        document.getElementById('playerAvatar').innerText = selectedPlayer.avatarInitials;
        document.getElementById('playerName').innerText = selectedPlayer.name;
        document.getElementById('playerTier').querySelector('span').innerText = selectedPlayer.tier;
        document.getElementById('playerLevel').innerText = selectedPlayer.level;
        // You'd also update win rate, wins, losses, etc. from selectedPlayer data
    }
    setShowContextMenu(false);
  };

  const handleDelegateHost = () => {
    if (selectedPlayer) {
      alert(`방장 위임: ${selectedPlayer.name}`);
      // Implement host delegation logic here
    }
    setShowContextMenu(false);
  };

  const handleKickPlayer = () => {
    if (selectedPlayer) {
      alert(`강퇴하기: ${selectedPlayer.name}`);
      // Implement kick player logic here
    }
    setShowContextMenu(false);
  };

  const handleClickOutside = (event) => {
    if (contextMenuRef.current && !contextMenuRef.current.contains(event.target)) {
      setShowContextMenu(false);
      setSelectedPlayer(null);
    }
  };

  // Add event listener for clicks outside the context menu
  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Player data for rendering cards
  const players = [
    { name: "사용자1", avatarInitials: "KM", tier: "마스터", level: "Lv.42", isHost: true, isReady: true },
    { name: "사용자2", avatarInitials: "JH", tier: "마스터", level: "Lv.39", isReady: true },
    { name: "코드마스터", avatarInitials: "CM", tier: "다이아", level: "Lv.28", isReady: isReady }, // Current user
    { name: "사용자4", avatarInitials: "SJ", tier: "다이아", level: "Lv.31", isReady: true },
  ];

  return (
    <div className="WaitingRoom" onContextMenu={(e) => e.preventDefault()}> {/* Prevent default right-click on the whole page */}
      <meta charSet="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>COBY - Coding Online Battle with You</title>
      <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@300;400;500;700;900&display=swap" rel="stylesheet" />
      <nav className="waitingRoom-glass-effect sticky top-0 z-50 px-6 py-4 flex justify-between items-center border-b border-blue-900/30">
        <div className="flex items-center space-x-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-500" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M12.316 3.051a1 1 0 01.633 1.265l-4 12a1 1 0 11-1.898-.632l4-12a1 1 0 011.265-.633zM5.707 6.293a1 1 0 010 1.414L3.414 10l2.293 2.293a1 1 0 11-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0zm8.586 0a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 11-1.414-1.414L16.586 10l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
          <h1 className="text-2xl font-bold text-white">COBY</h1>
        </div>
        <div className="flex items-center space-x-6">
          <div className="flex items-center space-x-3">
            <div className="waitingRoom-tier-badge w-10 h-10 rounded-full bg-blue-900 flex items-center justify-center">
              <span className="text-sm font-bold text-blue-200">다이아</span>
            </div>
            <span className="font-medium">코드마스터</span>
          </div>
          <button id="leaveRoomBtn" className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg flex items-center transition" onClick={quickbtn}>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 001 1h12a1 1 0 001-1V7.414a1 1 0 00-.293-.707L11.414 2.414A1 1 0 0010.707 2H4a1 1 0 00-1 1zm9 4a1 1 0 00-1-1H8a1 1 0 00-1 1v8a1 1 0 001 1h3a1 1 0 001-1V7z" clipRule="evenodd" />
              <path d="M3 7.5a.5.5 0 01.5-.5h7a.5.5 0 010 1h-7a.5.5 0 01-.5-.5zm0 4a.5.5 0 01.5-.5h1a.5.5 0 010 1h-1a.5.5 0 01-.5-.5z" />
            </svg>
            나가기
          </button>
        </div>
      </nav>
      <main className="container mx-auto px-4 pt-4 transform scale-95 origin-top">
        <div className="waitingRoom-glass-effect rounded-xl p-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-white">알고리즘 배틀 #129</h2>
            <div className="flex items-center space-x-3">
              <div className="flex items-center">
                <span className="text-sm text-blue-300 mr-2">입장 코드:</span>
                <div className="waitingRoom-glass-effect rounded-lg px-3 py-1 flex items-center">
                  <span className="text-white font-medium mr-2">BATTLE-58392</span>
                  <button className="text-blue-400 hover:text-blue-300 transition">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M8 2a1 1 0 000 2h2a1 1 0 100-2H8z" />
                      <path d="M3 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v6h-4.586l1.293-1.293a1 1 0 00-1.414-1.414l-3 3a1 1 0 000 1.414l3 3a1 1 0 001.414-1.414L10.414 13H15v3a2 2 0 01-2 2H5a2 2 0 01-2-2V5zM15 11h2a1 1 0 110 2h-2v-2z" />
                    </svg>
                  </button>
                </div>
              </div>
              {/* Ready/Unready Button */}
              <button
                id="readyBtn"
                className={`px-4 py-2 rounded-lg flex items-center transition ${
                  isReady ? 'bg-green-600 hover:bg-green-700' : 'bg-gray-600 hover:bg-gray-700'
                } text-white`}
                onClick={toggleReady}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                {isReady ? '준비 완료' : '준비 하기'}
              </button>
              <button id="startGameBtn" className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center transition" onClick={enterRoomBtn1}>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                </svg>
                게임 시작
              </button>
              
            </div>
          </div>
          {/* Main content grid */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 lg:grid-rows-[auto_1fr]">
            {/* 문제정보 (상단 가로 정렬) */}
            <div className="lg:col-span-3">
              {/* 방 상세 정보 */}
              <div className="waitingRoom-glass-effect rounded-lg px-4 py-2">
                <div className="flex flex-wrap gap-x-6 gap-y-2">
                  <div className="flex items-center">
                    <span className="text-blue-300">문제 유형:</span>
                    <span className="text-white font-medium ml-1">알고리즘</span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-blue-300">난이도:</span>
                    <span className="text-yellow-400 font-medium ml-1">보통</span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-blue-300">제한 시간:</span>
                    <span className="text-white font-medium ml-1">30분</span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-blue-300">최대 참가자:</span>
                    <span className="text-white font-medium ml-1">4명</span>
                  </div>
                </div>
              </div>
            </div>
            {/* 채팅 (왼쪽 1/3) */}
            <div className="lg:col-span-1">
              <div className="waitingRoom-glass-effect rounded-lg p-4 flex flex-col h-full">
                <h3 className="text-lg font-semibold text-white mb-3 flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M2 5a2 2 0 012-2h7a2 2 0 012 2v4a2 2 0 01-2 2H9l-3 3v-3H4a2 2 0 01-2-2V5z" />
                    <path d="M15 7v2a4 4 0 01-4 4H9.828l-1.766 1.767c.28.149.599.233.938.233h2l3 3v-3h2a2 2 0 002-2V9a2 2 0 00-2-2h-1z" />
                  </svg>
                  채팅
                </h3>
                <div id="chatMessages" className="flex-1 overflow-y-auto waitingRoom-custom-scrollbar space-y-3 mb-3 min-h-[150px]">
                  <div className="flex items-start">
                    <div className="w-8 h-8 rounded-full bg-blue-700 flex items-center justify-center text-xs font-medium mr-2 flex-shrink-0">KM</div>
                    <div className="waitingRoom-chat-bubble waitingRoom-chat-bubble-left bg-blue-900/50 rounded-lg p-2 max-w-[80%]">
                      <p className="text-xs text-blue-300 mb-1">사용자1</p>
                      <p className="text-sm text-white">안녕하세요</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="w-8 h-8 rounded-full bg-purple-700 flex items-center justify-center text-xs font-medium mr-2 flex-shrink-0">JH</div>
                    <div className="waitingRoom-chat-bubble waitingRoom-chat-bubble-left bg-blue-900/50 rounded-lg p-2 max-w-[80%]">
                      <p className="text-xs text-blue-300 mb-1">사용자2</p>
                      <p className="text-sm text-white">반갑습니다.</p>
                    </div>
                  </div>
                  <div className="flex items-start justify-end">
                    <div className="waitingRoom-chat-bubble waitingRoom-chat-bubble-right bg-blue-600/50 rounded-lg p-2 max-w-[80%]">
                      <p className="text-xs text-blue-300 mb-1">코드마스터 (나)</p>
                      <p className="text-sm text-white">준비완료했습니다.</p>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-green-700 flex items-center justify-center text-xs font-medium ml-2 flex-shrink-0">CM</div>
                  </div>
                  <div className="flex items-start">
                    <div className="w-8 h-8 rounded-full bg-yellow-700 flex items-center justify-center text-xs font-medium mr-2 flex-shrink-0">SJ</div>
                    <div className="waitingRoom-chat-bubble waitingRoom-chat-bubble-left bg-blue-900/50 rounded-lg p-2 max-w-[80%]">
                      <p className="text-xs text-blue-300 mb-1">사용자4</p>
                      <p className="text-sm text-white">저도 준비완료했습니다.</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="w-8 h-8 rounded-full bg-blue-700 flex items-center justify-center text-xs font-medium mr-2 flex-shrink-0">KM</div>
                    <div className="waitingRoom-chat-bubble waitingRoom-chat-bubble-left bg-blue-900/50 rounded-lg p-2 max-w-[80%]">
                      <p className="text-xs text-blue-300 mb-1">사용자1</p>
                      <p className="text-sm text-white">모두 준비되면 시작하겠습니다. 아직 준비 안 된 분들은 준비 버튼 눌러주세요!</p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center mt-3">
                  <input type="text" id="chatInput" placeholder="메시지 입력..." className="bg-blue-900/30 text-white border border-blue-800 rounded-l-md px-3 py-2 text-sm flex-1 focus:outline-none focus:ring-1 focus:ring-blue-500" />
                  <button id="sendChat" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-r-md transition">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
            {/* 참가자 섹션 (오른쪽 2/3) */}
            <div className="lg:col-span-2">
              <div className="waitingRoom-glass-effect rounded-xl p-4 flex flex-col h-full">
                <h2 className="text-xl font-bold text-white mb-4 flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
                  </svg>
                  참가자 (4/4)
                </h2>
                <div className="grid grid-cols-2 gap-4 flex-1">
                  {players.map((player) => (
                    <div
                      key={player.name}
                      className={`waitingRoom-player-card waitingRoom-glass-effect rounded-xl p-4 flex flex-col items-center relative m-2 
                                  ${player.name === currentUser ? 'border-2 border-blue-500' : ''}
                                  ${player.isHost ? 'host' : ''}
                                  `}
                      data-player={player.name}
                      onClick={(e) => handlePlayerCardClick(e, player)}
                      onContextMenu={(e) => handlePlayerCardClick(e, player)}
                    >
                      <div className="waitingRoom-character mb-2">
                        <div className={`w-16 h-16 rounded-full flex items-center justify-center text-xl font-medium
                                        ${player.name === "사용자1" ? 'bg-blue-700' :
                                          player.name === "사용자2" ? 'bg-purple-700' :
                                          player.name === "코드마스터" ? 'bg-green-700' :
                                          'bg-yellow-700' // Default for 사용자4
                                        }`}>
                          {player.avatarInitials}
                        </div>
                      </div>
                      <h3 className="font-medium text-white text-center">{player.name}</h3>
                      <div className="flex items-center mt-1">
                        <div className="waitingRoom-tier-badge w-6 h-6 rounded-full bg-blue-900 flex items-center justify-center mr-1">
                          <span className="text-[0.6rem] font-bold text-blue-200">{player.tier}</span>
                        </div>
                        <span className="text-xs text-blue-300">{player.level}</span>
                      </div>
                      <div className={`${player.isReady ? 'waitingRoom-player-ready' : 'waitingRoom-player-not-ready'}`}>
                          {player.isReady ? '준비 완료' : '대기 중'}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Custom Context Menu */}
      {showContextMenu && selectedPlayer && (
        <div
          ref={contextMenuRef}
          className="waitingRoom-glass-effect custom-context-menu absolute rounded-lg shadow-lg py-2 z-50"
          style={{ top: contextMenuPos.y, left: contextMenuPos.x }}
        >
          <ul className="text-white text-sm">
            <li className="px-4 py-2 hover:bg-blue-700 cursor-pointer" onClick={handleViewInfo}>
              정보 보기
            </li>
            {isCurrentUserHost && selectedPlayer.name !== currentUser && ( // Host can't delegate/kick themselves
              <>
                <li className="px-4 py-2 hover:bg-blue-700 cursor-pointer" onClick={handleDelegateHost}>
                  방장 위임
                </li>
                <li className="px-4 py-2 hover:bg-red-700 cursor-pointer" onClick={handleKickPlayer}>
                  강퇴하기
                </li>
              </>
            )}
          </ul>
        </div>
      )}

      {/* Player Info Modal (hidden by default) */}
      <div id="playerInfoModal" className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 hidden">
        <div className="waitingRoom-glass-effect rounded-xl w-full max-w-md p-6 waitingRoom-animate-fade-in">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-white">플레이어 정보</h2>
            <button id="closePlayerModal" className="text-blue-300 hover:text-white transition" onClick={() => document.getElementById('playerInfoModal').classList.add('hidden')}>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div className="flex items-center mb-4">
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
          <div className="space-y-4">
            <div className="waitingRoom-glass-effect rounded-lg p-4">
              <h4 className="text-sm font-medium text-blue-300 mb-2">전적</h4>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="waitingRoom-glass-effect rounded-lg p-2">
                  <p className="text-xs text-blue-300">승률</p>
                  <p id="playerWinRate" className="text-xl font-bold text-white">92%</p> {/* Placeholder, populate from selectedPlayer */}
                </div>
                <div className="waitingRoom-glass-effect rounded-lg p-2">
                  <p className="text-xs text-blue-300">승리</p>
                  <p id="playerWins" className="text-xl font-bold text-green-400">138</p> {/* Placeholder */}
                </div>
                <div className="waitingRoom-glass-effect rounded-lg p-2">
                  <p className="text-xs text-blue-300">패배</p>
                  <p id="playerLosses" className="text-xl font-bold text-red-400">12</p> {/* Placeholder */}
                </div>
              </div>
            </div>
            <div className="waitingRoom-glass-effect rounded-lg p-4">
              <h4 className="text-sm font-medium text-blue-300 mb-2">선호 문제 유형</h4>
              <div className="waitingRoom-stats-chart-container">
                <canvas id="preferredTypesChart" />
              </div>
            </div>
            <div className="waitingRoom-glass-effect rounded-lg p-4">
              <h4 className="text-sm font-medium text-blue-300 mb-2">최근 기록</h4>
              <div className="space-y-2 waitingRoom-custom-scrollbar overflow-y-auto max-h-32">
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
          </div>
        </div>
      </div>
      {/* 게임 시작 확인 모달 */}
      <div id="startGameConfirmModal" className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 hidden">
        <div className="waitingRoom-glass-effect rounded-xl w-full max-w-md p-6 waitingRoom-animate-fade-in">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-white">게임 시작</h2>
            <button id="closeStartConfirmModal" className="text-blue-300 hover:text-white transition" onClick={() => document.getElementById('startGameConfirmModal').classList.add('hidden')}>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div className="text-center mb-6">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-yellow-500 mx-auto mb-4" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            <h3 className="text-lg font-semibold text-white mb-2">게임을 시작하시겠습니까?</h3>
            <p className="text-blue-300">아직 준비되지 않은 참가자가 있습니다. 그래도 시작하시겠습니까?</p>
          </div>
          <div className="flex space-x-3">
            <button id="cancelStartGame" className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-2 rounded-lg transition">
              취소
            </button>
            <button id="confirmStartGame" className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg transition">
              시작하기
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default WaitingRoom;