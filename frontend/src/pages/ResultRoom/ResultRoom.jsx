import React, { useState, useEffect, useRef } from 'react';
import './ResultRoom.css';
import { useNavigate, useParams } from 'react-router-dom';
import FloatingChat from '../../Common/components/FloatingChat';
import useContextMenu from '../../Common/hooks/useContextMenu';
import PlayerInfoModal from '../../Common/components/PlayerInfoModal';
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

  useEffect(() => {
    if (isConnected) {
      setNotification({ message: "채팅 서버에 연결되었습니다.", type: "success" });
    } else if (error) {
      setNotification({ message: error, type: "error" });
    } else {
      setNotification({ message: "채팅 서버와 연결이 끊어졌습니다.", type: "error" });
    }
    const timer = setTimeout(() => setNotification(null), 3000);
    return () => clearTimeout(timer);
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
  

  const [showPlayerInfoModal, setShowPlayerInfoModal] = useState(false);
  const [playerInfoForModal, setPlayerInfoForModal] = useState(null);

  const {
    showContextMenu,
    contextMenuPos,
    selectedPlayer,
    contextMenuRef,
    handlePlayerCardClick,
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
        avatarColor: 'bg-blue-700',
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
      <FloatingChat />
      <meta charSet="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>COBY - 결과</title>
      <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@400;500;700&display=swap" rel="stylesheet" />
      <style dangerouslySetInnerHTML={{ __html: `
        body {
            font-family: 'Noto Sans KR', sans-serif;
            background-color: #0f172a;
            color: #f8fafc;
        }
        .result-card {
            background-color: #1e293b;
            border-radius: 0.75rem;
        }
        .code-block {
            background-color: #0f172a;
            border-radius: 0.5rem;
            font-family: monospace;
            overflow-x: auto;
        }
        .result-badge {
            padding: 0.25rem 0.75rem; border-radius: 9999px;
            font-weight: 600; font-size: 0.875rem;
        }
        .result-badge.success { background-color: #10b981; color: white; }

        /* --- 버튼 애니메이션 스타일 시작 --- */
        .btn-animated {
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 0.75rem; /* 12px */
            border-radius: 9999px; /* pill shape */
            font-weight: bold;
            color: white;
            cursor: pointer;
            overflow: hidden;
            width: 52px; /* 아이콘만 보이도록 초기 너비 고정 (12*2 + 28px) */
            height: 52px;
            transition: width 0.4s ease-in-out;
        }
        .btn-animated.rematch { background-color: #3b82f6; }
        .btn-animated.rematch:hover { background-color: #2563eb; }
        .btn-animated.exit { background-color: #475569; }
        .btn-animated.exit:hover { background-color: #334155; }
        
        .btn-animated-text {
            white-space: nowrap;
            opacity: 0;
            width: 0;
            margin-left: 0;
            transition: opacity 0.3s ease-in-out, width 0.3s ease-in-out, margin-left 0.3s ease-in-out;
        }
        
        .btn-animated:hover {
            width: 160px; /* 확장 시 너비 */
        }

        .btn-animated:hover .btn-animated-text {
            opacity: 1;
            width: auto; /* auto로 설정하여 내용에 맞게 너비 조절 */
            margin-left: 0.5rem; /* 8px */
        }
        /* --- 버튼 애니메이션 스타일 끝 --- */

      ` }} />
      <div className="min-h-screen flex flex-col">
        {/* Header */}
        <header className="bg-gray-800 text-white shadow-lg">
            <div className="container mx-auto px-4 py-3 flex justify-between items-center">
                <div className="flex items-center">
                    <h1 className="logo-text text-3xl mr-8">COBY</h1>
                </div>
                {/* 헤더 오른쪽 영역: 버튼들을 이곳으로 이동 */}
                <div className="flex items-center space-x-4">
                    {/* 재대결 버튼 */}
                    <button className="btn-animated rematch" onClick={regameBtn}>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                      </svg>
                      <span className="btn-animated-text">재대결</span>
                    </button>
                    {/* 방 나가기 버튼 */}
                    <button className="btn-animated exit" onClick={quickRoomBtn}>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clipRule="evenodd" />
                      </svg>
                      <span className="btn-animated-text">방 나가기</span>
                    </button>
                    {/* 기존 유저 아이콘 버튼 */}
                    <button className="p-2 rounded-full hover:bg-gray-700 transition-colors">
                        <i className="fas fa-user-circle text-xl"></i>
                    </button>
                </div>
            </div>
        </header>
        
        {/* Main Content: 3단 구조로 변경 */}
        <main className="flex-1 p-6 flex justify-center">
          <div className="w-full flex flex-row gap-6">

            {/* 왼쪽 열: 플레이어 카드 (너비 1/4) */}
            <div className="w-1/4 flex flex-col gap-4">
              {/* 플레이어 카드 */}
              <div className="grid grid-cols-1 gap-2">
                  {players.map((player) => (
                      <PlayerCard
                          key={player.name}
                          player={player}
                          handlePlayerCardClick={player.isEmpty ? null : handlePlayerCardClick}
                      />
                  ))}
              </div>
              
              {/* 버튼들이 있던 자리는 비워짐 */}
            </div>
            
            {/* 중간 열: 문제 설명 (너비 1/2) */}
            <div className="w-1/2">
              <div className="result-card p-6 h-full flex flex-col">
                <h3 className="text-xl font-bold mb-4">문제: 두 수의 합</h3>
                <div className="text-gray-300 space-y-4">
                  <p>
                    정수 배열 `nums`와 정수 `target`이 주어집니다. `nums`의 두 원소를 더해 `target`을 만들 수 있는 인덱스를 찾아 반환하세요.
                  </p>
                  <p>
                    각 입력에 정확히 하나의 정답이 있다고 가정하며, 동일한 원소를 두 번 사용할 수 없습니다. 답은 어떤 순서로든 반환할 수 있습니다.
                  </p>
                  <div>
                    <h4 className="font-semibold text-white mb-2">예시:</h4>
                    <div className="code-block p-3 text-sm">
                      <p className='mb-2'><span className="font-bold">Input:</span> nums = [2, 7, 11, 15], target = 9</p>
                      <p><span className="font-bold">Output:</span> [0, 1]</p>
                      <p className='mt-2'><span className="text-gray-400">// nums[0] + nums[1] == 9 이므로 [0, 1]을 반환합니다.</span></p>
                    </div>
                  </div>
                   <div>
                    <h4 className="font-semibold text-white mb-2">제약 조건:</h4>
                    <ul className="list-disc list-inside text-sm text-gray-400">
                        <li>`2 &lt;= nums.length &lt;= 10^4`</li>
                        <li>`-10^9 &lt;= nums[i] &lt;= 10^9`</li>
                        <li>`-10^9 &lt;= target &lt;= 10^9`</li>
                        <li>유효한 정답은 하나만 존재합니다.</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* 오른쪽 열: 유저가 작성한 코드 (너비 1/4) */}
            <div className="w-1/2">
              <div className="result-card p-6 h-full flex flex-col">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-bold">내 제출</h3>
                  <div className="result-badge success">정답</div>
                </div>
                <div className="grid grid-cols-2 gap-2 text-center text-xs mb-4">
                    <div className="bg-slate-700 p-2 rounded-lg"><div>실행 시간<br/>56ms</div></div>
                    <div className="bg-slate-700 p-2 rounded-lg"><div>메모리<br/>42.5MB</div></div>
                    <div className="bg-slate-700 p-2 rounded-lg"><div>테스트<br/>23/23</div></div>
                    <div className="bg-slate-700 p-2 rounded-lg"><div>제출 시간<br/>12:24</div></div>
                </div>
                <div className="code-block p-4 text-sm flex-1"><pre><code>{`
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
                  17
                  18
                  19
                  20
                  21
                  22
                  23
                  24
                `}</code></pre></div>
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