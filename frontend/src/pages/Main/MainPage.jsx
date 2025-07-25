
import React, { useState, useEffect, useRef } from 'react';
import './MainPage.css';
import { useNavigate } from 'react-router-dom';
import { useUserStore } from '../../store/userStore';
import Cookies from 'js-cookie';
import RoomSettingsModal from '../../Common/components/RoomSettingsModal';
import axios from 'axios';

function MainPage() {
    const [isCreateModalOpen, showRoomSettingsModal] = useState(false);
    const [isRoomCreatedModalOpen, setRoomCreatedModalOpen] = useState(false);
    const [rooms, setRooms] = useState([]);
    const userIconButtonRef = useRef(null);
    const [isUserMenuOpen, setUserMenuOpen] = useState(false);
    const nickname = useUserStore((state) => state.nickname);
    const setNickname = useUserStore((state) => state.setNickname);
    const userMenuRef = useRef(null);
    //차후에 제거 const createRoomModalRef = useRef(null);
    const navigate = useNavigate(); // useNavigate 훅 사용
    //const { user, setUser } = useUserStore(); // useUserStore 훅 사용 (실제 사용은 예시로 생략)
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
        if (!nickname) {
            const cookieNick = Cookies.get('nickname');
            if (cookieNick) {
                setNickname(cookieNick);
            }
        }
        fetchRooms();

    }, [nickname, setNickname]);

    const fetchRooms = async () => {
        try {
            const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/rooms`);
            setRooms(response.data);
        } catch (error) {
            console.error('Error fetching rooms:', error);
            alert('방 목록을 불러오는데 실패했습니다. 잠시 후 다시 시도해주세요.');
        }
    };
    const currentUser = nickname || '게스트';
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
        setRoomCreatedModalOpen(true);
        fetchRooms();
    };
    const closeCreatedRoomModel = () => {
        setRoomCreatedModalOpen(false);
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
    // 별 생성 함수
    const createStars = () => {
        const cardBacks = document.querySelectorAll('.night-sky');

        cardBacks.forEach(nightSky => {
            nightSky.innerHTML = ''; // 기존 별 제거
            const width = nightSky.offsetWidth;
            const height = nightSky.offsetHeight;

            for (let i = 0; i < 50; i++) {
                const star = document.createElement('div');
                star.className = 'star';

                const x = Math.random() * width;
                const y = Math.random() * height;
                const size = Math.random() * 2 + 1;
                const duration = Math.random() * 3 + 2;
                const opacity = Math.random() * 0.5 + 0.5;

                star.style.left = `${x}px`;
                star.style.top = `${y}px`;
                star.style.width = `${size}px`;
                star.style.height = `${size}px`;
                star.style.setProperty('--duration', `${duration}s`);
                star.style.setProperty('--opacity', String(opacity));
                star.style.setProperty('--opacity-half', String(opacity * 0.5));

                nightSky.appendChild(star);
            }
        });
    };

    useEffect(() => {
        createStars();
        window.addEventListener('resize', createStars);
        return () => window.removeEventListener('resize', createStars);
    }, []);
    useEffect(() => {
        const handleClickOutside = (event) => {
            // 사용자 메뉴가 열려 있고,
            // 클릭된 요소가 메뉴 컨테이너(userMenuRef) 또는 사용자 아이콘 버튼(userIconButtonRef)이 아닌 경우
            if (
                isUserMenuOpen &&
                userMenuRef.current &&
                !userMenuRef.current.contains(event.target) &&
                userIconButtonRef.current && // ⭐️ userIconButtonRef 확인
                !userIconButtonRef.current.contains(event.target) // ⭐️ userIconButtonRef 외부인지 확인
            ) {
                setUserMenuOpen(false); // 메뉴 닫기
            }
        };

        document.addEventListener('mousedown', handleClickOutside);

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isUserMenuOpen]);


    const toggleUserMenu1 = () => {
        setUserMenuOpen(prev => !prev); // ⭐️ 이제 isUserMenuOpen 상태를 토글합니다.
    };

    // 방 생성 모달 닫기
    const closeCreateRoomModal = () => {
        setRoomCreatedModalOpen(false);
        document.body.style.overflow = ''; // 스크롤 허용
    };

    // 방 생성 처리
    const createRoom = (event) => {
        event.preventDefault();

        const form = event.target;
        const title = form.roomTitle.value;
        const language = form.roomLanguage.value;
        const capacity = parseInt(form.roomCapacity.value);
        const difficulty = form.roomDifficulty.value;
        const description = form.roomDescription.value;

        alert(`방이 생성되었습니다!\n제목: ${title}\n언어: ${language}\n최대 인원: ${capacity}명\n난이도: ${difficulty}\n설명: ${description}`);
        closeCreateRoomModal();

        // 새 방을 React 상태에 추가
        addNewRoom(title, language, capacity);
    };

    const addNewRoom = (title, language, capacity) => {
        let languageText = '';
        switch (language) {
            case 'python': languageText = 'Python'; break;
            case 'java': languageText = 'Java'; break;
            case 'cpp': languageText = 'C++'; break;
            default: languageText = '모든 언어';
        }

        const newRoom = {
            id: rooms.length + 1, // 간단한 ID 생성
            title: title,
            owner: '코딩마스터', // 임시 방장 이름
            language: languageText,
            current: 1, // 처음에는 1명
            capacity: capacity,
            status: 'green' // 기본 상태
        };

        // 기존 방 목록의 맨 앞에 새 방 추가
        setRooms(prevRooms => [newRoom, ...prevRooms]);
    };



    return (
        //<div className="MainPage">
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

                        <button className="p-2 rounded-full hover:bg-gray-700 transition-colors" onClick={toggleUserMenu1}ref={userIconButtonRef}>
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
                    {/* Left Section - My Card */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-xl shadow-md overflow-hidden">
                            <div className="p-4 bg-gray-50 border-b">
                                <h2 className="text-xl font-bold text-gray-800">내 프로필</h2>
                            </div>

                            {/* My Card (Flippable) */}
                            <div className="p-6">
                                <div className="card1 h-96 w-full mx-auto">
                                    <div className="card1-inner">
                                        {/* Card Front */}
                                        <div className="card1-front bg-white rounded-xl border-8 border-white overflow-hidden">
                                            <div className="h-full card1-pattern bg-blue-100 flex flex-col">
                                                <div className="p-4 flex justify-between items-center">
                                                    <div className="text-xl font-bold text-blue-800">Python</div>
                                                    <div className="main-tier-badge main-tier-gold">
                                                        <svg className="main-tier-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                            <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" fill="currentColor" />
                                                        </svg>
                                                        골드
                                                    </div>
                                                </div>
                                                <div className="logo-container">
                                                    <svg className="language-logo" viewBox="0 0 256 255" xmlns="http://www.w3.org/2000/svg">
                                                        <defs>
                                                            <linearGradient x1="12.959%" y1="12.039%" x2="79.639%" y2="78.201%" id="a">
                                                                <stop stopColor="#387EB8" offset="0%" />
                                                                <stop stopColor="#366994" offset="100%" />
                                                            </linearGradient>
                                                            <linearGradient x1="19.128%" y1="20.579%" x2="90.742%" y2="88.429%" id="b">
                                                                <stop stopColor="#FFE052" offset="0%" />
                                                                <stop stopColor="#FFC331" offset="100%" />
                                                            </linearGradient>
                                                        </defs>
                                                        <path d="M126.916.072c-64.832 0-60.784 28.115-60.784 28.115l.072 29.128h61.868v8.745H41.631S.145 61.355.145 126.77c0 65.417 36.21 63.097 36.21 63.097h21.61v-30.356s-1.165-36.21 35.632-36.21h61.362s34.475.557 34.475-33.319V33.97S194.67.072 126.916.072zM92.802 19.66a11.12 11.12 0 0 1 11.13 11.13 11.12 11.12 0 0 1-11.13 11.13 11.12 11.12 0 0 1-11.13-11.13 11.12 11.12 0 0 1 11.13-11.13z" fill="url(#a)" />
                                                        <path d="M128.757 254.126c64.832 0 60.784-28.115 60.784-28.115l-.072-29.127H127.6v-8.745h86.441s41.486 4.705 41.486-60.712c0-65.416-36.21-63.096-36.21-63.096h-21.61v30.355s1.165 36.21-35.632 36.21h-61.362s-34.475-.557-34.475 33.32v56.013s-5.235 33.897 62.518 33.897zM162.91 234.54a11.12 11.12 0 0 1-11.13-11.13 11.12 11.12 0 0 1 11.13-11.131 11.12 11.12 0 0 1 11.13 11.13 11.12 11.12 0 0 1-11.13 11.13z" fill="url(#b)" />
                                                    </svg>
                                                </div>
                                                <div className="p-4 mt-auto">
                                                    <div className="text-center">
                                                        <h3 className="text-2xl font-bold text-gray-800">{currentUser}</h3>
                                                        <p className="text-sm text-gray-600">카드를 뒤집어 전적을 확인하세요</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Card Back */}
                                        <div className="card1-back bg-white rounded-xl border-8 border-white overflow-hidden">
                                            <div className="h-full main-night-sky flex flex-col p-6">
                                                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 mb-3">
                                                    <div className="flex justify-between items-center">
                                                        <span className="text-white">티어</span>
                                                        <div className="main-tier-badge main-tier-gold">
                                                            <svg className="main-tier-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                                <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" fill="currentColor" />
                                                            </svg>
                                                            골드
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* 승률 정보 박스 */}
                                                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 mb-4">
                                                    <div className="flex justify-between items-center mb-2">
                                                        <span className="text-white">승률</span>
                                                        <span className="text-white font-bold">68%</span>
                                                    </div>
                                                    <div className="w-full bg-gray-300 rounded-full h-2.5">
                                                        <div className="bg-blue-500 h-2.5 rounded-full" style={{ width: '68%' }}></div>
                                                    </div>
                                                </div>

                                                {/* 승리, 패배, 총 게임 정보 박스들 */}
                                                <div className="grid grid-cols-3 gap-2 mb-4">
                                                    <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 text-center">
                                                        <div className="text-2xl font-bold text-white">42</div>
                                                        <div className="text-xs text-blue-300">승리</div>
                                                    </div>
                                                    <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 text-center">
                                                        <div className="text-2xl font-bold text-white">20</div>
                                                        <div className="text-xs text-red-300">패배</div>
                                                    </div>
                                                    <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 text-center">
                                                        <div className="text-2xl font-bold text-white">62</div>
                                                        <div className="text-xs text-gray-300">총 게임</div>
                                                    </div>
                                                </div>

                                                {/* 레이팅, 랭킹 정보 박스 */}
                                                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 mb-4">
                                                    <div className="flex justify-between items-center mb-1">
                                                        <span className="text-white text-sm">레이팅</span>
                                                        <span className="text-white font-bold">1,842</span>
                                                    </div>
                                                    <div className="flex justify-between items-center">
                                                        <span className="text-white text-sm">랭킹</span>
                                                        <span className="text-white font-bold">12위</span>
                                                    </div>
                                                </div>

                                                <div className="mt-auto text-center">
                                                    <p className="text-xs text-gray-300">카드를 뒤집어 프로필을 확인하세요</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Tier Info */}
                            <div className="p-6 bg-gray-50 border-t">
                                <h3 className="text-lg font-bold text-gray-800 mb-3">티어 정보</h3>
                                <div className="space-y-2">
                                    <div className="flex items-center">
                                        <div className="main-tier-badge main-tier-bronze mr-2">
                                            <svg className="main-tier-icon" viewBox="0 0 24 24" fill="none"
                                                 xmlns="http://www.w3.org/2000/svg">
                                                <path
                                                    d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"
                                                    fill="currentColor"/>
                                            </svg>
                                            브론즈
                                        </div>
                                        <span className="text-sm text-gray-600">0 ~ 1000 레이팅</span>
                                    </div>
                                    <div className="flex items-center">
                                        <div className="main-tier-badge main-tier-silver mr-2">
                                            <svg className="main-tier-icon" viewBox="0 0 24 24" fill="none"
                                                 xmlns="http://www.w3.org/2000/svg">
                                                <path
                                                    d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"
                                                    fill="currentColor"/>
                                            </svg>
                                            실버
                                        </div>
                                        <span className="text-sm text-gray-600">1001 ~ 1500 레이팅</span>
                                    </div>
                                    <div className="flex items-center">
                                        <div className="main-tier-badge main-tier-gold mr-2">
                                            <svg className="main-tier-icon" viewBox="0 0 24 24" fill="none"
                                                 xmlns="http://www.w3.org/2000/svg">
                                                <path
                                                    d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"
                                                    fill="currentColor"/>
                                            </svg>
                                            골드
                                        </div>
                                        <span className="text-sm text-gray-600">1501 ~ 2000 레이팅</span>
                                    </div>
                                    <div className="flex items-center">
                                        <div className="main-tier-badge main-tier-platinum mr-2">
                                            <svg className="main-tier-icon" viewBox="0 0 24 24" fill="none"
                                                 xmlns="http://www.w3.org/2000/svg">
                                                <path
                                                    d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"
                                                    fill="currentColor"/>
                                            </svg>
                                            플래티넘
                                        </div>
                                        <span className="text-sm text-gray-600">2001 ~ 2500 레이팅</span>
                                    </div>
                                    <div className="flex items-center">
                                        <div className="main-tier-badge main-tier-diamond mr-2">
                                            <svg className="main-tier-icon" viewBox="0 0 24 24" fill="none"
                                                 xmlns="http://www.w3.org/2000/svg">
                                                <path
                                                    d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"
                                                    fill="currentColor"/>
                                            </svg>
                                            다이아몬드
                                        </div>
                                        <span className="text-sm text-gray-600">2501 ~ 3000 레이팅</span>
                                    </div>
                                    <div className="flex items-center">
                                        <div className="main-tier-badge main-tier-master mr-2">
                                            <svg className="main-tier-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" fill="currentColor" />
                                            </svg>
                                            마스터
                                        </div>
                                        <span className="text-sm text-gray-600">3001+ 레이팅</span>
                                    </div>
                                </div>
                            </div>
                        </div>
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
                                    {/* 2nd Place */}
                                    <div
                                        className="main-rank-card1 bg-white rounded-xl shadow-md overflow-hidden relative">
                                        <div className="main-rank-badge rank-2 absolute top-0 left-0">2</div>
                                        <div className="p-4 bg-gray-50 border-b text-center">
                                            <h3 className="font-bold text-gray-800">알고리즘킹</h3>
                                        </div>
                                        <div className="p-4">
                                            <div className="flex justify-center mb-3">
                                                <svg className="w-12 h-12" viewBox="0 0 256 346"
                                                     xmlns="http://www.w3.org/2000/svg">
                                                    <path
                                                        d="M82.554 267.473s-13.198 7.675 9.393 10.272c27.369 3.122 41.356 2.675 71.517-3.034 0 0 7.93 4.972 19.003 9.279-67.611 28.977-153.019-1.679-99.913-16.517"
                                                        fill="#5382A1"/>
                                                    <path
                                                        d="M74.292 229.659s-14.803 10.958 7.805 13.296c29.236 3.016 52.324 3.263 92.276-4.43 0 0 5.526 5.602 14.215 8.666-81.747 23.904-172.798 1.885-114.296-17.532"
                                                        fill="#5382A1"/>
                                                    <path
                                                        d="M143.942 165.515c16.66 19.18-4.377 36.44-4.377 36.44s42.301-21.837 22.874-49.183c-18.144-25.5-32.059-38.172 43.268-81.858 0 0-118.238 29.53-61.765 94.6"
                                                        fill="#E76F00"/>
                                                    <path
                                                        d="M233.364 295.442s9.767 8.047-10.757 14.273c-39.026 11.823-162.432 15.393-196.714.471-12.323-5.36 10.787-12.8 18.056-14.362 7.581-1.644 11.914-1.337 11.914-1.337-13.705-9.655-88.583 18.957-38.034 27.15 137.853 22.356 251.292-10.066 215.535-26.195"
                                                        fill="#5382A1"/>
                                                    <path
                                                        d="M88.9 190.48s-62.771 14.91-22.228 20.323c17.118 2.292 51.243 1.774 83.03-.89 25.978-2.19 52.063-6.85 52.063-6.85s-9.16 3.923-15.787 8.448c-63.744 16.765-186.886 8.966-151.435-8.183 29.981-14.492 54.358-12.848 54.358-12.848"
                                                        fill="#5382A1"/>
                                                    <path
                                                        d="M201.506 253.422c64.8-33.672 34.839-66.03 13.927-61.67-5.126 1.066-7.411 1.99-7.411 1.99s1.903-2.98 5.537-4.27c41.37-14.545 73.187 42.897-13.355 65.647 0 .001 1.003-.895 1.302-1.697"
                                                        fill="#5382A1"/>
                                                    <path
                                                        d="M162.439.371s35.887 35.9-34.037 91.101c-56.071 44.282-12.786 69.53-.023 98.377-32.73-29.53-56.75-55.526-40.635-79.72C111.395 74.612 176.918 57.393 162.439.37"
                                                        fill="#E76F00"/>
                                                    <path
                                                        d="M95.268 344.665c62.199 3.982 157.712-2.209 159.974-31.64 0 0-4.348 11.158-51.404 20.018-53.088 9.99-118.564 8.824-157.399 2.421.001 0 7.95 6.58 48.83 9.201"
                                                        fill="#5382A1"/>
                                                </svg>
                                            </div>
                                            <div className="text-center mb-3">
                                                <div className="text-sm text-gray-500">레이팅</div>
                                                <div className="text-xl font-bold">2,145</div>
                                            </div>
                                            <div className="flex justify-between text-sm text-gray-500">
                                                <div>승: <span className="font-medium text-gray-800">78</span></div>
                                                <div>패: <span className="font-medium text-gray-800">12</span></div>
                                            </div>
                                        </div>
                                        <div className="p-2 bg-gray-50 border-t text-center">
                                            <div className="main-tier-badge main-tier-platinum mr-2">
                                                <svg className="main-tier-icon" viewBox="0 0 24 24" fill="none"
                                                     xmlns="http://www.w3.org/2000/svg">
                                                    <path
                                                        d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"
                                                        fill="currentColor"/>
                                                </svg>
                                                플래티넘
                                            </div>
                                        </div>
                                    </div>

                                    {/* 1st Place */}
                                    <div
                                        className="main-rank-card bg-white rounded-xl shadow-md overflow-hidden relative">

                                        <div className="main-rank-badge main-rank-1 absolute top-0 left-0">1</div>
                                        <div className="transition duration-300 hover:scale-105">
                                            <div className="p-4 bg-yellow-50 border-b text-center">
                                                <h3 className="font-bold text-gray-800">코드신</h3>
                                            </div>
                                            <div className="p-4">
                                                <div className="flex justify-center mb-3">
                                                    <svg className="w-12 h-12" viewBox="0 0 306 344"
                                                         xmlns="http://www.w3.org/2000/svg">
                                                        <path
                                                            d="M302.107 258.262c2.401-4.159 3.893-8.845 3.893-13.053V99.14c0-4.208-1.49-8.893-3.892-13.052L153 172.175l149.107 86.087z"
                                                            fill="#00599C"/>
                                                        <path
                                                            d="M166.25 341.193l126.5-73.034c3.644-2.104 6.956-5.737 9.357-9.897L153 172.175 3.893 258.263c2.401 4.159 5.714 7.793 9.357 9.896l126.5 73.034c7.287 4.208 19.213 4.208 26.5 0z"
                                                            fill="#004482"/>
                                                        <path
                                                            d="M302.108 86.087c-2.402-4.16-5.715-7.793-9.358-9.897L166.25 3.156c-7.287-4.208-19.213-4.208-26.5 0L13.25 76.19C5.962 80.397 0 90.725 0 99.14v146.069c0 4.208 1.491 8.894 3.893 13.053L153 172.175l149.108-86.088z"
                                                            fill="#659AD2"/>
                                                        <path
                                                            d="M153 274.175c-56.243 0-102-45.757-102-102s45.757-102 102-102c36.292 0 70.139 19.53 88.331 50.968l-44.143 25.544c-9.105-15.736-26.038-25.512-44.188-25.512-28.122 0-51 22.878-51 51 0 28.121 22.878 51 51 51 18.152 0 35.085-9.776 44.191-25.515l44.143 25.543c-18.192 31.441-52.04 50.972-88.334 50.972z"
                                                            fill="#FFF"/>
                                                        <path fill="#FFF"
                                                              d="M243 170.175h-18v-18h-18v18h-18v18h18v18h18v-18h18zM284 170.175h-18v-18h-18v18h-18v18h18v18h18v-18h18z"/>
                                                    </svg>
                                                </div>
                                                <div className="text-center mb-3">
                                                    <div className="text-sm text-gray-500">레이팅</div>
                                                    <div className="text-xl font-bold">2,487</div>
                                                </div>
                                                <div className="flex justify-between text-sm text-gray-500">
                                                    <div>승: <span className="font-medium text-gray-800">92</span></div>
                                                    <div>패: <span className="font-medium text-gray-800">8</span></div>
                                                </div>
                                            </div>
                                            <div className="p-2 bg-gray-50 border-t text-center">
                                                <div className="main-tier-badge main-tier-master mr-2">
                                                    <svg className="main-tier-icon" viewBox="0 0 24 24" fill="none"
                                                         xmlns="http://www.w3.org/2000/svg">
                                                        <path
                                                            d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"
                                                            fill="currentColor"/>
                                                    </svg>
                                                    마스터
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* 3rd Place */}
                                    <div
                                        className="main-rank-card1 bg-white rounded-xl shadow-md overflow-hidden relative">
                                        <div className="main-rank-badge rank-3 absolute top-0 left-0">3</div>
                                        <div className="p-4 bg-gray-50 border-b text-center">
                                            <h3 className="font-bold text-gray-800">파이썬고수</h3>
                                        </div>
                                        <div className="p-4">
                                            <div className="flex justify-center mb-3">
                                                <svg className="w-12 h-12" viewBox="0 0 256 255"
                                                     xmlns="http://www.w3.org/2000/svg">
                                                    <defs>
                                                        <linearGradient x1="12.959%" y1="12.039%" x2="79.639%"
                                                                        y2="78.201%" id="a">
                                                            <stop stopColor="#387EB8" offset="0%"/>
                                                            <stop stopColor="#366994" offset="100%"/>
                                                        </linearGradient>
                                                        <linearGradient x1="19.128%" y1="20.579%" x2="90.742%"
                                                                        y2="88.429%" id="b">
                                                            <stop stopColor="#FFE052" offset="0%"/>
                                                            <stop stopColor="#FFC331" offset="100%"/>
                                                        </linearGradient>
                                                    </defs>
                                                    <path
                                                        d="M126.916.072c-64.832 0-60.784 28.115-60.784 28.115l.072 29.128h61.868v8.745H41.631S.145 61.355.145 126.77c0 65.417 36.21 63.097 36.21 63.097h21.61v-30.356s-1.165-36.21 35.632-36.21h61.362s34.475.557 34.475-33.319V33.97S194.67.072 126.916.072zM92.802 19.66a11.12 11.12 0 0 1 11.13 11.13 11.12 11.12 0 0 1-11.13 11.13 11.12 11.12 0 0 1-11.13-11.13 11.12 11.12 0 0 1 11.13-11.13z"
                                                        fill="url(#a)"/>
                                                    <path
                                                        d="M128.757 254.126c64.832 0 60.784-28.115 60.784-28.115l-.072-29.127H127.6v-8.745h86.441s41.486 4.705 41.486-60.712c0-65.416-36.21-63.096-36.21-63.096h-21.61v30.355s1.165 36.21-35.632 36.21h-61.362s-34.475-.557-34.475 33.32v56.013s-5.235 33.897 62.518 33.897zM162.91 234.54a11.12 11.12 0 0 1-11.13-11.13 11.12 11.12 0 0 1 11.13-11.131 11.12 11.12 0 0 1 11.13 11.13 11.12 11.12 0 0 1-11.13 11.13z"
                                                        fill="url(#b)"/>
                                                </svg>
                                            </div>
                                            <div className="text-center mb-3">
                                                <div className="text-sm text-gray-500">레이팅</div>
                                                <div className="text-xl font-bold">2,089</div>
                                            </div>
                                            <div className="flex justify-between text-sm text-gray-500">
                                                <div>승: <span className="font-medium text-gray-800">65</span></div>
                                                <div>패: <span className="font-medium text-gray-800">15</span></div>
                                            </div>
                                        </div>
                                        <div className="p-2 bg-gray-50 border-t text-center">
                                            <div className="main-tier-badge main-tier-platinum mr-2">
                                                <svg className="main-tier-icon" viewBox="0 0 24 24" fill="none"
                                                     xmlns="http://www.w3.org/2000/svg">
                                                    <path
                                                        d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"
                                                        fill="currentColor"/>
                                                </svg>
                                                플래티넘
                                            </div>
                                        </div>
                                    </div>
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
                                    <button className="btn-action w-full py-4 px-6 bg-blue-500 text-white font-medium rounded-lg hover:bg-blue-600 transition-colors flex items-center justify-center"onClick={enterRoomBtn}>

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
                        <div className="bg-white rounded-xl shadow-md overflow-hidden">
                            <div className="p-4 bg-gray-50 border-b flex justify-between items-center">
                                <h2 className="text-xl font-bold text-gray-800">참여 가능한 방</h2>
                                <div className="flex items-center">
                                    <select className="mr-2 text-sm border rounded-md px-2 py-1">
                                        <option>모든 언어</option>
                                        <option>Python</option>
                                        <option>Java</option>
                                        <option>C++</option>
                                    </select>
                                    <button className="p-1 text-gray-500 hover:text-gray-700">
                                        <i className="fas fa-sync-alt"></i>
                                    </button>
                                </div>
                            </div>

                            <div className="p-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {rooms.map((room) => (
                                        // 배경 투명도를 bg-white/70으로 높여서 가독성을 개선
                                        <div key={room.id} className="main-room-card main-glass-effect backdrop-filter backdrop-blur-md bg-white/70 rounded-xl overflow-hidden">
                                            <div className="main-gradient-bg px-4 py-3 flex justify-between items-center">
                                                <h3 className="font-bold text-black">{room.roomName}</h3>
                                                <span className={`text-xs px-2 py-1 rounded-full ${room.status === 0 ? 'bg-green-500/20 text-green-700' : 'bg-yellow-500/20 text-yellow-700'}`}>
                    {room.status === 0 ? '대기중' : '진행중'}
                </span>
                                            </div>
                                            <div className="p-4">
                                                <div className="flex justify-between mb-3">
                                                    {/* 밝은 text-blue-300 대신 text-blue-700을 사용하여 대비를 높였습니다. */}
                                                    <span className="text-sm text-blue-700">난이도: <span className="text-black">{room.difficulty}</span></span>
                                                    <span className="text-sm text-blue-700">시간 제한: <span className="text-black">{room.timeLimit}</span></span>
                                                </div>
                                                <div className="flex justify-between mb-4">
                                                    <span className="text-sm text-blue-700">참가자: <span className="text-black">{room.currentPart}/{room.maxParticipants}</span></span>
                                                    <span className="text-sm text-blue-700">모드: <span className="text-black">{room.itemMode ? '아이템전' : '노템전'}</span></span>
                                                </div>
                                                {room.isPrivate && (
                                                    <div className="flex items-center mb-4">
                                                        {/* 자물쇠 아이콘 색상도 text-blue-700으로 변경 */}
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-700 mr-1" viewBox="0 0 20 20" fill="currentColor">
                                                            <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                                                        </svg>
                                                        <span className="text-xs text-blue-700">비밀방</span>
                                                    </div>
                                                )}
                                                <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg transition" onClick={enterRoomBtn}>
                                                    입장하기
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                    {rooms.length === 0 && (
                                        <p className="text-white text-center col-span-full">아직 생성된 방이 없습니다. 새로운 방을 만들어 보세요!</p>
                                    )}
                                </div>


                            </div>
                        </div>
                    </div>
                </div>
            </main>
            <RoomSettingsModal
                showModal={isCreateModalOpen}
                onClose={closeCreateRoomModel}
                onSave={handleSaveNewRoomSettings}
                initialSettings={newRoomSettings}
                currentParticipantsCount={0} // 새로 만드는 방이므로 현재 참가자는 0명으로 가정
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

            {/* 방 생성 완료 모달 */}
            {/*}      {isRoomCreatedModalOpen && (
                <div id="roomCreatedModal" className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
                    <div className="main-glass-effect rounded-xl w-full max-w-md p-6 main-animate-fade-in">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold text-white">방 생성 완료</h2>
                            <button id="closeCreatedModal" className="text-blue-300 hover:text-white transition">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" onClick={closeCreatedRoomModel}>
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        <div className="text-center mb-4">
                            <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <h3 className="text-lg font-semibold text-white mb-2">방이 성공적으로 생성되었습니다!</h3>
                            <p className="text-blue-300 mb-4">아래 입장 코드를 친구들에게 공유하세요.</p>
                            <div className="main-glass-effect rounded-lg p-3 flex items-center mb-4">
                                <input type="text" defaultValue="BATTLE-58392" readOnly className="bg-transparent border-none outline-none flex-1 text-white text-center font-bold text-xl" />
                                <button className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-md text-sm transition">복사</button>
                            </div>
                        </div>
                        <div className="flex space-x-3">
                            <button id="shareRoom" className="flex-1 bg-blue-900/50 hover:bg-blue-800 text-white py-2 rounded-lg transition flex items-center justify-center">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                                    <path d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z" />
                                </svg>
                                공유하기
                            </button>
                            <button id="enterCreatedRoom" className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg transition" onClick={enterRoomBtn}>
                                입장하기
                            </button>
                        </div>
                    </div>
                </div>
            )}

*}
            {/* Footer */}
            <footer className="bg-gray-800 text-white py-8 mt-12">
                <div className="container mx-auto px-4">
                    <div className="flex flex-col md:flex-row justify-between">
                        <div className="mb-6 md:mb-0">
                            <h2 className="logo-text text-2xl mb-4">COBY</h2>
                            <p className="text-gray-400 text-sm">Coding Online Battle With You</p>
                        </div>

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
                        </div>
                    </div>

                    <div className="border-t border-gray-700 mt-8 pt-6 flex flex-col md:flex-row justify-between items-center">
                        <p className="text-gray-400 text-sm">©2025 COBY. All rights reserved.</p>
                        <div className="flex space-x-4 mt-4 md:mt-0">
                            <button type="button" onClick={enterMainBtn} className="text-gray-400 hover:text-white">
                                <i className="fab fa-github"></i>
                            </button>
                            <button type="button" onClick={enterMainBtn} className="text-gray-400 hover:text-white">
                                <i className="fab fa-discord"></i>
                            </button>
                        </div>
                    </div>
                </div>
            </footer>

        </div>
        //</div>
    );
}

export default MainPage;