import React, { useState, useEffect, useRef } from 'react';
import './ResultRoom.css';
import { useNavigate, useParams } from 'react-router-dom';
import ChatWindow from '../../Common/components/ChatWindow'; // ChatWindow 컴포넌트 임포트
import useContextMenu from '../../Common/hooks/useContextMenu'; // useContextMenu 훅 임포트
import PlayerInfoModal from '../../Common/components/PlayerInfoModal'; // PlayerInfoModal 컴포넌트 임포트
import { useWebSocket } from '../WebSocket/WebSocketContext';
import ToastNotification from '../../Common/components/ToastNotification';
import { useAuth } from '../AuthContext/AuthContext';
import PlayerCard from '../WaitingRoom/components/PlayerCard'


function ResultRoom() {
  const navigate = useNavigate();
  const { users, joinRoom, leaveRoom, isConnected, error, joinedRoomId } = useWebSocket();
  const [notification, setNotification] = useState(null);
  const { roomId } = useParams();
  const { user } = useAuth();

  const currentUser = user?.nickname || '게스트';
  const userId = user?.id || 0;

  // 현재 사용자 닉네임을 가져옵니다.

  // Use useEffect to show notifications based on WebSocket connection status
  useEffect(() => {
    if (isConnected) {
      setNotification({ message: "채팅 서버에 연결되었습니다.", type: "success" });
    } else if (error) {
      setNotification({ message: error, type: "error" });
    } else {
      setNotification({ message: "채팅 서버와 연결이 끊어졌습니다.", type: "error" });
    }
    const timer = setTimeout(() => setNotification(null), 3000);
    return () => clearTimeout(timer); // Clear timeout if component unmounts or status changes
  }, [isConnected, error]);

  useEffect(() => {
    if (isConnected && joinedRoomId !== roomId) {
      joinRoom(roomId, { userId, nickname: currentUser, profileUrl: '' });
    }
  }, [isConnected, roomId, currentUser, userId, joinRoom, joinedRoomId]);

  useEffect(() => {
    return () => {
      leaveRoom(roomId, userId);
    };
  }, [roomId, userId, leaveRoom]);
  

  // 플레이어 정보 모달 관련 상태
  const [showPlayerInfoModal, setShowPlayerInfoModal] = useState(false);
  const [playerInfoForModal, setPlayerInfoForModal] = useState(null);
  // useContextMenu 훅 사용
  const {
    showContextMenu,
    contextMenuPos,
    selectedPlayer, // 컨텍스트 메뉴가 열린 플레이어 정보
    contextMenuRef,
    handlePlayerCardClick, // 플레이어 카드 클릭 핸들러 (여기서는 테이블 행에 적용)
    setShowContextMenu,
  } = useContextMenu();


  const quickRoomBtn = () => {
    alert('방에서 나갑니다!');
    leaveRoom(roomId, userId);
    navigate('/mainpage');
  };

  const regameBtn = () => {
    alert('재대결을 준비하세요');
    navigate(`/waitingRoom/${roomId}`);
  };


  const [maxParticipants, setMaxParticipants] = useState(4);
  
  const totalSlots = maxParticipants;
  const currentPlayers = users.map(user => ({
        name: user.nickname,
        userId: user.userId,
        avatarInitials:
            user.nickname.charAt(0).toUpperCase() + (user.nickname.charAt(1) || '').toUpperCase(),
        tier: '다이아',
        level: 'Lv.1',
        // isReady: user.nickname === currentUser ? isReady : true,
        avatarColor: 'bg-blue-700',
        // isHost: user.nickname === roomHost,
    }));
  const players = Array.from({length: totalSlots}, (_, index) => {
      if (currentPlayers[index]) {
          return currentPlayers[index];
      } else {
          return {isEmpty: true, name: `빈 자리 ${index + 1}`};
      }
  });


  return (
    <div className='resultroom1'>
      <meta charSet="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>COBY - 결과</title>
      <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@400;500;700&display=swap" rel="stylesheet" />
      <style dangerouslySetInnerHTML={{ __html: "\n        body {\n            font-family: 'Noto Sans KR', sans-serif;\n            background-color: #0f172a;\n            color: #f8fafc;\n        }\n        .result-card {\n            background-color: #1e293b;\n            border-radius: 0.75rem;\n            box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);\n        }\n        .code-block {\n            background-color: #0f172a;\n            border-radius: 0.5rem;\n            font-family: monospace;\n            overflow-x: auto;\n        }\n        .chat-container {\n            height: 400px;\n            overflow-y: auto;\n            scrollbar-width: thin;\n            scrollbar-color: #475569 #1e293b;\n        }\n        .chat-container::-webkit-scrollbar {\n            width: 8px;\n        }\n        .chat-container::-webkit-scrollbar-track {\n            background: #1e293b;\n        }\n        .chat-container::-webkit-scrollbar-thumb {\n            background-color: #475569;\n            border-radius: 20px;\n        }\n        .chat-message {\n            border-radius: 1rem;\n            max-width: 80%;\n        }\n        .chat-message.mine {\n            background-color: #3b82f6;\n            margin-left: auto;\n        }\n        .chat-message.others {\n            background-color: #334155;\n        }\n        .player-avatar {\n            width: 2rem;\n            height: 2rem;\n            border-radius: 50%;\n            display: flex;\n            align-items: center;\n            justify-content: center;\n            font-weight: bold;\n        }\n        .btn-primary {\n            background-color: #3b82f6;\n            transition: all 0.2s ease;\n        }\n        .btn-primary:hover {\n            background-color: #2563eb;\n            transform: translateY(-2px);\n        }\n        .btn-secondary {\n            background-color: #475569;\n            transition: all 0.2s ease;\n        }\n        .btn-secondary:hover {\n            background-color: #334155;\n            transform: translateY(-2px);\n        }\n        .progress-bar {\n            height: 8px;\n            background-color: #475569;\n            border-radius: 9999px;\n            overflow: hidden;\n        }\n        .progress-fill {\n            height: 100%;\n            border-radius: 9999px;\n            transition: width 1s ease;\n        }\n        .xp-animation {\n            animation: pulse 2s infinite;\n        }\n        @keyframes pulse {\n            0% { transform: scale(1); }\n            50% { transform: scale(1.05); }\n            100% { transform: scale(1); }\n        }\n        .result-badge {\n            padding: 0.25rem 0.75rem;\n            border-radius: 9999px;\n            font-weight: 600;\n            font-size: 0.875rem;\n        }\n        .result-badge.success {\n            background-color: #10b981;\n            color: white;\n        }\n        .result-badge.warning {\n            background-color: #f59e0b;\n            color: white;\n        }\n        .result-badge.error {\n            background-color: #ef4444;\n            color: white;\n        }\n        .tab-active {\n            border-bottom: 2px solid #3b82f6;\n            color: #3b82f6;\n        }\n        .confetti {\n            position: absolute;\n            width: 10px;\n            height: 10px;\n            background-color: #f00;\n            border-radius: 50%;\n            animation: fall 5s ease-out forwards;\n        }\n        @keyframes fall {\n            0% { transform: translateY(-100vh) rotate(0deg); opacity: 1; }\n            50% { transform: translateY(100vh) rotate(360deg); opacity: 0; }\n            100% { transform: translateY(100vh) rotate(360deg); opacity: 0; }\n        }\n    " }} />
      <div className="min-h-screen flex flex-col">
        {/* Header */}
      <header className="bg-gray-800 text-white shadow-lg">
          <div className="container mx-auto px-4 py-3 flex justify-between items-center">
              <div className="flex items-center">
                  <h1 className="logo-text text-3xl mr-8">COBY</h1>
                  <nav className="hidden md:flex space-x-6">
                  </nav>
              </div>
              <div className="flex items-center space-x-4">
                  <button className="p-2 rounded-full hover:bg-gray-700 transition-colors">
                      <i className="fas fa-user-circle text-xl"></i>
                  </button>
              </div>
          </div>
      </header>
        <main className="flex-1 p-6 flex flex-col">
          <div className="flex gap-6 flex-1">
            
            {/* 왼쪽: 문제,풀이, PlayerCard */}
            <div className="w-2/3 flex flex-col">
              
              <div className="flex flex-row">
                {/* 문제 */}
                <div>
                    <h3 className="text-xl font-bold bg-slate-700 p-3 rounded-lg">문제: 두 수의 합</h3>
                
                </div>


                {/* 유저가 작성한 코드 */}
                <div className="result-card p-6 mb-6 max-h-[395px] overflow-y-auto pr-2">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-bold bg-slate-700 p-3 rounded-lg">문제: 두 수의 합</h3>
                    <div className="grid grid-cols-4 gap-4 text-center">
                        <div className="bg-slate-700 p-3 rounded-lg">
                          <div className="text-sm text-gray-400">실행 시간: 56ms</div>
                        </div>
                        <div className="bg-slate-700 p-3 rounded-lg">
                          <div className="text-sm text-gray-400">메모리 사용 : 42.5MB</div>
                        </div>
                        <div className="bg-slate-700 p-3 rounded-lg">
                          <div className="text-sm text-gray-400">테스트 케이스 : 23/23</div>
                        </div>
                        <div className="bg-slate-700 p-3 rounded-lg">
                          <div className="text-sm text-gray-400">제출 시간 : 12:24</div>
                        </div>
                    </div>
                    <div className="result-badge success">정답</div>
                  </div>
                  
                  <div className="mb-6">
                    <div className="mt-4">
                        <div className="code-block p-4 text-sm">
                          <pre>
                            <code>
                              {`
                            1
                            2
                            3
                            4
                            5
                            6
                            7
                            8
                            9
                            10
                            11
                            12
                            13
                            14
                            15
                            16
                            
                            `}
                            </code>
                          </pre>
                        </div>
                    </div>
                      
                  </div>
                </div>

              </div>
              
              <div className="grid grid-cols-4 gap-2">
                  {players.map((player) => (
                      <PlayerCard
                          key={player.name}
                          player={player}
                          handlePlayerCardClick={player.isEmpty ? null : handlePlayerCardClick}
                      />
                  ))}
              </div>
                
  
            </div>

            
            {/* 오른쪽: 채팅 및 경험치 */}
            <div className="w-1/3 flex flex-col">
              {/* ChatWindow 컴포넌트 사용 */}
              <div className="mb-6">
                <ChatWindow/>
              </div>

              <div className="result-card p-6 relative overflow-hidden">
                <div className="flex space-x-4">
                  <button className="btn-primary flex-1 py-3 px-4 rounded-lg font-bold text-white flex items-center justify-center" onClick={regameBtn}>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                    </svg>
                    재대결 시작
                  </button>
                  <button className="btn-secondary flex-1 py-3 px-4 rounded-lg font-bold text-white flex items-center justify-center" onClick={quickRoomBtn}>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clipRule="evenodd" />
                    </svg>
                    방 나가기
                  </button>
                </div>
                <div id="confetti-container" />
              </div>
            </div>
          </div>
        </main>

        {/* PlayerInfoModal 추가 */}
        <PlayerInfoModal
          showModal={showPlayerInfoModal}
          onClose={() => setShowPlayerInfoModal(false)}
          playerData={playerInfoForModal}
          selectedPlayerName={selectedPlayer ? selectedPlayer.name : ''}
        />

        {notification && (
        <ToastNotification
            message={notification.message}
            type={notification.type}
            onClose={() => setNotification(null)}
        />
      )}

        {/* Context Menu 추가 */}
        {showContextMenu && selectedPlayer && (
          <div
            ref={contextMenuRef}
            className="waitingRoom-glass-effect custom-context-menu absolute rounded-lg shadow-lg py-2 z-50 bg-slate-700 text-white"
            style={{ top: contextMenuPos.y, left: contextMenuPos.x }}
          >
            <ul className="text-sm">
              <li
                className="px-4 py-2 hover:bg-blue-700 cursor-pointer"
                onClick={() => {
                  const fullPlayer = users.find(user => user.nickname === selectedPlayer.name);
                  if (fullPlayer) {
                    setPlayerInfoForModal(fullPlayer);
                    setShowPlayerInfoModal(true);
                  }
                  setShowContextMenu(false);
                }}
              >
                정보 보기
              </li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

export default ResultRoom;