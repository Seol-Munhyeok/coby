import React, { useState, useEffect, useRef } from 'react';
import './MainPage.css';
import { useNavigate, useLocation } from 'react-router-dom';
import RoomSettingsModal from '../../Common/components/RoomSettingsModal';
import axios from 'axios';
import { useAuth } from '../AuthContext/AuthContext';
import ToastNotification from '../../Common/components/ToastNotification';
import SockJS from "sockjs-client";
import { Client } from "@stomp/stompjs";

// 분리된 컴포넌트들 임포트
import { DesktopProfileCard, MobileProfileBar } from './ProfileCard';
import InfoModal from './InfoModal';
import HomeTab from './HomeTab'; // 홈 탭 컴포넌트 추가
import GameTab from './GameTab'; // 게임 탭 컴포넌트
import RankingTab from './RankingTab'; // 랭킹 탭 컴포넌트
import MyInfoTab from './MyInfoTab'; // 내 정보 탭 컴포넌트
import CheatingPenaltyModal from './CheatingPenaltyModal'; // 새로 만든 부정행위 모달 import

function MainPage() {
    const [isCreateModalOpen, showRoomSettingsModal] = useState(false);
    const [isRankingModalOpen, setRankingModalOpen] = useState(false); // 랭킹 모달 상태 관리
    const [isLogoutModalOpen, setLogoutModalOpen] = useState(false); // 로그아웃 확인 모달 상태 추가
    const [isCheatingModalOpen, setCheatingModalOpen] = useState(false); // 부정행위 강제 퇴장 모달 상태 추가
    const [rooms, setRooms] = useState([]);
    const [rankings, setRankings] = useState([]); // 랭킹 정보를 저장할 state 추가
    const navigate = useNavigate();
    const location = useLocation();
    const { user } = useAuth(); // AuthContext에서 user 정보 가져오기
    const [notification, setNotification] = useState(null);  // 상단 토스트 알림
    const [activeTab, setActiveTab] = useState('home'); // 현재 활성화된 탭 상태 (home으로 변경)

    // 정보 모달 상태 관리
    const [isInfoModalOpen, setInfoModalOpen] = useState(false);
    const [initialModalTab, setInitialModalTab] = useState('coby'); // 모달의 초기 탭 상태


    const [newRoomSettings, setNewRoomSettings] = useState({
        roomName: '',
        difficulty: '보통',
        timeLimit: '30분',
        itemMode : false,
        maxParticipants: 4,
        isPrivate: false,
        password: '',
    });

    const roomSocketClientRef = useRef(null);
    const roomSubscriptionRef = useRef(null);
    const isInitialFetched = useRef(false);  // race-condition 방지용

    useEffect(() => {
        // 강퇴 처리
        if (location.state?.kicked) {
            setNotification({message: "방에서 강퇴되었습니다.", type: "error"});
            setTimeout(() => setNotification(null), 3000);
            // history state를 초기화하여 새로고침 시 알림이 다시 뜨지 않도록 함
            navigate(location.pathname, { replace: true, state: {} });
        }
        
        // 부정행위 퇴장 처리
        if (location.state?.cheated) {
            setCheatingModalOpen(true); // 부정행위 모달을 엶
            // history state 초기화
            navigate(location.pathname, { replace: true, state: {} });
        }

    }, [location, navigate]);

    useEffect(() => {
        fetchRooms();
        fetchRankings(); // 컴포넌트가 마운트될 때 랭킹 정보를 가져오도록 호출
    }, []);

    // 클라이언트는 메시지를 받을 때마다 setRooms(payload)를 실행하여 화면을 새로고침 없이 즉시 갱신
    useEffect(() => {
        const socketFactory = () => new SockJS(`${process.env.REACT_APP_API_URL}/ws/room-data`);
        const client = new Client({
            webSocketFactory: socketFactory,
            reconnectDelay: 5000,  // 웹소켓 연결이 비정상적으로 끊어졌을 때 5초 후에 재연결을 시도
        });

        client.onConnect = () => {
            roomSubscriptionRef.current = client.subscribe('/topic/room-data', (message) => {
                try {
                    const payload = JSON.parse(message.body);
                    if (Array.isArray(payload)) {
                        isInitialFetched.current = true;
                        setRooms(payload);
                    }
                } catch (err) {
                    console.error('Error parsing room update message:', err);
                }
            });
        };

        client.onStompError = (frame) => {
            console.error('STOMP error:', frame.headers['message'], frame.body);
        };

        client.onWebSocketError = (event) => {
            console.error('WebSocket error:', event);
        };

        client.activate();
        roomSocketClientRef.current = client;

        return () => {
            if (roomSubscriptionRef.current) {
                roomSubscriptionRef.current.unsubscribe();
                roomSubscriptionRef.current = null;
            }
            if (roomSocketClientRef.current) {
                roomSocketClientRef.current.deactivate();
                roomSocketClientRef.current = null;
            }
        };
    }, []);

    // 모달 상태에 따라 body 스크롤을 제어하는 useEffect
    useEffect(() => {
        if (isRankingModalOpen || isInfoModalOpen || isLogoutModalOpen || isCheatingModalOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'auto';
        }

        return () => {
            document.body.style.overflow = 'auto';
        };
    }, [isRankingModalOpen, isInfoModalOpen, isLogoutModalOpen, isCheatingModalOpen]); // 부정행위 모달 상태도 의존성 배열에 추가


    const fetchRooms = async () => {
        try {
            const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/rooms`);
            if (!isInitialFetched.current) {
                setRooms(response.data);
            }
        } catch (error) {
            console.error('Error fetching rooms:', error);
        }
    };

    // 랭킹 정보를 가져오는 함수 추가
    const fetchRankings = async () => {
        try {
            const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/users/rankings`);
            setRankings(response.data);
        } catch (error) {
            console.error('Error fetching rankings:', error);
        }
    };

    const closeCreateRoomModel = () => {
        setNewRoomSettings({ //원상태로
            roomName: '',
            difficulty: '보통',
            timeLimit: '30분',
            maxParticipants: 4,
            itemMode : false,
            isPrivate: false,
            password: '',
        });
        showRoomSettingsModal(false);
    };

    const handleSaveNewRoomSettings = (settings) => {
        setNewRoomSettings(settings); // 저장된 설정 업데이트
        showRoomSettingsModal(false); // 생성 모달 닫기
        fetchRooms(); // 방 생성 후 목록 갱신
        //이후 만든 방으로 이동
    };


    const enterRoomBtn = async (id) => {
        if (!user || !user.id) { // AuthContext의 user.id를 사용
            alert('사용자 정보를 불러오는 중입니다. 잠시 후 다시 시도해주세요.');
            return;
        }
        try {
            await axios.post(`${process.env.REACT_APP_API_URL}/api/rooms/${id}/join`, {
                userId: user.id,
            });
            sessionStorage.setItem('isValidNavigation', 'true');
            navigate(`/waitingRoom/${id}?userId=${user.id}`); // roomId와 user.id를 쿼리 파라미터로 전달
        } catch (error) {
            console.error('Error joining room:', error);
            alert('방 입장 중 오류가 발생했습니다.');
        }
    };

    // 로그아웃을 최종 실행하는 함수
    const handleConfirmLogout = () => {
        setLogoutModalOpen(false); // 모달 닫기
        navigate('/'); // 로그인 페이지로 이동
    };

    // 로그아웃 모달을 여는 함수
    const handleOpenLogoutModal = () => {
        setLogoutModalOpen(true);
    };

    // 로그아웃 모달을 닫는 함수
    const handleCloseLogoutModal = () => {
        setLogoutModalOpen(false);
    };
    
    // 정보 모달을 여는 핸들러
    const handleOpenInfoModal = (tab = 'coby') => {
        setInitialModalTab(tab);
        setInfoModalOpen(true);
    };
    
    // 정보 모달을 닫는 핸들러
    const handleCloseInfoModal = () => {
        setInfoModalOpen(false);
    };
    
    // 프로필 카드 클릭 시 '내 정보' 탭으로 변경하는 핸들러
    const handleProfileCardClick = () => {
        setActiveTab('my-info');
    };

    return (
        <div className="main-body min-h-screen bg-gray-100 flex flex-col">
            {/* Header */}
            <header className="bg-gray-800 text-white shadow-lg">
                {/* 1024px 미만(lg)에서는 100% 너비, 그 이상에서는 80% 너비와 중앙 정렬 */}
                <div className="w-full lg:w-[80%] lg:mx-auto px-4 py-3 flex justify-between items-center">
                    <div className="flex items-center">
                        <h1 className="logo-text text-3xl mr-8">COBY</h1>
                        <nav className="hidden md:flex space-x-6">
                        </nav>
                    </div>
                    <div className="flex items-center space-x-4">
                        {/* 로그아웃 버튼 */}
                        <button 
                            className="flex items-center space-x-2 px-4 py-2 bg-gray-700 rounded-lg shadow-md hover:bg-gray-600 transition-all duration-200" 
                            onClick={handleOpenLogoutModal}
                        >
                            <i className="fas fa-sign-out-alt text-lg"></i>
                            <span className="font-semibold">Logout</span>
                        </button>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            {/* 1024px 미만(lg)에서는 100% 너비, 그 이상에서는 80% 너비와 중앙 정렬 */}
            <main className="w-full lg:w-[80%] lg:mx-auto px-4 py-4 flex-grow">

                {/* === Mobile Profile Bar (lg 미만에서만 보임) === */}
                {/* 요청에 따라 메인 컨테이너 밖으로 이동 */}
                <div className="lg:hidden mb-6">
                    <MobileProfileBar 
                        onOpenInfoModal={handleOpenInfoModal} 
                    />
                </div>

                {/* 메인 흰색 컨테이너 */}
                <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8 min-h-[44rem]">
                    {/* 기본 1열(세로쌓임), lg(1024px) 이상에서 4열(가로배치) */}
                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 h-full"> 
                        
                        {/* Left Section - Desktop Profile Card (lg 이상에서만 보임) */}
                        <div className="hidden lg:block lg:col-span-1 space-y-8"> {/* 'hidden lg:block' 추가 */}
                            <DesktopProfileCard // 이름 변경
                                onOpenInfoModal={handleOpenInfoModal} 
                                onProfileClick={handleProfileCardClick} 
                            />
                        </div>

                        {/* Right Section - Fragment Area (모바일에선 1열 전체, 데스크탑에선 3열) */}
                        <div className="col-span-1 lg:col-span-3 flex flex-col h-full overflow-hidden"> {/* 'col-span-1' 추가 */}
                            
                            {/* === Mobile Profile Bar (lg 미만에서만 보임) === */}
                            {/* 이 섹션이 <main>의 직계 자식으로 이동했습니다. */}
                            
                            {/* Tab Buttons */}
                            <div className="flex border-b mb-6">
                                <button onClick={() => setActiveTab('home')} className={`tab-button ${activeTab === 'home' ? 'active' : ''}`}>
                                    <i className="fas fa-home"></i>
                                    <span className="tab-text">홈</span>
                                </button>
                                <button onClick={() => setActiveTab('game')} className={`tab-button ${activeTab === 'game' ? 'active' : ''}`}>
                                    <i className="fas fa-gamepad"></i>
                                    <span className="tab-text">게임</span>
                                </button>
                                <button onClick={() => setActiveTab('ranking')} className={`tab-button ${activeTab === 'ranking' ? 'active' : ''}`}>
                                    <i className="fas fa-trophy"></i>
                                    <span className="tab-text">랭킹</span>
                                </button>
                                <button onClick={() => setActiveTab('my-info')} className={`tab-button ${activeTab === 'my-info' ? 'active' : ''}`}>
                                    <i className="fas fa-user"></i>
                                    <span className="tab-text">내 정보</span>
                                </button>
                            </div>

                            {/* Conditional Content based on activeTab */}
                            <div className="flex-grow overflow-hidden">
                                <div className="h-full overflow-y-auto pr-2">
                                    {activeTab === 'home' && (
                                        <HomeTab 
                                            roomCount={rooms.length}
                                            topRanker={rankings[0]}
                                            currentUser={user}
                                            setActiveTab={setActiveTab}
                                        />
                                    )}
                                    {activeTab === 'game' && (
                                        <GameTab 
                                            enterRoomBtn={enterRoomBtn}
                                            showRoomSettingsModal={showRoomSettingsModal}
                                            rooms={rooms}
                                        />
                                    )}
                                    {activeTab === 'ranking' && (
                                        <RankingTab rankings={rankings} />
                                    )}
                                    {activeTab === 'my-info' && (
                                        <MyInfoTab onOpenInfoModal={handleOpenInfoModal} />
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            {/* "Coding Online Battle with You" Text */}
            <div className="text-center pb-4">
                <p className="text-gray-500 font-semibold">Coding Online Battle with You</p>
            </div>

            {/* Modals */}
            <RoomSettingsModal
                showModal={isCreateModalOpen}
                onClose={closeCreateRoomModel}
                onSave={handleSaveNewRoomSettings}
                initialSettings={newRoomSettings}
                currentParticipantsCount={0}
            />
            <InfoModal 
                isOpen={isInfoModalOpen} 
                onClose={handleCloseInfoModal} 
                initialTab={initialModalTab} 
            />

            {/* 부정행위 강제 퇴장 모달 렌더링 */}
            <CheatingPenaltyModal
                isOpen={isCheatingModalOpen}
                onClose={() => setCheatingModalOpen(false)}
            />

            {/* 로그아웃 확인 모달 */}
            {isLogoutModalOpen && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-sm mx-4">
                        <h2 className="text-xl font-semibold text-gray-800 mb-4">로그아웃 확인</h2>
                        <p className="text-gray-600 mb-6">정말 로그아웃하시겠습니까?</p>
                        <div className="flex justify-end space-x-4">
                            <button
                                onClick={handleCloseLogoutModal}
                                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition"
                            >
                                아니요
                            </button>
                            <button
                                onClick={handleConfirmLogout}
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
            <div id="joinRoomModal" className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 hidden">
                <div className="main-glass-effect rounded-xl w-full max-w-md p-6 main-animate-fade-in">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-bold text-white">입장 코드로 참가</h2>
                        <button id="closeJoinModal" className="text-blue-300 hover:text-white transition">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm text-blue-300 mb-1">입장 코드</label>
                            <input type="text" className="w-full bg-blue-900/30 border border-blue-800 rounded-md px-3 py-2 text-white" placeholder="입장 코드를 입력하세요" />
                        </div>
                        <button id="confirmJoinRoom" className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg transition mt-2">
                            참가하기
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default MainPage;