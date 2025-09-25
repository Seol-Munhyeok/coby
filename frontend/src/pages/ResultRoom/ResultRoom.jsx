import React, { useState, useEffect } from 'react';
import './ResultRoom.css';
import { useNavigate, useParams } from 'react-router-dom';
import FloatingChat from '../../Common/components/FloatingChat';
import useContextMenu from '../../Common/hooks/useContextMenu';
import PlayerInfoModal from '../../Common/components/PlayerInfoModal';
import { useWebSocket } from '../WebSocket/WebSocketContext';
import ToastNotification from '../../Common/components/ToastNotification';
import { useAuth } from '../AuthContext/AuthContext';
import PlayerCard from '../WaitingRoom/components/PlayerCard';
import axios from 'axios';

function ResultRoom() {
    const navigate = useNavigate();
    const { users, joinRoom, leaveRoom, isConnected, error, joinedRoomId } = useWebSocket();
    const [notification, setNotification] = useState(null);
    const { roomId } = useParams();
    const { user } = useAuth();

    const currentUser = user?.nickname || '게스트';
    const userId = user?.id || 0;

    // 코드 전체 화면 모달 상태
    const [isCodeModalOpen, setIsCodeModalOpen] = useState(false);
    const openCodeModal = () => setIsCodeModalOpen(true);
    const closeCodeModal = () => setIsCodeModalOpen(false);

    // 제출된 코드를 상수로 관리
    const [Code,setCode] = useState("NULL")
    const codeContent = `
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
  `;

    // 방 정보 상태와 로딩 상태를 관리합니다.
    const [roomDetails, setRoomDetails] = useState(null);
    const [loading, setLoading] = useState(true);
    const [problem, setProblem] = useState(null);
    const [winnerId, setWinnerId] = useState(null);
    const [submittedAt, setSubmittedAt] = useState(null);

    // 점수 애니메이션 트리거 상태 추가
    const [triggerScoreAnimation, setTriggerScoreAnimation] = useState(false);

    // 컨텍스트 메뉴 관련 훅
    const {
        showContextMenu,
        contextMenuPos,
        selectedPlayer,
        contextMenuRef,
        handlePlayerCardClick,
        setShowContextMenu,
    } = useContextMenu();


    // WebSocket 연결 상태에 따라 Toast 알림을 표시
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

    // 방 정보를 불러오는 useEffect 훅
    useEffect(() => {
        const fetchRoomAndProblemDetails = async () => {
            try {
                // 필수적인 방 정보와 문제 정보를 먼저 요청합니다.
                const roomResponse = await axios.get(`${process.env.REACT_APP_API_URL}/api/rooms/${roomId}`);
                setRoomDetails(roomResponse.data);
                setWinnerId(roomResponse.data.winnerId);
                setSubmittedAt(roomResponse.data.submittedAt);

                const problemResponse = await axios.get(`${process.env.REACT_APP_API_URL}/api/rooms/${roomId}/problem`);
                setProblem(problemResponse.data);

                // 승리자 코드는 필수가 아닐 수 있으므로 별도의 try-catch로 처리합니다.
                try {
                    const WinnerCode = await axios.get(`${process.env.REACT_APP_API_URL}/api/submissions/winnercode/${roomId}`);
                    setCode(WinnerCode.data);
                } catch (winnerCodeError) {
                    console.warn("승리자 코드를 불러오는 데 실패했습니다. 아직 승리자가 없을 수 있습니다.", winnerCodeError);
                    // 승리자 코드가 없을 경우, 사용자에게 안내 메시지를 표시합니다.
                    setCode({ code: "아직 승리자가 결정되지 않았습니다." });
                }

            } catch (err) {
                // 이 catch 블록은 이제 방 존재 여부 등 정말 치명적인 에러가 발생했을 때만 실행됩니다.
                console.error("방 정보를 가져오는 데 실패했습니다:", err);
                setNotification({ message: "방 정보를 불러올 수 없습니다.", type: "error" });
                setTimeout(() => setNotification(null), 3000);
                navigate('/mainpage');
            } finally {
                setLoading(false);
            }
        };
        if (roomId) {
            fetchRoomAndProblemDetails();
        }
    }, [roomId, navigate]);

    // WebSocket 방 참여 및 나가기
    useEffect(() => {
        if (isConnected && joinedRoomId !== roomId) {
            joinRoom(roomId, { userId, nickname: currentUser, profileUrl: '' });
        }
    }, [isConnected, roomId, currentUser, userId, joinRoom, joinedRoomId]);

    // 방 정보를 모두 불러온 후, 2초 뒤에 애니메이션 시작
    useEffect(() => {
        if (!loading && roomDetails) {
            const timer = setTimeout(() => {
                setTriggerScoreAnimation(true);
            }, 2000); // 2초 딜레이
            return () => clearTimeout(timer);
        }
    }, [loading, roomDetails]);


    const [showPlayerInfoModal, setShowPlayerInfoModal] = useState(false);
    const [playerInfoForModal, setPlayerInfoForModal] = useState(null);

    const quickRoomBtn = () => {
        alert('방에서 나갑니다!');
        leaveRoom(roomId, userId);
        navigate('/mainpage');
    };

    const regameBtn = async () => {
        if (!roomDetails) {
            alert('방 정보가 없어 재대결을 시작할 수 없습니다.');
            return;
        }

        try {
            // 새로운 API를 호출하여 기존 방의 문제만 변경합니다.
            await axios.post(`${process.env.REACT_APP_API_URL}/api/rooms/${roomId}/change-problem`);

            alert('새로운 문제로 재대결을 시작합니다.');

            // 기존 방 ID를 사용해 대기실로 이동 (새로운 문제를 다시 불러오게 됨)
            navigate(`/waitingRoom/${roomId}`);

        } catch (error) {
            console.error('재대결 문제 변경 중 오류 발생:', error);
            alert('재대결 문제 변경 중 오류가 발생했습니다.');
        }
    };


    // 로딩 중이거나 방 정보가 없을 때 로딩 화면을 표시
    if (loading || !roomDetails) {
        return <div className="flex justify-center items-center h-screen bg-gray-900 text-white text-2xl">로딩 중...</div>;
    }

    // 방 정보가 로드된 후에만 maxParticipants를 사용
    const maxParticipants = roomDetails.maxParticipants;

    // 웹소켓 users 배열에서 중복을 제거합니다.
    const uniqueUsers = Array.from(new Set(users.map(user => user.userId)))
        .map(userId => {
            return users.find(user => user.userId === userId);
        });

    const currentPlayers = uniqueUsers.map((user, index) => ({
        name: user.nickname,
        userId: user.userId,
        avatarInitials:
            user.nickname.charAt(0).toUpperCase() + (user.nickname.charAt(1) || '').toUpperCase(),
        tier: '골드',
        avatarColor: 'bg-blue-700',
        // 점수 데이터 추가 (예시)
        oldScore: 1520, // 기존 점수
        newScore: 1545 - (index * 5), // 새로 획득한 점수를 반영한 최종 점수
    }));

    // 최대 참가자 수에 맞춰 빈 슬롯을 포함한 players 배열을 생성합니다.
    const totalSlots = maxParticipants;
    const players = Array.from({length: totalSlots}, (_, index) => {
        if (currentPlayers[index]) {
            return currentPlayers[index];
        } else {
            return {isEmpty: true, name: `빈 자리 ${index + 1}`};
        }
    });


    return (
        <div className='resultroom1'>
            {/* --- FloatingChat 수정 --- */}
            {/* z-index를 모달(1000)보다 높게 설정하여 항상 위에 오도록 함 */}
            <div style={{ position: 'relative', zIndex: 1001 }}>
                <FloatingChat />
            </div>
            <meta charSet="UTF-8" />
            <meta name="viewport" content="width=device-width, initial-scale=1.0" />
            <title>COBY - 결과</title>
            <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@400;500;700&display=swap" rel="stylesheet" />
            <style dangerouslySetInnerHTML={{ __html: `
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

        /* --- 코드 전체화면 모달 스타일 시작 --- */
        .code-modal-backdrop {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background-color: rgba(0, 0, 0, 0.5); /* 더 밝고 투명도 감소 */
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 1000;
            padding: 2rem;
        }
        .code-modal-content {
            background-color: #fff; /* 밝은 배경 */
            border-radius: 0.5rem; /* rounded-lg */
            padding: 1.5rem 2.5rem 1.5rem 1.5rem; /* p-6 */
            width: 100%;
            height: 100%;
            display: flex;
            flex-direction: column;
            position: relative;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06); /* 그림자 추가 */
        }
        .code-modal-close-btn {
            position: absolute;
            top: 0.5rem;
            right: 0.5rem;
            background: none;
            border: none;
            color: #4a5568; /* 어두운 회색 */
            font-size: 1.5rem;
            cursor: pointer;
        }
        .code-modal-code-block {
            flex-grow: 1;
            overflow-y: auto;
            background-color: #E5E7EB; /* 연한 회색 배경 */
            padding: 1rem; /* p-4 */
            border-radius: 0.375rem; /* rounded-md */
            color: #2d3748; /* 검정에 가까운 색 */
            font-family: monospace;
            border: 1px solid #e2e8f0; /* 연한 테두리 추가 */
        }
        /* --- 코드 전체화면 모달 스타일 끝 --- */

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
                <main className="flex-1 p-6 flex flex-col items-center">
                    {(winnerId || submittedAt) && (
                        <div className="mb-4 text-center text-white">
                            {winnerId && <p className="text-xl font-bold">Winner ID: {winnerId}</p>}
                            {submittedAt && (
                                <p className="text-sm text-gray-400">
                                    Submitted at: {new Date(submittedAt).toLocaleString()}
                                </p>
                            )}
                        </div>
                    )}
                    <div className="w-full flex flex-row gap-6">

                        {/* 왼쪽 열: 플레이어 카드 */}
                        <div className="w-1/4 flex flex-col gap-4">
                            {/* 플레이어 카드 */}
                            <div className="grid grid-cols-1 gap-2">
                                {players.map((player) => (
                                    <PlayerCard
                                        key={player.name}
                                        player={player}
                                        handlePlayerCardClick={player.isEmpty ? null : handlePlayerCardClick}
                                        showReadyStatus = {false}
                                        // [TODO] 애니메이션 props 전달
                                        // oldScore={player.oldScore}
                                        // newScore={player.newScore}
                                        // startAnimation={triggerScoreAnimation}
                                    />
                                ))}
                            </div>

                            {/* 버튼들이 있던 자리는 비워짐 */}
                        </div>

                        <div className="w-1/2">
                            <div className="result-card p-6 flex flex-col" style={{ height: '600px', overflowY: 'auto' }}>
                                <h3 className="text-xl font-bold mb-4">문제: {problem?.title || '문제 정보를 불러올 수 없습니다.'}</h3>
                                <div className="text-gray-300 space-y-4">
                                    <p className="whitespace-pre-wrap">{problem?.content || '문제 내용이 없습니다.'}</p>
                                </div>
                            </div>
                        </div>

                        {/* 오른쪽 열: 유저가 작성한 코드*/}
                        <div className="w-1/2">
                            <div className="result-card p-6 flex flex-col" style={{ height: '600px', overflowY: 'auto' }}>
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="text-xl font-bold">제출 코드</h3>
                                    {/* 크게 보기 버튼 추가 */}
                                    <button onClick={openCodeModal} className="text-gray-400 hover:text-white" title="크게 보기">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 1v4m0 0h-4m4 0l-5-5" />
                                        </svg>
                                    </button>
                                </div>
                                <div className="grid grid-cols-2 gap-2 text-center text-xs mb-4">
                                    <div className="bg-gray-100 p-2 rounded-lg"><div>실행 시간 : 00ms</div></div>
                                    <div className="bg-gray-100 p-2 rounded-lg"><div>메모리 : 00.0MB</div></div>
                                    <div className="bg-gray-100 p-2 rounded-lg"><div>테스트 : 0/10</div></div>
                                    <div className="bg-gray-100 p-2 rounded-lg"><div>제출 시간 : 00:00</div></div>
                                </div>
                                <div className="code-block p-4 text-sm flex-1"><pre><code>{Code?.code || "승리자가 없습니다."}</code></pre></div>
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

                {/* 코드 전체화면 모달 */}
                {isCodeModalOpen && (
                    <div className="code-modal-backdrop" onClick={closeCodeModal}>
                        <div className="code-modal-content" onClick={(e) => e.stopPropagation()}>
                            <button onClick={closeCodeModal} className="code-modal-close-btn">&times;</button>
                            <div className="code-modal-code-block">
                                <pre><code>{Code?.code || "승리자가 없습니다."}</code></pre>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default ResultRoom;