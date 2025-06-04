import React from 'react';
import './WaitingRoom.css';
import { useNavigate } from 'react-router-dom';

function WaitingRoom() {
  const navigate = useNavigate();

  const enterRoomBtn1 = () => {
    alert('방에 입장합니다!');
    navigate('/gamepage');
  };
  const quickbtn = () => {
    alert('방에서 나갑니다');
    navigate('/nickname');
  };
  return (
    <div className="WaitingRoom">
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
      <main className="container mx-auto px-4 py-6">
        <div className="waitingRoom-glass-effect rounded-xl p-6 mb-6">
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
              <button id="startGameBtn" className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center transition" onClick={enterRoomBtn1}>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                </svg>
                게임 시작
              </button>
            </div>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* 좌측: 방 정보 및 공지사항 */}
            <div className="lg:col-span-1">
              {/* 방 상세 정보 */}
              <div className="waitingRoom-glass-effect rounded-lg p-4 mb-6">
                <h3 className="text-lg font-semibold text-white mb-3 flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z" />
                  </svg>
                  문제 정보
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-blue-300">문제 유형:</span>
                    <span className="text-white font-medium">알고리즘</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-blue-300">난이도:</span>
                    <span className="text-yellow-400 font-medium">보통</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-blue-300">문제 수:</span>
                    <span className="text-white font-medium">3문제</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-blue-300">제한 시간:</span>
                    <span className="text-white font-medium">30분</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-blue-300">최대 참가자:</span>
                    <span className="text-white font-medium">8명</span>
                  </div>
                </div>
              </div>
              {/* 공지사항 */}
              <div className="waitingRoom-glass-effect rounded-lg p-4">
                <h3 className="text-lg font-semibold text-white mb-3 flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 3a1 1 0 00-1.447-.894L8.763 6H5a3 3 0 000 6h.28l1.771 5.316A1 1 0 008 18h1a1 1 0 001-1v-4.382l6.553 3.276A1 1 0 0018 15V3z" clipRule="evenodd" />
                  </svg>
                  공지사항
                </h3>
                <div className="space-y-3">
                  <div className="waitingRoom-glass-effect rounded-lg p-3 border-l-4 border-blue-500">
                    <p className="text-sm text-white">모든 참가자가 준비 완료 후 방장이 게임을 시작합니다.</p>
                  </div>
                  <div className="waitingRoom-glass-effect rounded-lg p-3 border-l-4 border-yellow-500">
                    <p className="text-sm text-white">문제는 총 3문제이며, 난이도는 쉬움 1문제, 보통 1문제, 어려움 1문제로 구성됩니다.</p>
                  </div>
                  <div className="waitingRoom-glass-effect rounded-lg p-3 border-l-4 border-green-500">
                    <p className="text-sm text-white">모든 문제를 가장 빨리 해결한 참가자가 승리합니다.</p>
                  </div>
                </div>
              </div>
            </div>
            {/* 우측: 채팅 */}
            <div className="lg:col-span-2">
              <div className="waitingRoom-glass-effect rounded-lg p-4 h-full">
                <h3 className="text-lg font-semibold text-white mb-3 flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M2 5a2 2 0 012-2h7a2 2 0 012 2v4a2 2 0 01-2 2H9l-3 3v-3H4a2 2 0 01-2-2V5z" />
                    <path d="M15 7v2a4 4 0 01-4 4H9.828l-1.766 1.767c.28.149.599.233.938.233h2l3 3v-3h2a2 2 0 002-2V9a2 2 0 00-2-2h-1z" />
                  </svg>
                  채팅
                </h3>
                <div id="chatMessages" className=" h-[400px] flex-1 overflow-y-auto waitingRoom-custom-scrollbar space-y-3 mb-3">
                  <div className="flex items-start">
                    <div className="w-8 h-8 rounded-full bg-blue-700 flex items-center justify-center text-xs font-medium mr-2 flex-shrink-0">KM</div>
                    <div className="waitingRoom-chat-bubble waitingRoom-chat-bubble-left bg-blue-900/50 rounded-lg p-2 max-w-[80%]">
                      <p className="text-xs text-blue-300 mb-1">코딩의신</p>
                      <p className="text-sm text-white">안녕하세요! 다들 준비 되셨나요?</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="w-8 h-8 rounded-full bg-purple-700 flex items-center justify-center text-xs font-medium mr-2 flex-shrink-0">JH</div>
                    <div className="waitingRoom-chat-bubble waitingRoom-chat-bubble-left bg-blue-900/50 rounded-lg p-2 max-w-[80%]">
                      <p className="text-xs text-blue-300 mb-1">알고리즘킹</p>
                      <p className="text-sm text-white">네! 준비 완료했습니다.</p>
                    </div>
                  </div>
                  <div className="flex items-start justify-end">
                    <div className="waitingRoom-chat-bubble waitingRoom-chat-bubble-right bg-blue-600/50 rounded-lg p-2 max-w-[80%]">
                      <p className="text-xs text-blue-300 mb-1">코드마스터 (나)</p>
                      <p className="text-sm text-white">저도 준비됐어요! 그래프 알고리즘 좋아합니다.</p>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-green-700 flex items-center justify-center text-xs font-medium ml-2 flex-shrink-0">CM</div>
                  </div>
                  <div className="flex items-start">
                    <div className="w-8 h-8 rounded-full bg-yellow-700 flex items-center justify-center text-xs font-medium mr-2 flex-shrink-0">SJ</div>
                    <div className="waitingRoom-chat-bubble waitingRoom-chat-bubble-left bg-blue-900/50 rounded-lg p-2 max-w-[80%]">
                      <p className="text-xs text-blue-300 mb-1">코드닌자</p>
                      <p className="text-sm text-white">다익스트라 알고리즘 나오면 좋겠네요!</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="w-8 h-8 rounded-full bg-blue-700 flex items-center justify-center text-xs font-medium mr-2 flex-shrink-0">KM</div>
                    <div className="waitingRoom-chat-bubble waitingRoom-chat-bubble-left bg-blue-900/50 rounded-lg p-2 max-w-[80%]">
                      <p className="text-xs text-blue-300 mb-1">코딩의신</p>
                      <p className="text-sm text-white">모두 준비되면 시작하겠습니다. 아직 준비 안 된 분들은 준비 버튼 눌러주세요!</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="w-8 h-8 rounded-full bg-red-700 flex items-center justify-center text-xs font-medium mr-2 flex-shrink-0">PK</div>
                    <div className="waitingRoom-chat-bubble waitingRoom-chat-bubble-left bg-blue-900/50 rounded-lg p-2 max-w-[80%]">
                      <p className="text-xs text-blue-300 mb-1">프로그래머K</p>
                      <p className="text-sm text-white">잠시만요! 준비 중입니다.</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="w-8 h-8 rounded-full bg-red-700 flex items-center justify-center text-xs font-medium mr-2 flex-shrink-0">PK</div>
                    <div className="waitingRoom-typing-indicator p-2">
                      <span />
                      <span />
                      <span />
                    </div>
                  </div>
                </div>
                <div className="flex items-center">
                  <input type="text" id="chatInput" placeholder="메시지 입력..." className="bg-blue-900/30 text-white border border-blue-800 rounded-l-md px-3 py-2 text-sm flex-1 focus:outline-none focus:ring-1 focus:ring-blue-500" />
                  <button id="sendChat" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-r-md transition">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* 참가자 섹션 */}
        <section className="mb-8">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
              <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
            </svg>
            참가자 (5/8)
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-6">
            {/* 참가자 1 (방장) */}
            <div className="waitingRoom-player-card host waitingRoom-glass-effect rounded-xl p-4 flex flex-col items-center relative" data-player="코딩의신">
              <div className="waitingRoom-character mb-2">
                <div className="waitingRoom-character-emote">🏆</div>
                <div className="w-16 h-16 rounded-full bg-blue-700 flex items-center justify-center text-xl font-medium">KM</div>
              </div>
              <h3 className="font-medium text-white text-center">코딩의신</h3>
              <div className="flex items-center mt-1">
                <div className="waitingRoom-tier-badge w-6 h-6 rounded-full bg-blue-900 flex items-center justify-center mr-1">
                  <span className="text-[0.6rem] font-bold text-blue-200">마스터</span>
                </div>
                <span className="text-xs text-blue-300">Lv.42</span>
              </div>
              <div className="waitingRoom-player-ready">준비 완료</div>
            </div>
            {/* 참가자 2 */}
            <div className="waitingRoom-player-card waitingRoom-glass-effect rounded-xl p-4 flex flex-col items-center relative" data-player="알고리즘킹">
              <div className="waitingRoom-character mb-2">
                <div className="waitingRoom-character-emote">👍</div>
                <div className="w-16 h-16 rounded-full bg-purple-700 flex items-center justify-center text-xl font-medium">JH</div>
              </div>
              <h3 className="font-medium text-white text-center">알고리즘킹</h3>
              <div className="flex items-center mt-1">
                <div className="waitingRoom-tier-badge w-6 h-6 rounded-full bg-blue-900 flex items-center justify-center mr-1">
                  <span className="text-[0.6rem] font-bold text-blue-200">마스터</span>
                </div>
                <span className="text-xs text-blue-300">Lv.39</span>
              </div>
              <div className="waitingRoom-player-ready">준비 완료</div>
            </div>
            {/* 참가자 3 (나) */}
            <div className="waitingRoom-player-card waitingRoom-glass-effect rounded-xl p-4 flex flex-col items-center relative border-2 border-blue-500" data-player="코드마스터">
              <div className="waitingRoom-character mb-2">
                <div className="waitingRoom-character-emote">😎</div>
                <div className="w-16 h-16 rounded-full bg-green-700 flex items-center justify-center text-xl font-medium">CM</div>
              </div>
              <h3 className="font-medium text-white text-center">코드마스터</h3>
              <div className="flex items-center mt-1">
                <div className="waitingRoom-tier-badge w-6 h-6 rounded-full bg-blue-900 flex items-center justify-center mr-1">
                  <span className="text-[0.6rem] font-bold text-blue-200">다이아</span>
                </div>
                <span className="text-xs text-blue-300">Lv.28</span>
              </div>
              <div className="waitingRoom-player-ready">준비 완료</div>
            </div>
            {/* 참가자 4 */}
            <div className="waitingRoom-player-card waitingRoom-glass-effect rounded-xl p-4 flex flex-col items-center relative" data-player="코드닌자">
              <div className="waitingRoom-character mb-2">
                <div className="waitingRoom-character-emote">🥷</div>
                <div className="w-16 h-16 rounded-full bg-yellow-700 flex items-center justify-center text-xl font-medium">SJ</div>
              </div>
              <h3 className="font-medium text-white text-center">코드닌자</h3>
              <div className="flex items-center mt-1">
                <div className="waitingRoom-tier-badge w-6 h-6 rounded-full bg-blue-900 flex items-center justify-center mr-1">
                  <span className="text-[0.6rem] font-bold text-blue-200">다이아</span>
                </div>
                <span className="text-xs text-blue-300">Lv.31</span>
              </div>
              <div className="waitingRoom-player-ready">준비 완료</div>
            </div>
            {/* 참가자 5 */}
            <div className="waitingRoom-player-card waitingRoom-glass-effect rounded-xl p-4 flex flex-col items-center relative" data-player="프로그래머K">
              <div className="waitingRoom-character mb-2">
                <div className="w-16 h-16 rounded-full bg-red-700 flex items-center justify-center text-xl font-medium">PK</div>
              </div>
              <h3 className="font-medium text-white text-center">프로그래머K</h3>
              <div className="flex items-center mt-1">
                <div className="waitingRoom-tier-badge w-6 h-6 rounded-full bg-blue-900 flex items-center justify-center mr-1">
                  <span className="text-[0.6rem] font-bold text-blue-200">플래티넘</span>
                </div>
                <span className="text-xs text-blue-300">Lv.25</span>
              </div>
              <div className="waitingRoom-player-not-ready">대기 중</div>
            </div>
            {/* 빈 슬롯 1 */}
            <div className="waitingRoom-glass-effect rounded-xl p-4 flex flex-col items-center opacity-50">
              <div className="mb-2">
                <div className="w-16 h-16 rounded-full bg-gray-700 flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-500" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
              <h3 className="font-medium text-gray-400 text-center">빈 자리</h3>
            </div>
            {/* 빈 슬롯 2 */}
            <div className="waitingRoom-glass-effect rounded-xl p-4 flex flex-col items-center opacity-50">
              <div className="mb-2">
                <div className="w-16 h-16 rounded-full bg-gray-700 flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-500" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
              <h3 className="font-medium text-gray-400 text-center">빈 자리</h3>
            </div>
            {/* 빈 슬롯 3 */}
            <div className="waitingRoom-glass-effect rounded-xl p-4 flex flex-col items-center opacity-50">
              <div className="mb-2">
                <div className="w-16 h-16 rounded-full bg-gray-700 flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-500" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
              <h3 className="font-medium text-gray-400 text-center">빈 자리</h3>
            </div>
          </div>
        </section>
        <div className="flex justify-center">
          <button id="readyBtn" className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-lg flex items-center transition text-lg">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            준비 완료
          </button>
        </div>
      </main>
      {/* 플레이어 정보 모달 (TODO 패딩추가)*/}
      <div id="playerInfoModal" className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 hidden">
        <div className="waitingRoom-glass-effect rounded-xl w-full max-w-md p-6 waitingRoom-animate-fade-in">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-white">플레이어 정보</h2>
            <button id="closePlayerModal" className="text-blue-300 hover:text-white transition">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div className="flex items-center mb-4">
            <div className="waitingRoom-character mr-4">
              <div id="playerAvatar" className="w-16 h-16 rounded-full bg-blue-700 flex items-center justify-center text-xl font-medium">KM</div>
            </div>
            <div>
              <h3 id="playerName" className="text-lg font-bold text-white">코딩의신</h3>
              <div className="flex items-center">
                <div id="playerTier" className="waitingRoom-tier-badge w-6 h-6 rounded-full bg-blue-900 flex items-center justify-center mr-2">
                  <span className="text-[0.6rem] font-bold text-blue-200">마스터</span>
                </div>
                <span id="playerLevel" className="text-sm text-blue-300">Lv.42</span>
              </div>
            </div>
          </div>
          <div className="space-y-4">
            <div className="waitingRoom-glass-effect rounded-lg p-4">
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
            <button id="closeStartConfirmModal" className="text-blue-300 hover:text-white transition">
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