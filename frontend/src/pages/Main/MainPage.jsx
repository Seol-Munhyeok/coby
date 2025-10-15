import React, { useState, useEffect, useRef } from 'react';
import './MainPage.css';
import { useNavigate, useLocation } from 'react-router-dom';
import RoomSettingsModal from '../../Common/components/RoomSettingsModal';
import axios from 'axios';
import { useAuth } from '../AuthContext/AuthContext';
import ToastNotification from '../../Common/components/ToastNotification';

// 분리된 컴포넌트들 임포트
import ProfileCard from './ProfileCard';
import InfoModal from './InfoModal';
import HomeTab from './HomeTab'; // 홈 탭 컴포넌트 추가
import GameTab from './GameTab'; // 게임 탭 컴포넌트
import RankingTab from './RankingTab'; // 랭킹 탭 컴포넌트
import MyInfoTab from './MyInfoTab'; // 내 정보 탭 컴포넌트

function MainPage() {
    const [isCreateModalOpen, showRoomSettingsModal] = useState(false);
    const [isRankingModalOpen, setRankingModalOpen] = useState(false); // 랭킹 모달 상태 관리
    const [rooms, setRooms] = useState([]);
    const [rankings, setRankings] = useState([]); // 랭킹 정보를 저장할 state 추가
    const userIconButtonRef = useRef(null);
    const [isUserMenuOpen, setUserMenuOpen] = useState(false);
    const userMenuRef = useRef(null);
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

    // 강퇴 후 이동해 온 경우 알림을 표시
    useEffect(() => {
        if (location.state?.kicked) {
            setNotification({message: "방에서 강퇴되었습니다.", type: "success"});
            setTimeout(() => setNotification(null), 3000);
            navigate(location.pathname, { replace: true, state: {} });

        }
    }, [location, navigate]);

    useEffect(() => {
        fetchRooms();
        fetchRankings(); // 컴포넌트가 마운트될 때 랭킹 정보를 가져오도록 호출
    }, []);

    // 랭킹 모달의 상태에 따라 body 스크롤을 제어하는 useEffect
    useEffect(() => {
        // 모달이 열려 있으면 배경 스크롤을 막습니다.
        if (isRankingModalOpen || isInfoModalOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            // 모달이 닫히면 배경 스크롤을 다시 허용합니다.
            document.body.style.overflow = 'auto';
        }

        // 컴포넌트가 언마운트될 때를 대비하여 cleanup 함수에서 스크롤을 복원합니다.
        return () => {
            document.body.style.overflow = 'auto';
        };
    }, [isRankingModalOpen, isInfoModalOpen]); // 모달 상태가 변경될 때마다 이 effect를 실행합니다.


    const fetchRooms = async () => {
        try {
            const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/rooms`);
            setRooms(response.data);
        } catch (error) {
            console.error('Error fetching rooms:', error);
        }
    };

    // 랭킹 정보를 가져오는 함수 추가
    const fetchRankings = async () => {
        try {
            // API는 rating 기준으로 내림차순 정렬된 사용자 목록을 반환한다고 가정
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
            alert('방에 입장합니다!');
            navigate(`/waitingRoom/${id}?userId=${user.id}`); // roomId와 user.id를 쿼리 파라미터로 전달
        } catch (error) {
            console.error('Error joining room:', error);
            alert('방 입장 중 오류가 발생했습니다.');
        }
    };

    const enterSettingBtn = () => {
        alert("미구현")
    };

    const enterloginBtn = () => {
        navigate('/');
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (
                isUserMenuOpen &&
                userMenuRef.current &&
                !userMenuRef.current.contains(event.target) &&
                userIconButtonRef.current &&
                !userIconButtonRef.current.contains(event.target)
            ) {
                setUserMenuOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isUserMenuOpen]);

    const toggleUserMenu1 = () => {
        setUserMenuOpen(prev => !prev);
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
                <div className="w-[80%] mx-auto px-4 py-3 flex justify-between items-center">
                    <div className="flex items-center">
                        <h1 className="logo-text text-3xl mr-8">COBY</h1>
                        <nav className="hidden md:flex space-x-6">
                        </nav>
                    </div>
                    <div className="flex items-center space-x-4">
                        <button className="p-2 rounded-full hover:bg-gray-700 transition-colors" onClick={toggleUserMenu1} ref={userIconButtonRef}>
                            <i className="fas fa-user-circle text-xl"></i>
                        </button>
                        {/* User Menu Dropdown */}
                        {isUserMenuOpen && (
                            <div id="userMenu" ref={userMenuRef} className="absolute right-4 mt-32 w-48 bg-white rounded-md shadow-lg py-1 z-50">
                                <button type="button" className="block w-full text-left px-4 py-2 text-gray-800 hover:bg-gray-100" onClick={enterSettingBtn}>
                                    <i className="fas fa-cog mr-2"></i> 설정
                                </button>
                                <div className="border-t border-gray-200 my-1"></div>
                                <button type="button" className="block w-full text-left px-4 py-2 text-gray-800 hover:bg-gray-100" onClick={enterloginBtn}>
                                    <i className="fas fa-sign-out-alt mr-2"></i> 로그아웃
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="w-[80%] mx-auto px-4 py-4 flex-grow">
                <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8 h-[80vb]">
                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 h-full">
                        {/* Left Section - Profile Card */}
                        <div className="lg:col-span-1 space-y-8">
                            <ProfileCard 
                                onOpenInfoModal={handleOpenInfoModal} 
                                onProfileClick={handleProfileCardClick} 
                            />
                        </div>

                        {/* Right Section - Fragment Area */}
                        <div className="lg:col-span-3 flex flex-col h-full overflow-hidden">
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
                                            fetchRooms={fetchRooms}
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