import React, { use, useEffect } from 'react';
import { useAuth } from '../AuthContext/AuthContext';
import './MainPage.css';
import { PythonLogo, JavaLogo, CppLogo } from '../../Common/components/LanguageCards';

function MyCard() {
    const { user } = useAuth(); // AuthContext에서 user 정보 가져오기


    const userId = user?.id || 0;               //유저 id
    const nickname = user?.nickname || '게스트';    //닉네임
    const email = user?.email || '';                //이메일
    const ssoProvider = user?.ssoProvider || '';    //sso 제공사
    const providerId = user?.providerId || '';      //제공사 id
    const preferredLanguage = user?.preferredLanguage || 'python';  //선호 언어
    const reportCount = user?.reportCount || 0;     //누적 신고 수
    const totalGame = user?.totalGame || 0;         //총 게임 수
    const winGame = user?.winGame || 0;             //승리 게임 수
    const tierPoints = user?.tierPoint || 0;        //티어 포인트
    // const tierName = user?.tierName || '골드';    // 삭제: tierPoints에 따라 결정하도록 변경
    const tierImageUrl = user?.tierImageUrl || '';  //티어 이미지 경로
    
    const loseGame = totalGame - winGame            //패배 게임 수 

    // 승률 계산 (totalGame이 0이 아닐 경우에만 계산) | 소수점 둘째 자리까지 표시
    const winRate = totalGame > 0 ? ((winGame / totalGame) * 100).toFixed(2) : 0;
    
    // tierPoints에 따라 tierName을 반환하는 함수
    const getTierName = (points) => {
        if (points <= 1000) return '브론즈';
        if (points <= 1500) return '실버';
        if (points <= 2000) return '골드';
        if (points <= 2500) return '플래티넘';
        if (points <= 3000) return '다이아몬드';
        return '마스터';
    };

    const tierName = getTierName(tierPoints); // tierName 결정

    // 👇 추가: tierName에 따라 CSS 클래스를 반환하는 함수
    const getTierClass = (name) => {
        switch (name) {
            case '브론즈': return 'main-tier-bronze';
            case '실버': return 'main-tier-silver';
            case '골드': return 'main-tier-gold';
            case '플래티넘': return 'main-tier-platinum';
            case '다이아몬드': return 'main-tier-diamond';
            case '마스터': return 'main-tier-master';
            default: return 'main-tier-gold';
        }
    };
    
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

    // preferredLanguage에 따라 로고를 렌더링하는 함수
    const renderLogo = () => {
        switch (preferredLanguage) {
            case 'python':
                return <PythonLogo />;
            case 'java':
                return <JavaLogo />;
            case 'cpp':
                return <CppLogo />;
            default:
                return <PythonLogo />; // 기본값
        }
    };

    // preferredLanguage에 따라 카드 배경색 클래스를 반환하는 함수
    const getCardPatternClass = () => {
        switch (preferredLanguage) {
            case 'python':
                return 'bg-blue-100';
            case 'java':
                return 'bg-red-100';
            case 'cpp':
                return 'bg-blue-200';
            default:
                return 'bg-blue-100'; // 기본값
        }
    };


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
                            <div className={`h-full card1-pattern ${getCardPatternClass()} flex flex-col`}>
                                <div className="p-4 flex justify-between items-center">
                                    <div className="text-xl font-bold text-blue-800">{preferredLanguage}</div>
                                    {/* className과 tierName을 동적으로 변경 */}
                                    <div className={`main-tier-badge ${getTierClass(tierName)}`}>
                                        <svg className="main-tier-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" fill="currentColor" />
                                        </svg>
                                        {tierName}
                                    </div>
                                </div>
                                {renderLogo()}
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
                                        {/* className과 tierName을 동적으로 변경 */}
                                        <div className={`main-tier-badge ${getTierClass(tierName)}`}>
                                            <svg className="main-tier-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" fill="currentColor" />
                                            </svg>
                                            {tierName}
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
                                        <div className="bg-blue-500 h-2.5 rounded-full" style={{ width: `${winRate}%` }}></div>
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