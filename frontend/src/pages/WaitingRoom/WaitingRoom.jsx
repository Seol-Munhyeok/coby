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


    // 현재 사용자 닉네임을 가져옵니다.
    const currentUser = nickname || '게스트';

    {/*const playerData = {
        [currentUser]: {
            avatar: currentUser.charAt(0).toUpperCase() + currentUser.charAt(1).toUpperCase(),
            avatarColor: 'bg-blue-700',
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
                {name: '알고리즘 배틀 #128', time: '2시간 전', result: '승리'},
                {name: '자료구조 마스터 #45', time: '어제', result: '승리'},
                {name: 'SQL 챌린지 #12', time: '2일 전', result: '패배'}
            ]

        }
    };
    */}


    const [isReady, setIsReady] = useState(false);
    const [roomHost, setRoomHost] = useState(currentUser); // 방장도 currentUser로 초기화
    const isCurrentUserHost = currentUser === roomHost;
    const [showPlayerInfoModal, setShowPlayerInfoModal] = useState(false);
    const [playerInfoForModal, setPlayerInfoForModal] = useState(null);
    const [showRoomSettingsModal, setShowRoomSettingsModal] = useState(false);
    const [notification, setNotification] = useState(null);
    const [entranceCode, setEntranceCode] = useState("BATTLE-58392");



    const [roomName, setRoomName] = useState("");
    const [difficulty, setDifficulty] = useState("");
    const [timeLimit, setTimeLimit] = useState("");
    const [maxParticipants, setMaxParticipants] = useState(4);
    const [itemMode, setItemMode] = useState(false);
    const [isPrivate, setIsPrivate] = useState(false);
    const [password, setPassword] = useState("");

    const {
        showContextMenu,
        contextMenuPos,
        selectedPlayer,
        contextMenuRef,
        handlePlayerCardClick,
        setShowContextMenu,
        setSelectedPlayer,
    } = useContextMenu();


    const enterRoomBtn1 = () => {
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

        alert('방에 입장합니다!');
        navigate(`/gamepage/${roomId}`);
    };

    const quickbtn = async () => {
        alert('방에서 나갑니다');
        try {
            await axios.post(`${process.env.REACT_APP_API_URL}/api/rooms/${roomId}/leave`, {
                userId: userId,
            });
        } catch (error) {
            console.error('Error leaving room:', error);
        }
        leaveRoom(roomId, userId);
        navigate('/mainpage');
    };

    const { users, joinRoom, leaveRoom, isConnected, error, joinedRoomId, toggleReady: toggleReadyWs } = useWebSocket();

    const toggleReady = () => {
        const newReady = !isReady;
        setIsReady(newReady)
        toggleReadyWs(roomId, userId, newReady);
    };

    useEffect(() => {
        const me = users.find(u => u.userId === userId);
        if (me && typeof me.isReady == 'boolean') {
            setIsReady(me.isReady);
        }
    }, [users, userId]);

    const handleDelegateHost = () => {
        if (selectedPlayer) {
            setRoomHost(selectedPlayer.name);
            setNotification({message: `${selectedPlayer.name}님에게 방장을 위임했습니다.`, type: "success"});
            setTimeout(() => setNotification(null), 3000);
            setShowContextMenu(false);
        }
    };

    const handleKickPlayer = () => {
        if (selectedPlayer) {
            if (selectedPlayer.name === roomHost) {
                setNotification({ message: "방장은 강퇴할 수 없습니다.", type: "error" });
                setTimeout(() => setNotification(null), 3000);
                setShowContextMenu(false);
                return;
            }

            leaveRoom(roomId, selectedPlayer.userId);
            setNotification({ message: `${selectedPlayer.name}님을 강퇴했습니다.`, type: "success" });
            setTimeout(() => setNotification(null), 3000);
            setShowContextMenu(false);
        }
    };


    // Use useEffect to show notifications based on WebSocket connection status
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
                        navigate('/mainpage'); // 방이 없으면 메인으로
                    }
                } catch (err) {
                    console.error("방 정보를 가져오는 데 실패했습니다:", err);
                    setNotification({ message: "방 정보를 불러올 수 없습니다.", type: "error" });
                    setTimeout(() => setNotification(null), 3000);
                    navigate('/mainpage'); // 에러 발생 시 메인으로
                }
            };
            fetchRoomDetails();
        }
    }, [roomId, navigate, setNotification]);


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

    useEffect(() => {
        if (isConnected && joinedRoomId !== roomId) {
            joinRoom(roomId, {userId, nickname: currentUser, profileUrl: user?.profileUrl || ''});
        }
    }, [isConnected, roomId, currentUser, userId, joinRoom, joinedRoomId, user?.profileUrl]);

    useEffect(() => {
        return () => {
            leaveRoom(roomId, userId);
        };
    }, [roomId, userId, leaveRoom]);

    const handleSaveRoomSettings = (settings) => {
        setRoomName(settings.roomName);
        setDifficulty(settings.difficulty);
        setTimeLimit(settings.timeLimit);
        setMaxParticipants(settings.maxParticipants);
        setItemMode(settings.itemMode)
        setIsPrivate(settings.isPrivate);
        setPassword(settings.password);
        setNotification({message: "방 설정이 저장되었습니다.", type: "success"});
        setTimeout(() => setNotification(null), 3000);
        setShowRoomSettingsModal(false);
    };


    const uniqueUsers = Array.from(new Set(users.map(user => user.userId)))
        .map(userId => {
            return users.find(user => user.userId === userId);
        });


    const currentPlayers = uniqueUsers.map(user => ({
        name: user.nickname,
        userId: user.userId,
        avatarInitials:
            user.nickname.charAt(0).toUpperCase() + (user.nickname.charAt(1) || '').toUpperCase(),
        tier: '다이아',
        level: 'Lv.1',
        isReady: user.isReady,
        avatarColor: 'bg-blue-700',
        isHost: user.nickname === roomHost,
    }));

    const totalSlots = maxParticipants;
    const players = Array.from({length: totalSlots}, (_, index) => {
        if (currentPlayers[index]) {
            return currentPlayers[index];
        } else {
            return {isEmpty: true, name: `빈 자리 ${index + 1}`};
        }
    });

    const allPlayersReady = currentPlayers.every(player => player.isReady);

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
                                onClick={quickbtn}>
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20"
                                 fill="currentColor">
                                <path fillRule="evenodd"
                                      d="M3 3a1 1 0 00-1 1v12a1 1 0 001 1h12a1 1 0 001-1V7.414a1 1 0 00-.293-.707L11.414 2.414A1 1 0 0010.707 2H4a1 1 0 00-1 1zm9 4a1 1 0 00-1-1H8a1 1 0 00-1 1v8a1 1 0 001 1h3a1 1 0 001-1V7z"
                                      clipRule="evenodd"/>
                                <path
                                    d="M3 7.5a.5.5 0 01.5-.5h7a.5.5 0 010 1h-7a.5.5 0 01-.5-.5zm0 4a.5.5 0 01.5-.5h1a.5.5 0 010 1h-1a.5.5 0 01-.5-.5z"/>
                            </svg>
                            나가기
                        </button>

                        <button className="p-2 rounded-full hover:bg-gray-700 transition-colors">
                            <i className="fas fa-user-circle text-xl"></i>
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
            />

            {notification && (
                <ToastNotification
                    message={notification.message}
                    type={notification.type}
                    onClose={() => setNotification(null)}
                />
            )}
        </div>
    );
}

export default WaitingRoom;