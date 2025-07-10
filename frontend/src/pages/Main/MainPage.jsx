import React, { useState, useEffect,useRef } from 'react';
import './MainPage.css';
import { useNavigate } from 'react-router-dom';
import { useUserStore } from '../../store/userStore'
import Cookies from 'js-cookie'


function MainPage() {
    const [isCreateModalOpen, setCreateModalOpen] = useState(false);
    const [isRoomCreatedModalOpen, setRoomCreatedModalOpen] = useState(false);
    const navigate = useNavigate();
    const inputRef = useRef(null);

    const nickname = useUserStore((state) => state.nickname)
    const setNickname = useUserStore((state) => state.setNickname)

    useEffect(() => {
        if (!nickname) {
        const cookieNick = Cookies.get('nickname')
        if (cookieNick) {
            setNickname(cookieNick)
        }
        }
    }, [nickname, setNickname])

     // 현재 사용자 닉네임을 가져옵니다.
  const currentUser = nickname || '게스트';

    // 방 만들기 모달 열기
    const openCreateRoomModal = () => {
        setCreateModalOpen(true);
    };

    // 방 만들기 모달 닫기
    const closeCreateRoomModel = () => {
        setCreateModalOpen(false);
    };

    // 방 제목 검사 후 생성 완료 모달로 변경하는 함수
    const confirmCreateRoom = () => {
        const value = inputRef.current.value.trim();
        if (!value) {
            alert("방 제목을 입력하세요!");
        } else {
            setCreateModalOpen(false);
            setRoomCreatedModalOpen(true);
        }
    };

    // 방 만들기 -> X (방을 다시 제거하는 행동 혹은 X버튼을 아예 제거하는 방향으로 개발해야함)
    const closeCreatedRoomModel = () => {
        setRoomCreatedModalOpen(false);
    };

    //게임 대기방으로 이동
    const enterRoomBtn = () => {
        alert('방에 입장합니다!');
        navigate('/waitingRoom');
    };

    //마이페이지로 이동    
    const enterMypageBtn = () => {
        navigate('/myPage');
    };

    
    const items = [
    // 현재 존재하는 아이템들 (예: 1개)
    <div key="1" className="bg-gray-200 h-32 rounded">실제 콘텐츠</div>
    ];

    const placeholderCount = 6 - items.length;
    const placeholders = Array.from({ length: placeholderCount }, (_, i) => (
        <div key={`placeholder-${i}`} className="invisible">placeholder</div>
    ));

    return (
    <div className='MainPage'>
        <div className='min-h-screen'>
            <nav className="main-glass-effect sticky top-0 z-50 px-6 py-4 flex justify-between items-center border-b border-blue-900/30">
                <button className="flex items-center space-x-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-500" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M12.316 3.051a1 1 0 01.633 1.265l-4 12a1 1 0 11-1.898-.632l4-12a1 1 0 011.265-.633zM5.707 6.293a1 1 0 010 1.414L3.414 10l2.293 2.293a1 1 0 11-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0zm8.586 0a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 11-1.414-1.414L16.586 10l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
                <h1 className="text-2xl font-bold text-white">COBY</h1>
                </button>
                <div className="flex items-center space-x-6">
                <button className="text-blue-300 hover:text-blue-100 transition">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                    </svg>
                </button>
                <div className="relative main-pulse">
                    <button className="text-blue-300 hover:text-blue-100 transition">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                    </svg>
                    </button>
                </div>
                <button className="flex items-center space-x-3" onClick={enterMypageBtn}>
                    <div className="main-tier-badge w-10 h-10 rounded-full bg-blue-900 flex items-center justify-center">
                    <span className="text-sm font-bold text-blue-200">다이아</span>
                    </div>
                    <span className="font-medium">{currentUser}</span>
                </button>
                </div>
            </nav>
            <main className="container mx-auto px-4 py-6">
                {/* 사용자 정보 요약 섹션 */}
                <section className="mb-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* 프로필 카드 */}
                    <div className="main-glass-effect rounded-xl p-6 main-animate-fade-in">
                    <div className="flex items-center space-x-4">
                        <div className="main-tier-badge w-16 h-16 rounded-full bg-blue-900 flex items-center justify-center">
                        <span className="text-lg font-bold text-blue-200">다이아</span>
                        </div>
                        <div>
                        <h2 className="text-xl font-bold text-white">{currentUser}</h2>
                        <p className="text-blue-300">승률: 78% (승 45 / 패 13)</p>
                        </div>
                    </div>
                    <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                        <div className="main-glass-effect rounded-lg p-2">
                        <p className="text-xs text-blue-300">순위</p>
                        <p className="text-xl font-bold text-white">12위</p>
                        </div>
                        <div className="main-glass-effect rounded-lg p-2">
                        <p className="text-xs text-blue-300">포인트</p>
                        <p className="text-xl font-bold text-white">3,842</p>
                        </div>
                        <div className="main-glass-effect rounded-lg p-2">
                        <p className="text-xs text-blue-300">참여</p>
                        <p className="text-xl font-bold text-white">58회</p>
                        </div>
                    </div>
                    </div>
                    {/* 최근 기록 */}
                    <div className="main-glass-effect rounded-xl p-6 main-animate-fade-in" style={{animationDelay: '0.1s'}}>
                    <h3 className="text-lg font-semibold text-white mb-3 flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                        </svg>
                        최근 기록
                    </h3>
                    <div className="space-y-3 main-custom-scrollbar overflow-y-auto max-h-40">
                        <div className="flex justify-between items-center main-glass-effect rounded-lg p-2 border-l-4 border-green-500">
                        <div>
                            <p className="font-medium text-white">알고리즘 배틀 #128</p>
                            <p className="text-xs text-blue-300">2시간 전</p>
                        </div>
                        <span className="text-green-400 font-medium">승리</span>
                        </div>
                        <div className="flex justify-between items-center main-glass-effect rounded-lg p-2 border-l-4 border-green-500">
                        <div>
                            <p className="font-medium text-white">자료구조 마스터 #45</p>
                            <p className="text-xs text-blue-300">어제</p>
                        </div>
                        <span className="text-green-400 font-medium">승리</span>
                        </div>
                        <div className="flex justify-between items-center main-glass-effect rounded-lg p-2 border-l-4 border-red-500">
                        <div>
                            <p className="font-medium text-white">SQL 챌린지 #12</p>
                            <p className="text-xs text-blue-300">2일 전</p>
                        </div>
                        <span className="text-red-400 font-medium">패배</span>
                        </div>
                    </div>
                    </div>
                </div>
                </section>
                {/* 방 목록 및 생성 섹션 */}
                <section className="mb-8">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-white">참가 가능한 방</h2>
                    <div className="flex space-x-3">
                    <button id="openCreateRoomModal" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center transition" onClick={openCreateRoomModal}>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                        </svg>
                        방 만들기
                    </button>
                    <button id="joinRoomBtn" className="bg-blue-900/50 hover:bg-blue-800 text-white px-4 py-2 rounded-lg flex items-center transition" onClick={enterRoomBtn}>
                        빠른 시작
                    </button>
                    </div>
                </div>
                {/* 필터 옵션 */}
                <div className="main-glass-effect rounded-xl p-4 mb-6">
                    <div className="flex flex-wrap items-center gap-4">
                    <div className="flex items-center">
                        <span className="text-sm text-blue-300 mr-2">문제 유형:</span>
                        <select className="bg-blue-900/30 text-white border border-blue-800 rounded-md px-3 py-1 text-sm">
                        <option value="all">전체</option>
                        <option value="algorithm">알고리즘</option>
                        <option value="datastructure">자료구조</option>
                        <option value="dp">동적계획법</option>
                        <option value="sql">SQL</option>
                        <option value="frontend">프론트엔드</option>
                        </select>
                    </div>
                    <div className="flex items-center">
                        <span className="text-sm text-blue-300 mr-2">난이도:</span>
                        <select className="bg-blue-900/30 text-white border border-blue-800 rounded-md px-3 py-1 text-sm">
                        <option value="all">전체</option>
                        <option value="easy">쉬움</option>
                        <option value="medium">보통</option>
                        <option value="hard">어려움</option>
                        </select>
                    </div>
                    <div className="flex items-center">
                        <span className="text-sm text-blue-300 mr-2">상태:</span>
                        <select className="bg-blue-900/30 text-white border border-blue-800 rounded-md px-3 py-1 text-sm">
                        <option value="all">전체</option>
                        <option value="waiting">대기중</option>
                        <option value="progress">진행중</option>
                        </select>
                    </div>
                    <div className="ml-auto">
                        <div className="relative">
                        <input type="text" placeholder="방 검색..." className="bg-blue-900/30 text-white border border-blue-800 rounded-md pl-9 pr-3 py-1 text-sm w-64" />
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-blue-300 absolute left-3 top-1/2 transform -translate-y-1/2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        </div>
                    </div>
                    </div>
                </div>
                {/* 방 목록 */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {/* 방 1 */}
                    <div className="main-room-card main-glass-effect rounded-xl overflow-hidden">
                    <div className="main-gradient-bg px-4 py-3 flex justify-between items-center">
                        <h3 className="font-bold text-white">알고리즘 배틀 #129</h3>
                        <span className="bg-green-500/20 text-green-400 text-xs px-2 py-1 rounded-full">대기중</span>
                    </div>
                    <div className="p-4">
                        <div className="flex justify-between mb-3">
                        <span className="text-sm text-blue-300">문제 유형: <span className="text-white">알고리즘</span></span>
                        <span className="text-sm text-blue-300">난이도: <span className="text-yellow-400">보통</span></span>
                        </div>
                        <div className="flex justify-between mb-4">
                        <span className="text-sm text-blue-300">참가자: <span className="text-white">1/8</span></span>
                        <span className="text-sm text-blue-300">시작: <span className="text-white">2분 후</span></span>
                        </div>
                        <div className="flex items-center mb-4">
                        <span className="text-xs text-white-500">방장 : </span>
                        <div className="w-8 h-8 rounded-full bg-green-700 flex items-center justify-center text-xs font-medium ml-1">GM</div>
                        </div>
                        <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg transition" onClick={enterRoomBtn}>
                        입장하기
                        </button>
                    </div>
                    </div>
                
                </div>
                
                <div className="mt-6 flex justify-center">
                    <nav className="inline-flex rounded-md shadow-sm">
                    <a href="#" className="px-3 py-2 rounded-l-md border border-gray-300 bg-blue-900/50 hover:bg-blue-800 text-sm font-medium text-gray-500">이전</a>
                    <a href="#" className="px-3 py-2 border-t border-b border-gray-300 bg-blue-600 hover:bg-blue-700 text-sm font-medium text-white-600">1</a>
                    {/* <a href="#" className="px-3 py-2 border-t border-b border-gray-300 bg-blue-900/50 hover:bg-blue-800 text-sm font-medium text-gray-500">2</a> */}
                    {/* <a href="#" className="px-3 py-2 border-t border-b border-gray-300 bg-blue-900/50 hover:bg-blue-800 text-sm font-medium text-gray-500">3</a> */}
                    <a href="#" className="px-3 py-2 rounded-r-md border border-gray-300 bg-blue-900/50 hover:bg-blue-800 text-sm font-medium text-gray-500">다음</a>
                    </nav>
                </div>
                </section>
                {/* 랭킹 및 공지사항 섹션 */}
                <section>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* 실시간 랭킹 */}
                    <div className="main-glass-effect rounded-xl p-6">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-bold text-white flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                        실시간 랭킹
                        </h2>
                        <a href="#" className="text-blue-600 hover:text-blue-800 text-sm font-medium">모든 랭킹 보기</a>
                    </div>
                    <div className="space-y-4 main-custom-scrollbar overflow-y-auto max-h-96">
                        {/* 1위 */}
                        <div className="main-glass-effect rounded-lg p-3 flex items-center">
                        <div className="w-8 h-8 rounded-full bg-yellow-500 flex items-center justify-center text-white font-bold mr-3">1</div>
                        <div className="main-tier-badge w-10 h-10 rounded-full bg-blue-900 flex items-center justify-center mr-3">
                            <span className="text-xs font-bold text-blue-200">1</span>
                        </div>
                        <div className="flex-1">
                            <h3 className="font-medium text-white">랭킹1</h3>
                            <div className="flex items-center">
                            <span className="text-xs text-blue-300">승률: 92%</span>
                            <span className="mx-2 text-blue-700">•</span>
                            <span className="text-xs text-blue-300">총 점수: 9,842</span>
                            </div>
                        </div>
                        <div className="text-right">
                            <span className="text-lg font-bold text-white">9,842</span>
                            <p className="text-xs text-green-400">+128 ↑</p>
                        </div>
                        </div>
                        {/* 2위 */}
                        <div className="main-glass-effect rounded-lg p-3 flex items-center">
                        <div className="w-8 h-8 rounded-full bg-gray-400 flex items-center justify-center text-white font-bold mr-3">2</div>
                        <div className="main-tier-badge w-10 h-10 rounded-full bg-blue-900 flex items-center justify-center mr-3">
                            <span className="text-xs font-bold text-blue-200">2</span>
                        </div>
                        <div className="flex-1">
                            <h3 className="font-medium text-white">랭킹2</h3>
                            <div className="flex items-center">
                            <span className="text-xs text-blue-300">승률: 89%</span>
                            <span className="mx-2 text-blue-700">•</span>
                            <span className="text-xs text-blue-300">총 점수: 9,512</span>
                            </div>
                        </div>
                        <div className="text-right">
                            <span className="text-lg font-bold text-white">9,512</span>
                            <p className="text-xs text-red-400">-42 ↓</p>
                        </div>
                        </div>
                        {/* 3위 */}
                        <div className="main-glass-effect rounded-lg p-3 flex items-center">
                        <div className="w-8 h-8 rounded-full bg-amber-700 flex items-center justify-center text-white font-bold mr-3">3</div>
                        <div className="main-tier-badge w-10 h-10 rounded-full bg-blue-900 flex items-center justify-center mr-3">
                            <span className="text-xs font-bold text-blue-200">3</span>
                        </div>
                        <div className="flex-1">
                            <h3 className="font-medium text-white">랭킹3</h3>
                            <div className="flex items-center">
                            <span className="text-xs text-blue-300">승률: 85%</span>
                            <span className="mx-2 text-blue-700">•</span>
                            <span className="text-xs text-blue-300">총 점수: 8,976</span>
                            </div>
                        </div>
                        <div className="text-right">
                            <span className="text-lg font-bold text-white">8,976</span>
                            <p className="text-xs text-green-400">+86 ↑</p>
                        </div>
                        </div>
                        {/* 4위 */}
                        <div className="main-glass-effect rounded-lg p-3 flex items-center">
                        <div className="w-8 h-8 rounded-full bg-blue-900/50 flex items-center justify-center text-white font-bold mr-3">4</div>
                        <div className="main-tier-badge w-10 h-10 rounded-full bg-blue-900 flex items-center justify-center mr-3">
                            <span className="text-xs font-bold text-blue-200">4</span>
                        </div>
                        <div className="flex-1">
                            <h3 className="font-medium text-white">랭킹4</h3>
                            <div className="flex items-center">
                            <span className="text-xs text-blue-300">승률: 82%</span>
                            <span className="mx-2 text-blue-700">•</span>
                            <span className="text-xs text-blue-300">총 점수: 8,245</span>
                            </div>
                        </div>
                        <div className="text-right">
                            <span className="text-lg font-bold text-white">8,245</span>
                            <p className="text-xs text-green-400">+52 ↑</p>
                        </div>
                        </div>
                        {/* 5위 */}
                        <div className="main-glass-effect rounded-lg p-3 flex items-center">
                        <div className="w-8 h-8 rounded-full bg-blue-900/50 flex items-center justify-center text-white font-bold mr-3">5</div>
                        <div className="main-tier-badge w-10 h-10 rounded-full bg-blue-900 flex items-center justify-center mr-3">
                            <span className="text-xs font-bold text-blue-200">5</span>
                        </div>
                        <div className="flex-1">
                            <h3 className="font-medium text-white">랭킹5</h3>
                            <div className="flex items-center">
                            <span className="text-xs text-blue-300">승률: 80%</span>
                            <span className="mx-2 text-blue-700">•</span>
                            <span className="text-xs text-blue-300">총 점수: 7,921</span>
                            </div>
                        </div>
                        <div className="text-right">
                            <span className="text-lg font-bold text-white">7,921</span>
                            <p className="text-xs text-red-400">-18 ↓</p>
                        </div>
                        </div>
                        {/* 6위 */}
                        <div className="main-glass-effect rounded-lg p-3 flex items-center border border-blue-500">
                        <div className="w-8 h-8 rounded-full bg-blue-900/50 flex items-center justify-center text-white font-bold mr-3">12</div>
                        <div className="main-tier-badge w-10 h-10 rounded-full bg-blue-900 flex items-center justify-center mr-3">
                            <span className="text-xs font-bold text-blue-200">랭6</span>
                        </div>
                        <div className="flex-1">
                            <h3 className="font-medium text-white">랭킹6</h3>
                            <div className="flex items-center">
                            <span className="text-xs text-blue-300">승률: 78%</span>
                            <span className="mx-2 text-blue-700">•</span>
                            <span className="text-xs text-blue-300">총 점수: 3,842</span>
                            </div>
                        </div>
                        <div className="text-right">
                            <span className="text-lg font-bold text-white">3,842</span>
                            <p className="text-xs text-green-400">+64 ↑</p>
                        </div>
                        </div>
                    </div>
                    </div>

                    {/* 공지사항 */}
                    <div className="main-glass-effect rounded-xl p-6">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-bold text-white flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M18 3a1 1 0 00-1.447-.894L8.763 6H5a3 3 0 000 6h.28l1.771 5.316A1 1 0 008 18h1a1 1 0 001-1v-4.382l6.553 3.276A1 1 0 0018 15V3z" clipRule="evenodd" />
                        </svg>
                        공지사항
                        </h2>
                        <a href="#" className="text-blue-600 hover:text-blue-800 text-sm font-medium">모든 공지사항 보기</a>
                    </div>
                    <div className="space-y-4 main-custom-scrollbar overflow-y-auto max-h-96">
                        {/* 공지 1 */}
                        <div className="main-glass-effect rounded-lg p-4 border-l-4 border-blue-500">
                        <div className="flex justify-between items-center mb-2">
                            <h3 className="font-semibold text-white">공지1 입니다.</h3>
                            <span className="text-xs text-blue-300">2025.06.01</span>
                        </div>
                        <p className="text-sm text-blue-100 mb-2">COBY 플랫폼이 새롭게 업데이트되었습니다. 주요 변경사항은 다음과 같습니다.</p>
                        <ul className="text-xs text-blue-300 list-disc list-inside space-y-1">
                            <li>변경사항1</li>
                            <li>변경사항2</li>
                            <li>변경사항3</li>
                        </ul>
                        <button className="text-blue-400 hover:text-blue-300 text-xs mt-2 transition">자세히 보기</button>
                        </div>
                        {/* 공지 2 */}
                        <div className="main-glass-effect rounded-lg p-4 border-l-4 border-yellow-500">
                        <div className="flex justify-between items-center mb-2">
                            <h3 className="font-semibold text-white">공지2 입니다.</h3>
                            <span className="text-xs text-blue-300">2025.06.01</span>
                        </div>
                        <p className="text-sm text-blue-100 mb-2">내용</p>
                        </div>
                        {/* 공지 3 */}
                        <div className="main-glass-effect rounded-lg p-4">
                        <div className="flex justify-between items-center mb-2">
                            <h3 className="font-semibold text-white">공지3 입니다.</h3>
                            <span className="text-xs text-blue-300">2025.06.01</span>
                        </div>
                        <p className="text-sm text-blue-100 mb-2">새로운 문제가 추가되었습니다. 다양한 난이도의 문제를 풀어보세요.</p>
                        <div className="grid grid-cols-3 gap-2 mt-3">
                            <div className="bg-blue-900/30 rounded p-2 text-center">
                            <p className="text-xs text-blue-300">알고리즘</p>
                            <p className="text-sm font-medium text-white">+10문제</p>
                            </div>
                            <div className="bg-blue-900/30 rounded p-2 text-center">
                            <p className="text-xs text-blue-300">자료구조</p>
                            <p className="text-sm font-medium text-white">+10문제</p>
                            </div>
                            <div className="bg-blue-900/30 rounded p-2 text-center">
                            <p className="text-xs text-blue-300">동적계획법</p>
                            <p className="text-sm font-medium text-white">+10문제</p>
                            </div>
                        </div>
                        </div>
                        {/* 공지 4 */}
                        <div className="main-glass-effect rounded-lg p-4">
                        <div className="flex justify-between items-center mb-2">
                            <h3 className="font-semibold text-white">공지4 입니다.</h3>
                            <span className="text-xs text-blue-300">2025.06.01</span>
                        </div>
                        <p className="text-sm text-blue-100 mb-3">4월 COBY 랭킹입니다.</p>
                        <div className="space-y-2">
                            <div className="flex items-center">
                            <div className="w-6 h-6 rounded-full bg-yellow-500 flex items-center justify-center text-white font-bold mr-2 text-xs">1</div>
                            <span className="text-sm text-white">랭킹1</span>
                            <span className="ml-auto text-xs text-blue-300">9,842점</span>
                            </div>
                            <div className="flex items-center">
                            <div className="w-6 h-6 rounded-full bg-gray-400 flex items-center justify-center text-white font-bold mr-2 text-xs">2</div>
                            <span className="text-sm text-white">랭킹2</span>
                            <span className="ml-auto text-xs text-blue-300">9,512점</span>
                            </div>
                            <div className="flex items-center">
                            <div className="w-6 h-6 rounded-full bg-amber-700 flex items-center justify-center text-white font-bold mr-2 text-xs">3</div>
                            <span className="text-sm text-white">랭킹3</span>
                            <span className="ml-auto text-xs text-blue-300">8,976점</span>
                            </div>
                        </div>
                        </div>
                    </div>
                    </div>
                </div>
                </section>
            </main>


            {/* 방 만들기 모달 */}
            {isCreateModalOpen && (
            <div id="createRoomModal" className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
                <div className="main-glass-effect rounded-xl w-full max-w-md p-6 main-animate-fade-in">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-white">새 방 만들기</h2>
                    <button id="closeCreateModal" className="text-blue-300 hover:text-white transition">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" onClick={closeCreateRoomModel}>
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    </button>
                </div>
                <div className="space-y-4">
                    <div>
                    <label className="block text-sm text-blue-300 mb-1">방 제목</label>
                    <input type="text" ref={inputRef} className="w-full bg-blue-900/30 border border-blue-800 rounded-md px-3 py-2 text-white" placeholder="방 제목을 입력하세요" />
                    </div>
                    <div>
                    <label className="block text-sm text-blue-300 mb-1">문제 유형</label>
                    <select className="w-full bg-blue-900/30 border border-blue-800 rounded-md px-3 py-2 text-white">
                        <option value="algorithm">알고리즘</option>
                        <option value="datastructure">자료구조</option>
                        <option value="dp">동적계획법</option>
                        <option value="sql">SQL</option>
                        <option value="frontend">프론트엔드</option>
                    </select>
                    </div>
                    <div>
                    <label className="block text-sm text-blue-300 mb-1">난이도</label>
                    <select className="w-full bg-blue-900/30 border border-blue-800 rounded-md px-3 py-2 text-white">
                        <option value="easy">쉬움</option>
                        <option value="medium">보통</option>
                        <option value="hard">어려움</option>
                    </select>
                    </div>
                    <div>
                    <label className="block text-sm text-blue-300 mb-1">최대 참가자 수</label>
                    <select className="w-full bg-blue-900/30 border border-blue-800 rounded-md px-3 py-2 text-white">
                        <option value={2}>2명</option>
                        <option value={4}>4명</option>
                        <option value={6}>6명</option>
                        <option value={8} selected>8명</option>
                    </select>
                    </div>
                    <div>
                    <label className="block text-sm text-blue-300 mb-1">제한 시간</label>
                    <select className="w-full bg-blue-900/30 border border-blue-800 rounded-md px-3 py-2 text-white">
                        <option value={15}>15분</option>
                        <option value={30} selected>30분</option>
                        <option value={45}>45분</option>
                        <option value={60}>60분</option>
                    </select>
                    </div>
                    <div className="flex items-center">
                    <input type="checkbox" id="privateRoom" className="mr-2" />
                    <label htmlFor="privateRoom" className="text-sm text-blue-300">비공개 방 (입장 코드로만 입장 가능)</label>
                    </div>
                    <button id="confirmCreateRoom" className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg transition mt-2" onClick={confirmCreateRoom}>
                    방 만들기
                    </button>
                </div>
                </div>
            </div>
            )}

            {/* 방 입장 코드 모달 */}
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
            { isRoomCreatedModalOpen && (
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

        </div>
    </div>
  );
}

export default MainPage;

