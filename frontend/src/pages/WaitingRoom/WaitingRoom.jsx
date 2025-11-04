// WaitingRoom.jsx
/**
 * 메인 컴포넌트로, 다른 컴포넌트와 훅을 가져와 사용합니다.
 */
import React, {useState, useEffect} from 'react';
import {useNavigate, useParams} from 'react-router-dom';
import './WaitingRoom.css';
import useContextMenu from '../../Common/hooks/useContextMenu';
import PlayerCard from './components/PlayerCard';
import PlayerInfoModal from '../../Common/components/PlayerInfoModal'
import ChatWindow from '../../Common/components/ChatWindow';
import RoomSettingsModal from '../../Common/components/RoomSettingsModal';
import ToastNotification from '../../Common/components/ToastNotification';
import {useWebSocket} from '../WebSocket/WebSocketContext';
import {useAuth} from '../AuthContext/AuthContext';
import axios from 'axios';

function WaitingRoom() {
    const navigate = useNavigate();
    const {roomId} = useParams();
    const {user} = useAuth();
    const nickname = user?.nickname;
    const userId = user?.id;

    /*
     * WebSocketContext 로부터 제공되는 값과 함수를 가져옵니다.
     * - users: 현재 방에 접속해 있는 유저 목록
     * - joinRoom / leaveRoom: 방 참여 및 퇴장 처리
     * - isConnected / error: 소켓 연결 상태와 에러 메시지
     * - joinedRoomId: 현재 참여 중인 방 ID
     * - toggleReadyWs: 서버에 준비 상태를 전송하는 함수
     * - delegateHost / startGame: 방장 위임과 게임 시작 제어
     * - gameStart: 서버로부터 받은 게임 시작 신호
     * - sendMessage: 채팅 메시지 전송
     * - client: STOMP WebSocket 클라이언트 인스턴스 (publish 용도)
     * - forcedOut: 강제 퇴장 여부를 나타내는 상태 플래그
     * - resetForcedOut: 강제 퇴장 플래그 초기화 함수
     */
    const {
        users,
        joinRoom,
        leaveRoom,
        isConnected,
        error,
        joinedRoomId,
        toggleReady: toggleReadyWs,
        delegateHost,
        startGame,
        gameStart,
        sendMessage,
        client,
        forcedOut,
        resetForcedOut,
        systemMessage,
        clearSystemMessage,
        recalculateRemainingTime,
    } = useWebSocket();

    // 현재 사용자 닉네임을 가져오고, 없으면 기본값으로 '게스트' 를 사용합니다.
    const currentUser = nickname || '게스트';
    const [showCountdown, setShowCountdown] = useState(false);
    const [countdownNumber, setCountdownNumber] = useState(null);

    // UI 및 방 상태 관리를 위한 여러 가지 상태 변수
    const [isReady, setIsReady] = useState(false);  // 현재 사용자 준비 상태
    const [roomHost, setRoomHost] = useState(null); // 방장 닉네임
    const isCurrentUserHost = users.some(u => u.userId === Number(userId) && u.isHost);  // 현재 사용자가 방장인지 여부
    const [showPlayerInfoModal, setShowPlayerInfoModal] = useState(false);  // 플레이어 정보 모달 표시 여부
    const [playerInfoForModal, setPlayerInfoForModal] = useState(null);  // 모달에 표시할 플레이어 정보
    const [showRoomSettingsModal, setShowRoomSettingsModal] = useState(false);  // 방 설정 모달 표시 여부
    const [isLeaveModalOpen, setLeaveModalOpen] = useState(false); // 방 나가기 확인 모달 상태 추가
    const [notification, setNotification] = useState(null);  // 상단 토스트 알림


    // 방 설정 정보
    const [roomName, setRoomName] = useState("");
    const [difficulty, setDifficulty] = useState("");
    const [timeLimit, setTimeLimit] = useState("");
    const [maxParticipants, setMaxParticipants] = useState(4);
    const [itemMode, setItemMode] = useState(false);
    const [isPrivate, setIsPrivate] = useState(false);
    const [password, setPassword] = useState("");


    // 플레이어 카드 우클릭 시 표시되는 커스텀 컨텍스트 메뉴 제어 훅
    const {
        showContextMenu,
        contextMenuPos,
        selectedPlayer,
        contextMenuRef,
        handlePlayerCardClick,
        setShowContextMenu,
    } = useContextMenu();


    // 방장이 게임 시작 버튼을 눌렀을 때 실행되는 함수
    const enterRoomBtn1 = async () => {
        if (!isCurrentUserHost) {
            setNotification({message: "방장만 게임을 시작할 수 있습니다.", type: "error"});
            setTimeout(() => setNotification(null), 3000);
            return;
        }

        if (currentPlayers.length !== maxParticipants) {
            setNotification({message: "모든 참가자 슬롯이 채워져야 게임을 시작할 수 있습니다.", type: "error"});
            setTimeout(() => setNotification(null), 3000);
            return;
        }

        if (!allPlayersReady) {
            setNotification({message: "모든 플레이어가 준비 완료 상태여야 게임을 시작할 수 있습니다.", type: "error"});
            setTimeout(() => setNotification(null), 3000);
            return;
        }
        try {
            const response = await axios.post(
                `${process.env.REACT_APP_API_URL}/api/rooms/${roomId}/start`,
                {}, // POST 요청이지만 body는 비워둡니다.
                { withCredentials: true }
            );

            if (response.status !== 200) {
                throw new Error("상태 변경 실패");
            }

            console.log("✅ 백엔드 상태: IN_PROGRESS로 변경 완료.");

        } catch (error) {
            console.error("게임 시작 API 호출 오류:", error);
            setNotification({message: "게임 시작 중 서버 오류가 발생했습니다. (DB 상태 변경 실패)", type: "error"});
            setTimeout(() => setNotification(null), 3000);
            return; // API 호출 실패 시 WebSocket 메시지 전송을 중단
        }
        // 방장만 게임 시작 메시지 전송
        sendMessage(roomId, {
            roomId,
            userId,
            nickname: currentUser,
            profileUrl: user?.profileUrl || '',
            content: '잠시 후, 게임이 시작됩니다...',
        });
        startGame(roomId);
    };

    const [hasLeft, setHasLeft] = useState(false);
    
    // 방 나가기 모달을 여는 함수
    const handleOpenLeaveModal = () => {
        setLeaveModalOpen(true);
    };

    // 방 나가기 모달을 닫는 함수
    const handleCancelLeave = () => {
        setLeaveModalOpen(false);
    };

    // 방 나가기를 최종 확인하고 실행하는 함수
    const handleConfirmLeave = () => {
        setLeaveModalOpen(false); // 모달 닫기
        sessionStorage.removeItem('isValidNavigation');
        if (!hasLeft) {
            leaveRoom(roomId, userId);
            setHasLeft(true);
            setTimeout(() => navigate('/mainpage'), 100);
        } else {
            navigate('/mainpage');
        }
    };


    // 현재 사용자의 준비 상태를 토글하고 서버에 알립니다.
    const toggleReady = () => {
        const newReady = !isReady;
        setIsReady(newReady)
        toggleReadyWs(roomId, userId, newReady);
    };

    // WebSocket에서 전달받은 자신의 준비 상태를 로컬 상태와 동기화
    useEffect(() => {
        const me = users.find(u => u.userId === Number(userId));
        if (me && typeof me.isReady == 'boolean') {
            setIsReady(me.isReady);
        }
    }, [users, userId]);

    // 유저 목록이 갱신될 때 방장 정보를 추출합니다.
    useEffect(() => {
        const hostUser = users.find(u => u.isHost);
        setRoomHost(hostUser ? hostUser.nickname : null);
    }, [users]);


    // 게임 시작 신호가 오면 카운트다운 후 게임 페이지로 이동
    useEffect(() => {
        if (gameStart) {
            setShowCountdown(true);
            setCountdownNumber(5);

            const interval = setInterval(() => {
                setCountdownNumber(prevNumber => {
                    if (prevNumber > 1) {
                        return prevNumber - 1;
                    } else {
                        clearInterval(interval);
                        setShowCountdown(false);
                        navigate(`/gamepage/${roomId}`);
                        return null;
                    }
                });
            }, 1000);

            return () => clearInterval(interval);
        }
    }, [gameStart, roomId, navigate]);


    // 선택한 플레이어에게 방장 권한을 위임
    const handleDelegateHost = () => {
        if (selectedPlayer) {
            delegateHost(roomId, selectedPlayer.userId);
            setRoomHost(selectedPlayer.name);
            setNotification({message: `${selectedPlayer.name}님에게 방장을 위임했습니다.`, type: "success"});
            setTimeout(() => setNotification(null), 3000);
            setShowContextMenu(false);
        }
    };

    // 선택한 플레이어를 강퇴
    const handleKickPlayer = () => {
        if (selectedPlayer) {
            if (selectedPlayer.isHost) {
                setNotification({ message: "방장은 강퇴할 수 없습니다.", type: "error" });
                setTimeout(() => setNotification(null), 3000);
                setShowContextMenu(false);
                return;
            }
            try {
                if (client && client.connected) {
                    client.publish({
                        destination: `/app/room/${roomId}/kick`,
                        body: JSON.stringify({ type: 'Kick', userId: selectedPlayer.userId }),
                    });
                    setNotification({ message: `${selectedPlayer.name}님을 강퇴했습니다.`, type: "success" });
                }
            } catch (error) {
                console.error('Error kicking user:', error);
                setNotification({ message: "강퇴에 실패했습니다.", type: "error" });
            }
            setTimeout(() => setNotification(null), 3000);
            setShowContextMenu(false);
        }
    };


    // WebSocker 연결 상태에 따라 토스트 알림을 표시
    useEffect(() => {
        if (roomId) {
            const fetchRoomDetails = async () => {
                try {
                    const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/rooms`);
                    const allRooms = response.data;
                    const currentRoom = allRooms.find(room => room.id.toString() === roomId);

                    if (currentRoom) {
                        setRoomName(currentRoom.roomName);
                        setDifficulty(currentRoom.difficulty);
                        setTimeLimit(currentRoom.timeLimit);
                        setMaxParticipants(currentRoom.maxParticipants);
                        setItemMode(currentRoom.itemMode);
                        setIsPrivate(currentRoom.isPrivate);
                    } else {
                        setNotification({ message: "존재하지 않는 방입니다.", type: "error" });
                        setTimeout(() => setNotification(null), 3000);
                        sessionStorage.removeItem('isValidNavigation');
                        navigate('/mainpage'); // 방이 없으면 메인으로
                    }
                } catch (err) {
                    console.error("방 정보를 가져오는 데 실패했습니다:", err);
                    setNotification({ message: "방 정보를 불러올 수 없습니다.", type: "error" });
                    setTimeout(() => setNotification(null), 3000);
                    sessionStorage.removeItem('isValidNavigation');
                    navigate('/mainpage'); // 에러 발생 시 메인으로
                }
            };
            fetchRoomDetails();
        }
    }, [roomId, navigate, setNotification]);


    // 연결 성공/실패 시 사용자에게 알려주기 위한 토스트 알림 처리
    useEffect(() => {
        if (isConnected) {
            setNotification({message: "채팅 서버에 연결되었습니다.", type: "success"});
        } else if (error) {
            setNotification({message: error, type: "error"});
        } else {
            setNotification({message: "채팅 서버와 연결이 끊어졌습니다.", type: "error"});
        }
        const timer = setTimeout(() => setNotification(null), 3000);
        return () => clearTimeout(timer); // Clear timeout if component unmounts or status changes
    }, [isConnected, error, setNotification]);


    // 소켓 연결 후 아직 방에 참여하지 않았다면 joinRoom 호출
    useEffect(() => {
        if (isConnected && joinedRoomId !== roomId) {
            joinRoom(roomId, {userId, nickname: currentUser, profileUrl: user?.profileUrl || ''});
        }
    }, [isConnected, roomId, currentUser, userId, joinRoom, joinedRoomId, user?.profileUrl]);

    // 강퇴되었을 때 메인 페이지로 이동하며 다시 Leave 이벤트를 보내지 않도록 표시
    useEffect(() => {
        if (forcedOut) {
            setHasLeft(true); // 언마운트 시 중복 퇴장 방지
            sessionStorage.removeItem('isValidNavigation');
            navigate('/mainpage', { state: { kicked: true } });
            resetForcedOut();
        }
    }, [forcedOut, navigate, resetForcedOut]);

    // 시스템 메시지를 토스트로 표시
    useEffect(() => {
        if (systemMessage) {
            setNotification({ message: systemMessage, type: 'info' });
            const timer = setTimeout(() => {
                setNotification(null);
                clearSystemMessage();
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [systemMessage, clearSystemMessage]);

    // 방 설정 모달에서 저장 버튼을 눌렀을 때 호출
    const handleSaveRoomSettings = (updatedSettings) => {
        if (!updatedSettings) {
            setShowRoomSettingsModal(false);
            return;
        }

        if (updatedSettings.roomName !== undefined) {
            setRoomName(updatedSettings.roomName);
        }
        if (updatedSettings.difficulty !== undefined) {
            setDifficulty(updatedSettings.difficulty);
        }
        if (updatedSettings.timeLimit !== undefined) {
            setTimeLimit(updatedSettings.timeLimit);
        }
        if (updatedSettings.maxParticipants !== undefined) {
            setMaxParticipants(updatedSettings.maxParticipants);
        }
        if (updatedSettings.itemMode !== undefined) {
            setItemMode(updatedSettings.itemMode);
        }
        if (updatedSettings.isPrivate !== undefined) {
            setIsPrivate(updatedSettings.isPrivate);
            if (!updatedSettings.isPrivate) {
                setPassword('');
            }
        }
        if (updatedSettings.password !== undefined && updatedSettings.isPrivate !== false) {
            setPassword(updatedSettings.password);
        }
        setNotification({message: "방 설정이 저장되었습니다.", type: "success"});
        setTimeout(() => setNotification(null), 3000);
        setShowRoomSettingsModal(false);
    };


    // 동일한 사용자 ID 가 중복해서 들어오는 것을 방지하기 위해 유저 목록을 필터링
    const uniqueUsers = Array.from(new Set(users.map(user => user.userId)))
        .map(userId => {
            return users.find(user => user.userId === userId);
        });


    // 화면에 표시될 플레이어 정보 포맷
    const currentPlayers = uniqueUsers.map(user => ({
        name: user.nickname,
        userId: user.userId,
        avatarInitials:
            user.nickname.charAt(0).toUpperCase() + (user.nickname.charAt(1) || '').toUpperCase(),
        tier: user.tier,
        isReady: user.isReady,
        //avatarColor: 'bg-blue-700',
        isHost: user.isHost,
    }));


    // 방의 최대 인원 수에 맞춰 빈 슬롯을 생성
    const totalSlots = maxParticipants;
    const players = Array.from({length: totalSlots}, (_, index) => {
        if (currentPlayers[index]) {
            return currentPlayers[index];
        } else {
            return {isEmpty: true, name: `빈 자리 ${index + 1}`};
        }
    });

    // 모든 플레이어가 준비되었는지 여부
    const allPlayersReady = currentPlayers.every(player => player.isReady);

    // 방장이면서 모든 플레이어가 준비되고 슬롯이 꽉 찬 경우에만 게임 시작 가능
    const canStartGame = isCurrentUserHost && allPlayersReady && (currentPlayers.length === maxParticipants);

    return (
        <div className="WaitingRoom">
            <meta charSet="UTF-8"/>
            <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
            <title>COBY - Coding Online Battle with You</title>
            <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@300;400;500;700;900&display=swap"
                  rel="stylesheet"/>

            {/* Header */}
            <header className="bg-gray-800 text-white shadow-lg">
                <div className="container mx-auto px-4 py-3 flex justify-between items-center">
                    <div className="flex items-center">
                        <h1 className="logo-text text-3xl mr-8">COBY</h1>
                        <nav className="hidden md:flex space-x-6">
                        </nav>
                    </div>
                    <div className="flex items-center space-x-4">
                        <button id="leaveRoomBtn"
                                className="bg-red-600 hover:bg-red-700  px-4 py-2 rounded-lg flex items-center transition"
                                onClick={handleOpenLeaveModal}>
                            <i className="fas fa-sign-out-alt text-lg"></i>
                            방 나가기
                        </button>
                    </div>
                </div>
            </header>

            <main className="container mx-auto px-4 pt-4 transform scale-95 origin-top">
                <div className="bg-white shadow-md rounded-xl p-4">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-2xl font-bold ">{roomName}</h2>
                        <div className="flex items-center space-x-3">
                            {isCurrentUserHost && (
                                <button
                                    className="px-4 py-2 rounded-lg flex items-center transition bg-blue-600 hover:bg-blue-700"
                                    onClick={() => setShowRoomSettingsModal(true)}
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20"
                                         fill="currentColor">
                                        <path fillRule="evenodd"
                                              d="M11.49 3.17c-.32-.96-1.8-.96-2.12 0l-.42 1.26a1 1 0 01-.95.69h-1.26c-.96.32-.96 1.8 0 2.12l1.26.42a1 1 0 01.69.95v1.26c.32.96 1.8.96 2.12 0l.42-1.26a1 1 0 01.95-.69h1.26c.96-.32.96-1.8 0-2.12l-1.26-.42a1 1 0 01-.69-.95V3.17z"
                                              clipRule="evenodd"/>
                                        <path fillRule="evenodd"
                                              d="M10 18a8 8 0 100-16 8 8 0 000 16zm-1-9a1 1 0 100-2 1 1 0 000 2zm3 0a1 1 0 100-2 1 1 0 000 2zm-6 3a1 1 0 100-2 1 1 0 000 2zm3 0a1 1 0 100-2 1 1 0 000 2zm3 0a1 1 0 100-2 1 1 0 000 2z"
                                              clipRule="evenodd"/>
                                    </svg>
                                    설정
                                </button>
                            )}

                            <button
                                id="readyBtn"
                                className={`px-4 py-2 rounded-lg flex items-center transition ${
                                    isReady ? 'bg-green-600 hover:bg-green-700' : 'bg-gray-600 hover:bg-gray-700'
                                } `}
                                onClick={toggleReady}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20"
                                     fill="currentColor">
                                    <path fillRule="evenodd"
                                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                          clipRule="evenodd"/>
                                </svg>
                                {isReady ? '준비 완료' : '준비 하기'}
                            </button>
                            <button
                                id="startGameBtn"
                                className={`px-4 py-2 rounded-lg flex items-center transition ${
                                    canStartGame
                                        ? 'bg-green-600 hover:bg-green-700'
                                        : 'bg-gray-600 cursor-not-allowed opacity-50'
                                } `}
                                onClick={enterRoomBtn1}
                                disabled={!canStartGame}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20"
                                     fill="currentColor">
                                    <path fillRule="evenodd"
                                          d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
                                          clipRule="evenodd"/>
                                </svg>
                                게임 시작
                            </button>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 lg:grid-rows-[auto_1fr]">
                        <div className="lg:col-span-3">
                            <div className="bg-gray-100 shadow-md rounded-lg px-4 py-2">
                                <div className="flex flex-wrap gap-x-6 gap-y-2">
                                    <div className="flex items-center">
                                        <span className="waitingRoom-text">난이도:</span>
                                        <span className="text-yellow-400 font-medium ml-1">{difficulty}</span>
                                    </div>
                                    <div className="flex items-center">
                                        <span className="waitingRoom-text">제한 시간:</span>
                                        <span className=" font-medium ml-1">{timeLimit}</span>
                                    </div>
                                    <div className="flex items-center">
                                        <span className="waitingRoom-text">최대 참가자:</span>
                                        <span className=" font-medium ml-1">{maxParticipants}명</span>
                                    </div>
                                    {isPrivate && (
                                        <div className="flex items-center">
                                            <span className="waitingRoom-text">비밀방:</span>
                                            <span className=" font-medium ml-1">설정됨</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                        <div className="lg:col-span-1">
                            <ChatWindow/>
                        </div>
                        <div className="lg:col-span-2">
                            <div className="bg-white shadow-md rounded-xl p-4 flex flex-col h-full">
                                <h2 className="text-xl font-bold  mb-4 flex items-center">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 text-blue-400"
                                         viewBox="0 0 20 20" fill="currentColor">
                                        <path
                                            d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z"/>
                                    </svg>
                                    참가자 ({currentPlayers.length}/{totalSlots})
                                </h2>
                                <div className="grid grid-cols-2 gap-4">
                                    {players.map((player) => (
                                        <PlayerCard
                                            key={player.name}
                                            player={player}
                                            handlePlayerCardClick={player.isEmpty ? null : handlePlayerCardClick}
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            {showContextMenu && selectedPlayer && (
                <div
                    ref={contextMenuRef}
                    className="bg-white shadow-md custom-context-menu absolute rounded-lg shadow-lg py-2 z-50"
                    style={{top: contextMenuPos.y, left: contextMenuPos.x}}
                >
                    <ul className=" text-sm">
                        <li className="px-4 py-2 hover:bg-blue-700 cursor-pointer" onClick={() => {
                            const fullPlayer = users.find(user => user.nickname === selectedPlayer.name);
                            if (fullPlayer) {
                                setPlayerInfoForModal(fullPlayer);
                                setShowPlayerInfoModal(true);
                            }
                            setShowContextMenu(false);
                        }}>
                            정보 보기
                        </li>
                        {isCurrentUserHost && selectedPlayer.name !== currentUser && (
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

            <PlayerInfoModal
                showModal={showPlayerInfoModal}
                onClose={() => setShowPlayerInfoModal(false)}
                playerData={playerInfoForModal}
                selectedPlayerName={selectedPlayer ? selectedPlayer.name : ''}
            />

            <RoomSettingsModal
                showModal={showRoomSettingsModal}
                onClose={() => setShowRoomSettingsModal(false)}
                onSave={handleSaveRoomSettings}
                initialSettings={{
                    roomName,
                    difficulty,
                    timeLimit,
                    maxParticipants,
                    itemMode,
                    isPrivate,
                    password,
                }}
                currentParticipantsCount={currentPlayers.length}
                roomId={roomId}
                isEdit
            />

            {/* 방 나가기 확인 모달 */}
            {isLeaveModalOpen && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-sm mx-4">
                        <h2 className="text-xl font-semibold text-gray-800 mb-4">방 나가기</h2>
                        <p className="text-gray-600 mb-6">정말 방을 나가시겠습니까?</p>
                        <div className="flex justify-end space-x-4">
                            <button
                                onClick={handleCancelLeave}
                                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition"
                            >
                                아니요
                            </button>
                            <button
                                onClick={handleConfirmLeave}
                                className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition"
                            >
                                예
                            </button>
                        </div>
                    </div>
                </div>
            )}


            {notification && (
                <ToastNotification
                    message={notification.message}
                    type={notification.type}
                    onClose={() => setNotification(null)}
                />
            )}
            {showCountdown && (
                <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex justify-center items-center z-50">
                    <div className="text-white text-9xl font-bold animate-pulse">
                        {countdownNumber > 0 ? countdownNumber : 'GO!'}
                    </div>
                </div>
            )}
        </div>
    );
}

export default WaitingRoom;