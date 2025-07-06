import React, { useState, useEffect, useRef } from 'react';
import './ResultRoom.css';
import { useNavigate } from 'react-router-dom';
import ChatWindow from './components/ChatWindow'; // ChatWindow 컴포넌트 임포트
import useContextMenu from './hooks/useContextMenu'; // useContextMenu 훅 임포트
import PlayerInfoModal from './components/PlayerInfoModal'; // PlayerInfoModal 컴포넌트 임포트
import { useWebSocket } from '../WebSocket/WebSocketContext';
import ToastNotification from './components/ToastNotification';

function ResultRoom() {
  const navigate = useNavigate();
  const { messages, sendMessage, isConnected, error } = useWebSocket();
  const [notification, setNotification] = useState(null);

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
  
  // Use the sendMessage function from the context
  const handleSendMessage = (newMessage) => {
    const messageData = {
      // UID : 1,
      sender: currentUser,
      // avatarInitials: playerData[currentUser]?.avatar,
      // avatarColor: playerData[currentUser]?.avatarColor,
      profileUrl: 'https://example.com/avatars/user1.jpg',
      text: newMessage,
    };
    sendMessage(messageData); // Call the context's sendMessage
  };

  // 현재 사용자 정보
  const currentUser = "코딩마스터";

  // 플레이어 정보 데이터 (대기방과 동일)
  const playerData = {
    '사용자1': {
      avatar: 'KM',
      avatarColor: 'bg-red-500',
      tier: '마스터',
      level: 42,
      winRate: '92%',
      wins: 138,
      losses: 12,
      preferredTypes: {
        '알고리즘': 45,
        '자료구조': 30,
        'SQL': 10,
        '동적계획법': 15
      },
      recentGames: [
        { name: '알고리즘 배틀 #128', time: '2시간 전', result: '승리' },
        { name: '자료구조 마스터 #45', time: '어제', result: '승리' },
        { name: 'SQL 챌린지 #12', time: '2일 전', result: '승리' }
      ]
    },
    '사용자2': {
      avatar: 'JH',
      avatarColor: 'bg-yellow-500',
      tier: '마스터',
      level: 39,
      winRate: '89%',
      wins: 125,
      losses: 15,
      preferredTypes: {
        '알고리즘': 60,
        '자료구조': 20,
        'SQL': 5,
        '동적계획법': 15
      },
      recentGames: [
        { name: '알고리즘 배틀 #128', time: '2시간 전', result: '패배' },
        { name: '자료구조 마스터 #45', time: '어제', result: '승리' },
        { name: 'SQL 챌린지 #12', time: '2일 전', result: '승리' }
      ]
    },
    '코딩마스터': {
      avatar: 'CM',
      avatarColor: 'bg-green-500',
      tier: '다이아',
      level: 28,
      winRate: '78%',
      wins: 45,
      losses: 13,
      preferredTypes: {
        '알고리즘': 30,
        '자료구조': 40,
        'SQL': 20,
        '동적계획법': 10
      },
      recentGames: [
        { name: '알고리즘 배틀 #128', time: '2시간 전', result: '승리' },
        { name: '자료구조 마스터 #45', time: '어제', result: '승리' },
        { name: 'SQL 챌린지 #12', time: '2일 전', result: '패배' }
      ]
    },
    '사용자3': {
      avatar: 'PK',
      avatarColor: 'bg-purple-500',
      tier: '다이아',
      level: 31,
      winRate: '80%',
      wins: 80,
      losses: 20,
      preferredTypes: {
        '알고리즘': 25,
        '자료구조': 25,
        'SQL': 25,
        '동적계획법': 25
      },
      recentGames: [
        { name: '알고리즘 배틀 #128', time: '2시간 전', result: '승리' },
        { name: '자료구조 마스터 #45', time: '어제', result: '패배' },
        { name: 'SQL 챌린지 #12', time: '2일 전', result: '승리' }
      ]
    }
  };

  // 플레이어 정보 모달 관련 상태
  const [showPlayerInfoModal, setShowPlayerInfoModal] = useState(false);
  const [playerInfoForModal, setPlayerInfoForModal] = useState(null);
  const [activeTab, setActiveTab] =useState('myCode');
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
    navigate('/mainpage');
  };

  const regameBtn = () => {
    alert('재대결을 준비하세요');
    navigate('/waitingRoom');
  };


  return (
    <div className='resultroom'>
      <meta charSet="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>코딩 대결 - 게임 종료</title>
      <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@400;500;700&display=swap" rel="stylesheet" />
      <style dangerouslySetInnerHTML={{ __html: "\n        body {\n            font-family: 'Noto Sans KR', sans-serif;\n            background-color: #0f172a;\n            color: #f8fafc;\n        }\n        .card {\n            background-color: #1e293b;\n            border-radius: 0.75rem;\n            box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);\n        }\n        .code-block {\n            background-color: #0f172a;\n            border-radius: 0.5rem;\n            font-family: monospace;\n            overflow-x: auto;\n        }\n        .chat-container {\n            height: 400px;\n            overflow-y: auto;\n            scrollbar-width: thin;\n            scrollbar-color: #475569 #1e293b;\n        }\n        .chat-container::-webkit-scrollbar {\n            width: 8px;\n        }\n        .chat-container::-webkit-scrollbar-track {\n            background: #1e293b;\n        }\n        .chat-container::-webkit-scrollbar-thumb {\n            background-color: #475569;\n            border-radius: 20px;\n        }\n        .chat-message {\n            border-radius: 1rem;\n            max-width: 80%;\n        }\n        .chat-message.mine {\n            background-color: #3b82f6;\n            margin-left: auto;\n        }\n        .chat-message.others {\n            background-color: #334155;\n        }\n        .player-avatar {\n            width: 2rem;\n            height: 2rem;\n            border-radius: 50%;\n            display: flex;\n            align-items: center;\n            justify-content: center;\n            font-weight: bold;\n        }\n        .btn-primary {\n            background-color: #3b82f6;\n            transition: all 0.2s ease;\n        }\n        .btn-primary:hover {\n            background-color: #2563eb;\n            transform: translateY(-2px);\n        }\n        .btn-secondary {\n            background-color: #475569;\n            transition: all 0.2s ease;\n        }\n        .btn-secondary:hover {\n            background-color: #334155;\n            transform: translateY(-2px);\n        }\n        .progress-bar {\n            height: 8px;\n            background-color: #475569;\n            border-radius: 9999px;\n            overflow: hidden;\n        }\n        .progress-fill {\n            height: 100%;\n            border-radius: 9999px;\n            transition: width 1s ease;\n        }\n        .xp-animation {\n            animation: pulse 2s infinite;\n        }\n        @keyframes pulse {\n            0% { transform: scale(1); }\n            50% { transform: scale(1.05); }\n            100% { transform: scale(1); }\n        }\n        .result-badge {\n            padding: 0.25rem 0.75rem;\n            border-radius: 9999px;\n            font-weight: 600;\n            font-size: 0.875rem;\n        }\n        .result-badge.success {\n            background-color: #10b981;\n            color: white;\n        }\n        .result-badge.warning {\n            background-color: #f59e0b;\n            color: white;\n        }\n        .result-badge.error {\n            background-color: #ef4444;\n            color: white;\n        }\n        .tab-active {\n            border-bottom: 2px solid #3b82f6;\n            color: #3b82f6;\n        }\n        .confetti {\n            position: absolute;\n            width: 10px;\n            height: 10px;\n            background-color: #f00;\n            border-radius: 50%;\n            animation: fall 5s ease-out forwards;\n        }\n        @keyframes fall {\n            0% { transform: translateY(-100vh) rotate(0deg); opacity: 1; }\n            100% { transform: translateY(100vh) rotate(360deg); opacity: 0; }\n        }\n    " }} />
      <div className="min-h-screen flex flex-col">
        <header className="bg-slate-800 py-4 px-6 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-500" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M12.316 3.051a1 1 0 01.633 1.265l-4 12a1 1 0 11-1.898-.632l4-12a1 1 0 011.265-.633zM5.707 6.293a1 1 0 010 1.414L3.414 10l2.293 2.293a1 1 0 11-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0zm8.586 0a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 11-1.414-1.414L16.586 10l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
            <h1 className="text-xl font-bold">코딩 대결</h1>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-400">방 ID: ABCD1234</span>
            <div className="flex items-center ml-4">
              <div className="player-avatar bg-green-500 text-white">CM</div>
              <div className="ml-2">
                <div className="text-sm font-medium">코딩마스터</div>
              </div>
            </div>
          </div>
        </header>
        <main className="flex-1 p-6 flex flex-col">
          <div className="mb-6 text-center">
            <h2 className="text-3xl font-bold mb-2">게임 종료!</h2>
            <p className="text-gray-400">모든 참가자가 문제 풀이를 완료했습니다.</p>
          </div>
          <div className="flex gap-6 flex-1">
            {/* 왼쪽: 문제 풀이 결과 */}
            <div className="w-3/5 flex flex-col">
              <div className="card p-6 mb-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-bold">문제: 두 수의 합</h3>
                  <div className="result-badge success">정답</div>
                </div>
                <div className="mb-6">
                  <h4 className="font-medium mb-2">채점 결과</h4>
                  <div className="grid grid-cols-4 gap-4 text-center">
                    <div className="bg-slate-700 p-3 rounded-lg">
                      <div className="text-sm text-gray-400">실행 시간</div>
                      <div className="font-bold">56ms</div>
                      <div className="text-xs text-green-400">상위 85%</div>
                    </div>
                    <div className="bg-slate-700 p-3 rounded-lg">
                      <div className="text-sm text-gray-400">메모리 사용</div>
                      <div className="font-bold">42.5MB</div>
                      <div className="text-xs text-green-400">상위 70%</div>
                    </div>
                    <div className="bg-slate-700 p-3 rounded-lg">
                      <div className="text-sm text-gray-400">테스트 케이스</div>
                      <div className="font-bold">23/23</div>
                      <div className="text-xs text-green-400">100% 통과</div>
                    </div>
                    <div className="bg-slate-700 p-3 rounded-lg">
                      <div className="text-sm text-gray-400">제출 시간</div>
                      <div className="font-bold">12:24</div>
                      <div className="text-xs text-blue-400">2등</div>
                    </div>
                  </div>
                </div>
                <div className="mb-6">
                  <div className="flex space-x-4 border-b border-slate-700">
                  <button
                      className={`py-2 px-4 ${activeTab === 'myCode' ? 'tab-active' : 'text-gray-400'}`}
                      onClick={() => setActiveTab('myCode')}
                    >
                      내 코드
                    </button>
                    <button
                      className={`py-2 px-4 ${activeTab === 'solution' ? 'tab-active' : 'text-gray-400'}`}
                      onClick={() => setActiveTab('solution')}
                    >
                      모범 답안
                    </button>
                    <button
                      className={`py-2 px-4 ${activeTab === 'explanation' ? 'tab-active' : 'text-gray-400'}`}
                      onClick={() => setActiveTab('explanation')}
                    >
                      문제 해설
                    </button>
                  </div>
                  <div className="mt-4">
                    {activeTab === 'myCode' && (
                      <div className="code-block p-4 text-sm">
                        <pre>
                          <code>
                            {`
                          /**
                           * @param {number[]} nums
                           * @param {number} target
                           * @return {number[]}
                           */
                          var twoSum = function(nums, target) {
                              const map = new Map();

                              for (let i = 0; i < nums.length; i++) {
                                  const complement = target - nums[i];
                                  if (map.has(complement)) {
                                      return [map.get(complement), i];
                                  }
                                  map.set(nums[i], i);
                              }
                          };
                          `}
                          </code>
                        </pre>
                      </div>
                    )}
                    {activeTab === 'solution' && (
                      <div className="code-block p-4 text-sm bg-blue-900 bg-opacity-30"> {/* 모범 답안 스타일 예시 */}
                        <pre>
                          <code>
                            {`
                          // 모범 답안 내용 (예시)
                          // 더 효율적이거나 다른 방식의 풀이
                          function optimizedTwoSum(nums, target) {
                              const seen = new Map();
                              for (let i = 0; i < nums.length; i++) {
                                  const complement = target - nums[i];
                                  if (seen.has(complement)) {
                                      return [seen.get(complement), i];
                                  }
                                  seen.set(nums[i], i);
                              }
                              return []; // 예외 처리
                          }
                          `}
                          </code>
                        </pre>
                      </div>
                    )}
                    {activeTab === 'explanation' && (
                      <div className="explanation-block p-4 text-sm bg-gray-700 text-gray-200"> {/* 문제 해설 스타일 예시 */}
                        <p className="mb-2">
                          이 문제는 배열에서 두 숫자의 합이 특정 대상 값과 일치하는 인덱스를 찾는 것입니다.
                          가장 효율적인 방법은 **해시 맵(Map 또는 Dictionary)**을 사용하는 것입니다.
                        </p>
                        <p className="mb-2">
                          배열을 한 번 순회하면서 각 숫자에 대해 `target - 현재숫자`를 계산합니다.
                          이 `complement` 값이 이미 해시 맵에 있는지 확인하고, 있다면 두 숫자를 찾은 것이므로 해당 인덱스를 반환합니다.
                          만약 없다면 현재 숫자를 해시 맵에 저장합니다.
                        </p>
                        <p>
                          시간 복잡도는 O(n)이며, 공간 복잡도는 O(n)입니다.
                        </p>
                      </div>
                    )}
                  </div>
                
                
                </div>
                <div>
                  <h4 className="font-medium mb-2">성능 분석</h4>
                  <p className="text-sm text-gray-300 mb-4">
                    해시맵을 사용한 O(n) 시간 복잡도 솔루션입니다. 배열을 한 번만 순회하므로 효율적입니다.
                    메모리 사용량은 평균보다 약간 높지만 허용 범위 내입니다.
                  </p>
                  <div className="flex space-x-4">
                    <div className="flex-1">
                      <div className="flex justify-between text-xs mb-1">
                        <span>시간 복잡도</span>
                        <span className="text-green-400">매우 좋음</span>
                      </div>
                      <div className="progress-bar">
                        <div className="progress-fill bg-green-500" style={{ width: '85%' }} />
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between text-xs mb-1">
                        <span>공간 복잡도</span>
                        <span className="text-yellow-400">양호</span>
                      </div>
                      <div className="progress-bar">
                        <div className="progress-fill bg-yellow-500" style={{ width: '70%' }} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="card p-6">
                <h3 className="text-xl font-bold mb-4">최종 순위</h3>
                <div className="overflow-hidden rounded-lg">
                  <table className="min-w-full">
                    <thead className="bg-slate-800">
                      <tr>
                        <th className="py-3 px-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">순위</th>
                        <th className="py-3 px-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">참가자</th>
                        <th className="py-3 px-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">제출 시간</th>
                        <th className="py-3 px-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">실행 시간</th>
                        <th className="py-3 px-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">결과</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-700">
                      <tr className="bg-slate-700 bg-opacity-30 cursor-pointer hover:bg-slate-600"
                          onClick={(e) => handlePlayerCardClick(e, { name: '사용자1' })}
                          onContextMenu={(e) => handlePlayerCardClick(e, { name: '사용자1' })}>
                        <td className="py-3 px-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <span className="text-yellow-500">1</span>
                          </div>
                        </td>
                        <td className="py-3 px-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="player-avatar bg-red-500 text-white">KM</div>
                            <div className="ml-2">사용자1</div>
                          </div>
                        </td>
                        <td className="py-3 px-4 whitespace-nowrap">11:45</td>
                        <td className="py-3 px-4 whitespace-nowrap">48ms</td>
                        <td className="py-3 px-4 whitespace-nowrap">
                          <span className="result-badge success">정답</span>
                        </td>
                      </tr>
                      <tr className="bg-blue-900 bg-opacity-20 cursor-pointer hover:bg-blue-800"
                          onClick={(e) => handlePlayerCardClick(e, { name: '코딩마스터' })}
                          onContextMenu={(e) => handlePlayerCardClick(e, { name: '코딩마스터' })}>
                        <td className="py-3 px-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <span className="text-gray-300">2</span>
                          </div>
                        </td>
                        <td className="py-3 px-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="player-avatar bg-green-500 text-white">CM</div>
                            <div className="ml-2">코딩마스터</div>
                          </div>
                        </td>
                        <td className="py-3 px-4 whitespace-nowrap">12:24</td>
                        <td className="py-3 px-4 whitespace-nowrap">56ms</td>
                        <td className="py-3 px-4 whitespace-nowrap">
                          <span className="result-badge success">정답</span>
                        </td>
                      </tr>
                      <tr className="cursor-pointer hover:bg-slate-700"
                          onClick={(e) => handlePlayerCardClick(e, { name: '사용자2' })}
                          onContextMenu={(e) => handlePlayerCardClick(e, { name: '사용자2' })}>
                        <td className="py-3 px-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <span className="text-gray-400">3</span>
                          </div>
                        </td>
                        <td className="py-3 px-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="player-avatar bg-yellow-500 text-white">JH</div>
                            <div className="ml-2">사용자2</div>
                          </div>
                        </td>
                        <td className="py-3 px-4 whitespace-nowrap">13:10</td>
                        <td className="py-3 px-4 whitespace-nowrap">62ms</td>
                        <td className="py-3 px-4 whitespace-nowrap">
                          <span className="result-badge success">정답</span>
                        </td>
                      </tr>
                      <tr className="cursor-pointer hover:bg-slate-700"
                          onClick={(e) => handlePlayerCardClick(e, { name: '사용자3' })}
                          onContextMenu={(e) => handlePlayerCardClick(e, { name: '사용자3' })}>
                        <td className="py-3 px-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <span className="text-gray-400">4</span>
                          </div>
                        </td>
                        <td className="py-3 px-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="player-avatar bg-purple-500 text-white">PK</div>
                            <div className="ml-2">사용자3</div>
                          </div>
                        </td>
                        <td className="py-3 px-4 whitespace-nowrap">14:30</td>
                        <td className="py-3 px-4 whitespace-nowrap">120ms</td>
                        <td className="py-3 px-4 whitespace-nowrap">
                          <span className="result-badge warning">부분 정답</span>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
            {/* 오른쪽: 채팅 및 경험치 */}
            <div className="w-2/5 flex flex-col">
              {/* ChatWindow 컴포넌트 사용 */}
              <div className="mb-6">
                <ChatWindow
                  messages={messages}
                  onSendMessage={handleSendMessage}
                  currentUser={currentUser}
                  playerData={playerData}
                  title="게임 후 채팅" // 제목을 게임 후 채팅으로 변경
                />
              </div>

              <div className="card p-6 relative overflow-hidden">
                <div className="mb-6">
                  <h3 className="text-xl font-bold mb-4">획득한 보상</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-slate-700 p-4 rounded-lg flex items-center">
                      <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center mr-3">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                      </div>
                      <div>
                        <div className="text-sm text-gray-400">경험치</div>
                        <div className="font-bold text-xl xp-animation">+120 XP</div>
                      </div>
                    </div>
                    <div className="bg-slate-700 p-4 rounded-lg flex items-center">
                      <div className="w-12 h-12 bg-yellow-500 rounded-full flex items-center justify-center mr-3">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div>
                        <div className="text-sm text-gray-400">코인</div>
                        <div className="font-bold text-xl">+50 코인</div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="mb-6">
                  <h4 className="font-medium mb-2">레벨 진행도</h4>
                  <div className="flex items-center mb-2">
                    <span className="text-lg font-bold mr-2">Lv. 15</span>
                    <div className="flex-1 progress-bar mx-2">
                      <div className="progress-fill bg-blue-500" style={{ width: '75%' }} />
                    </div>
                    <span className="text-lg font-bold ml-2">Lv. 16</span>
                  </div>
                  <div className="text-center text-sm text-gray-400">
                    다음 레벨까지 280 XP 남음
                  </div>
                </div>
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
                  const fullPlayer = playerData[selectedPlayer.name];
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