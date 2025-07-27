import React, { useState, useEffect, useRef } from 'react';
import './MainPage.css';
import { useNavigate } from 'react-router-dom';
import { useUserStore } from '../../store/userStore';
import RoomSettingsModal from '../../Common/components/RoomSettingsModal';
import axios from 'axios';

// 분리된 컴포넌트들 임포트
import MyCard from './MyCard';
import TierInfo from './TierInfo';
import RankCard from './RankCard';
import RoomList from './RoomList';

function MainPage() {
    const [isCreateModalOpen, showRoomSettingsModal] = useState(false);
    const [rooms, setRooms] = useState([]);
    const userIconButtonRef = useRef(null);
    const [isUserMenuOpen, setUserMenuOpen] = useState(false);
    const setNickname = useUserStore((state) => state.setNickname); // MyCard로 이동
    const userMenuRef = useRef(null);
    const navigate = useNavigate();

    const [newRoomSettings, setNewRoomSettings] = useState({
        roomName: '',
        difficulty: '보통',
        timeLimit: '30분',
        itemMode : false,
        maxParticipants: 4,
        isPrivate: false,
        password: '',
    });

    useEffect(() => {
        fetchRooms();
    }, []); // 닉네임 로직은 MyCard로 이동했으므로 의존성 배열에서 제거

    const fetchRooms = async () => {
        try {
            const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/rooms`);
            setRooms(response.data);
        } catch (error) {
            console.error('Error fetching rooms:', error);
            alert('방 목록을 불러오는데 실패했습니다. 잠시 후 다시 시도해주세요.');
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


    const enterRoomBtn = () => {
        alert('방에 입장합니다!');
        navigate('/waitingRoom');
    };

    const enterMypageBtn = () => {
        navigate('/myPage');
    };

    const enterloginBtn = () => {
        navigate('/');
    };

    const enterMainBtn =() =>{
        navigate('/mainpage')
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

    return (
        <div className="main-body min-h-screen bg-gray-100 flex flex-col">
            {/* Header */}
            <header className="bg-gray-800 text-white shadow-lg">
                <div className="container mx-auto px-4 py-3 flex justify-between items-center">
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
                                <button type="button" className="block w-full text-left px-4 py-2 text-gray-800 hover:bg-gray-100" onClick={enterMypageBtn}>
                                    <i className="fas fa-user mr-2"></i> 마이페이지
                                </button>
                                <button type="button" className="block w-full text-left px-4 py-2 text-gray-800 hover:bg-gray-100" onClick={enterloginBtn}>
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
            <main className="container mx-auto px-4 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Section - My Card & Tier Info */}
                    <div className="lg:col-span-1">
                        <MyCard />
                        <TierInfo />
                    </div>

                    {/* Right Section - Ranking and Game Participation */}
                    <div className="lg:col-span-2">
                        {/* Ranking TOP 3 */}
                        <div className="bg-white rounded-xl shadow-md overflow-hidden mb-8">
                            <div className="p-4 bg-gray-50 border-b flex justify-between items-center">
                                <h2 className="text-xl font-bold text-gray-800">랭킹 TOP 3</h2>
                                <button type="button" className="text-blue-500 hover:text-blue-700 text-sm" onClick={enterMainBtn}>
                                    <i className="fas fa-user mr-2"></i> 전체 랭킹 보기
                                </button>
                            </div>

                            <div className="p-6">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <RankCard
                                        rank={2}
                                        name="랭킹2"
                                        rating={0}
                                        wins={0}
                                        losses={0}
                                        tier="다이아몬드"
                                        languageLogo="java"
                                    />
                                    <RankCard
                                        rank={1}
                                        name="랭킹1"
                                        rating={0}
                                        wins={0}
                                        losses={0}
                                        tier="마스터"
                                        languageLogo="cpp"
                                    />
                                    <RankCard
                                        rank={3}
                                        name="랭킹3"
                                        rating={0}
                                        wins={0}
                                        losses={0}
                                        tier="플래티넘"
                                        languageLogo="python"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Game Participation Section */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                            {/* Quick Game Join */}
                            <div className="bg-white rounded-xl shadow-md overflow-hidden">
                                <div className="p-4 bg-blue-500 text-white">
                                    <h2 className="text-xl font-bold">빠른 게임 참가</h2>
                                </div>
                                <div className="p-6">
                                    <p className="text-gray-600 mb-6">실력이 비슷한 상대와 바로 대결을 시작합니다.</p>
                                    <button className="btn-action w-full py-4 px-6 bg-blue-500 text-white font-medium rounded-lg hover:bg-blue-600 transition-colors flex items-center justify-center" onClick={enterRoomBtn}>
                                        <i className="fas fa-bolt mr-2"></i> 빠른 게임 시작
                                    </button>
                                </div>
                            </div>

                            {/* Create Room */}
                            <div className="bg-white rounded-xl shadow-md overflow-hidden">
                                <div className="p-4 bg-purple-500 text-white">
                                    <h2 className="text-xl font-bold">방 생성</h2>
                                </div>
                                <div className="p-6">
                                    <p className="text-gray-600 mb-6">나만의 게임 방을 만들고 친구를 초대하세요.</p>
                                    <button className="btn-action w-full py-4 px-6 bg-purple-500 text-white font-medium rounded-lg hover:bg-purple-600 transition-colors flex items-center justify-center" onClick={() => showRoomSettingsModal(true)}>
                                        <i className="fas fa-plus-circle mr-2"></i> 새 방 만들기
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Available Rooms List */}
                        <RoomList rooms={rooms} enterRoomBtn={enterRoomBtn} fetchRooms={fetchRooms} />
                    </div>
                </div>
            </main>
            <RoomSettingsModal
                showModal={isCreateModalOpen}
                onClose={closeCreateRoomModel}
                onSave={handleSaveNewRoomSettings}
                initialSettings={newRoomSettings}
                currentParticipantsCount={0}
            />
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

            {/* Footer */}
            <footer className="bg-gray-800 text-white py-8 mt-12">
                <div className="container mx-auto px-4">
                    <div className="flex flex-col md:flex-row justify-between">
                        <div className="mb-6 md:mb-0">
                            <h2 className="logo-text text-2xl mb-4">COBY</h2>
                            <p className="text-gray-400 text-sm">Coding Online Battle With You</p>
                        </div>
{/* 
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
                            <div>
                                <h3 className="text-lg font-semibold mb-3">서비스</h3>
                                <ul className="space-y-2 text-gray-400">
                                    <li><button type="button" onClick={enterMainBtn} className="hover:text-white">대결하기</button></li>
                                    <li><button type="button" onClick={enterMainBtn} className="hover:text-white">랭킹</button></li>
                                    <li><button type="button" onClick={enterMainBtn} className="hover:text-white">문제 풀기</button></li>
                                </ul>
                            </div>

                            <div>
                                <h3 className="text-lg font-semibold mb-3">정보</h3>
                                <ul className="space-y-2 text-gray-400">
                                    <li><button type="button" onClick={enterloginBtn} className="hover:text-white">이용약관</button></li>
                                    <li><button type="button" onClick={enterMainBtn} className="hover:text-white">개인정보처리방침</button></li>
                                    <li><button type="button" onClick={enterMainBtn} className="hover:text-white">FAQ</button></li>
                                    <li><button type="button" onClick={enterMainBtn} className="hover:text-white">공지사항</button></li>
                                </ul>
                            </div>

                            <div>
                                <h3 className="text-lg font-semibold mb-3">문의</h3>
                                <ul className="space-y-2 text-gray-400">
                                    <li><button type="button" onClick={enterMainBtn} className="hover:text-white">고객센터</button></li>
                                    <li><button type="button" onClick={enterMainBtn} className="hover:text-white">버그신고</button></li>
                                    <li><button type="button" onClick={enterMainBtn} className="hover:text-white">제휴 문의</button></li>
                                </ul>
                            </div>
                        </div> */}
                    </div>

                    {/* <div className="border-t border-gray-700 mt-8 pt-6 flex flex-col md:flex-row justify-between items-center">
                        <p className="text-gray-400 text-sm">©2025 COBY. All rights reserved.</p>
                        <div className="flex space-x-4 mt-4 md:mt-0">
                            <button type="button" onClick={enterMainBtn} className="text-gray-400 hover:text-white">
                                <i className="fab fa-github"></i>
                            </button>
                            <button type="button" onClick={enterMainBtn} className="text-gray-400 hover:text-white">
                                <i className="fab fa-discord"></i>
                            </button>
                        </div>
                    </div> */}
                </div>
            </footer>
        </div>
    );
}

export default MainPage;