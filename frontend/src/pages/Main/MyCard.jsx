import React, { use, useEffect } from 'react';
import { useAuth } from '../AuthContext/AuthContext'; 
import './MainPage.css'; 

function MyCard() {
    const { user } = useAuth(); // AuthContext에서 user 정보 가져오기


    const userId = user?.id || 0;               //유저 id
    const nickname = user?.nickname || '게스트';    //닉네임
    const email = user?.email || '';                //이메일
    const ssoProvider = user?.ssoProvider || '';    //sso 제공사
    const providerId = user?.providerId || '';      //제공사 id
    const preferredLanguage = user?.preferredLanguage || 'Python';  //선호 언어
    const reportCount = user?.reportCount || 0;     //누적 신고 수
    const totalGame = user?.totalGame || 0;         //총 게임 수
    const winGame = user?.winGame || 0;             //승리 게임 수
    const tierPoints = user?.tierPoint || 0;        //티어 포인트
    const tierName = user?.tierName || '골드';               //티어 아이디
    const tierImageUrl = user?.tierImageUrl || '';  //티어 이미지 경로
    
    const loseGame = totalGame - winGame            //패배 게임 수 

    // 승률 계산 (totalGame이 0이 아닐 경우에만 계산) | 소수점 둘째 자리까지 표시
    const winRate = totalGame > 0 ? ((winGame / totalGame) * 100).toFixed(2) : 0;
    
    // 별 생성 함수
    const createStars = () => {
        const cardBacks = document.querySelectorAll('.night-sky');
        if (!cardBacks.length) return; // 요소가 없으면 함수 종료

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

    return (
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
                                    <div className="text-xl font-bold text-blue-800">{preferredLanguage}</div>
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
                                        <h3 className="text-2xl font-bold text-gray-800">{nickname}</h3>
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
                                        <span className="text-white font-bold">{winRate}%</span>
                                    </div>
                                    <div className="w-full bg-gray-300 rounded-full h-2.5">
                                        <div className="bg-blue-500 h-2.5 rounded-full" style={{ width: '68%' }}></div>
                                    </div>
                                </div>

                                {/* 승리, 패배, 총 게임 정보 박스들 */}
                                <div className="grid grid-cols-3 gap-2 mb-4">
                                    <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 text-center">
                                        <div className="text-2xl font-bold text-white">{winGame}</div>
                                        <div className="text-xs text-blue-300">승리</div>
                                    </div>
                                    <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 text-center">
                                        <div className="text-2xl font-bold text-white">{loseGame}</div>
                                        <div className="text-xs text-red-300">패배</div>
                                    </div>
                                    <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 text-center">
                                        <div className="text-2xl font-bold text-white">{totalGame}</div>
                                        <div className="text-xs text-gray-300">총 게임</div>
                                    </div>
                                </div>

                                {/* 레이팅, 랭킹 정보 박스 */}
                                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 mb-4">
                                    <div className="flex justify-between items-center mb-1">
                                        <span className="text-white text-sm">점수</span>
                                        <span className="text-white font-bold">{tierPoints}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-white text-sm">랭킹</span>
                                        <span className="text-white font-bold">0 위</span>
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
        </div>
    );
}

export default MyCard;