import React, { useState, useEffect } from 'react';
import { useAuth } from '../AuthContext/AuthContext';
import { DEFAULT_TIER_NAME, TierBadge } from './TierInfo';

/**
 * '내 정보' 탭에 표시될 콘텐츠 컴포넌트
 */
function MyInfoTab({ onOpenInfoModal }) {
    const { user } = useAuth();
    
    // API로부터 받아온 최근 대결 기록 상태
    const [recentMatches, setRecentMatches] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    // 사용자 정보가 없을 경우를 대비한 기본값 설정
    const userId = user?.id;
    const nickname = user?.nickname || '게스트';
    const tierName = user?.tierName || DEFAULT_TIER_NAME;
    const tierPoints = user?.tierPoint ?? 0;
    const totalGame = user?.totalGame ?? 0;
    const winGame = user?.winGame ?? 0;
    const loseGame = totalGame - winGame;
    // 승률 계산 (0으로 나누는 경우 방지), 소수점 둘째 자리까지
    const winRate = totalGame > 0 ? ((winGame / totalGame) * 100).toFixed(2) : 0;
    
    // 티어 뱃지 클릭 시 'tier' 탭으로 모달을 열도록 호출
    const handleTierBadgeClick = () => {
        onOpenInfoModal('tier');
    };

    /**
     * 날짜 문자열(UTC 추정)을 한국 시간(KST) 문자열로 변환합니다.
     * @param {string} dateString - 변환할 날짜 문자열 (API의 'createdAt')
     * @returns {string} 'YYYY. MM. DD. HH:mm' 형식의 KST 문자열
     */
    const formatToKST = (dateString) => {
        if (!dateString) return '날짜 정보 없음';

        const utcDateString = dateString.endsWith('Z') ? dateString : dateString + 'Z';
        
        try {
            const date = new Date(utcDateString);
            return date.toLocaleString('ko-KR', {
                timeZone: 'Asia/Seoul',
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
                hour12: false
            }).replace(/\. /g, '.').replace(/\.$/, ''); // 'YYYY. MM. DD. HH:mm' 형식으로 정리
        } catch (e) {
            console.error('KST 변환 오류:', e);
            return dateString; // 변환 실패 시 원본 반환
        }
    };

    // 컴포넌트 마운트 시 및 userId 변경 시 최근 대결 기록 API 호출
    useEffect(() => {
        if (!userId) return; // userId가 없으면 API 호출 안 함

        const fetchRecentMatches = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const response = await fetch(`${process.env.REACT_APP_API_URL}/api/rooms/${userId}/history`); 
                
                if (!response.ok) {
                    throw new Error('최근 대결 정보를 불러오는데 실패했습니다.');
                }
                
                const data = await response.json();

                setRecentMatches(data.slice(-5).reverse()); 
            } catch (err) {
                setError(err.message);
            } finally {
                setIsLoading(false);
            }
        };

        fetchRecentMatches();
    }, [userId]); // userId가 변경될 때만 API를 다시 호출합니다.

    return (
        <div className="bg-white rounded-xl shadow-md p-8">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">{nickname}</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* 티어 정보 */}
                <div className="my-info-card">
                    <h3 className="text-xl font-bold mb-4">티어 정보</h3>
                    <div className="flex items-center justify-between mb-2">
                        <span className="font-semibold">현재 티어</span>
                        <div className="cursor-pointer" onClick={handleTierBadgeClick}>
                            <TierBadge tierName={tierName} />
                        </div>
                    </div>
                    <div className="flex items-center justify-between">
                        <span className="font-semibold">티어 점수</span>
                        <span className="font-mono font-bold text-blue-600">{tierPoints.toLocaleString()} 점</span>
                    </div>
                </div>

                {/* 전적 정보 */}
                <div className="my-info-card">
                    <h3 className="text-xl font-bold mb-4">전적 요약</h3>
                    <div className="flex items-center justify-between mb-2">
                        <span className="font-semibold">총 게임 수</span>
                        <span className="font-mono font-bold text-gray-700">{totalGame} 회</span>
                    </div>
                     <div className="flex items-center justify-between mb-2">
                        <span className="font-semibold text-green-600">승리</span>
                        <span className="font-mono font-bold text-green-600">{winGame} 회</span>
                    </div>
                     <div className="flex items-center justify-between mb-2">
                        <span className="font-semibold text-red-600">패배</span>
                        <span className="font-mono font-bold text-red-600">{loseGame < 0 ? 0 : loseGame} 회</span>
                    </div>
                    <div className="flex items-center justify-between">
                        <span className="font-semibold">승률</span>
                        <span className="font-mono font-bold text-purple-600">{winRate} %</span>
                    </div>
                </div>
            </div>

            {/* --- 최근 대결 정보 --- */}
            <div className="mt-10">
                <h3 className="text-xl font-bold mb-4">최근 대결</h3>
                {isLoading && <p className="text-gray-500">최근 대결 기록을 불러오는 중...</p>}
                {error && <p className="text-red-500">{error}</p>}
                {!isLoading && !error && recentMatches.length === 0 && (
                    <div className="text-center text-gray-500 p-4 border rounded-lg">
                        최근 대결 기록이 없습니다.
                    </div>
                )}
                {!isLoading && !error && recentMatches.length > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-5 gap-4">
                        {recentMatches.map((match, index) => (
                            <div 
                                key={match.createdAt || index} 
                                className={`p-4 rounded-lg border ${
                                    match.winner ? 'bg-blue-50 border-blue-200' : 'bg-red-50 border-red-200'
                                }`}
                            >
                                <p className="text-xs text-gray-600 mb-1">
                                    {formatToKST(match.createdAt)}
                                </p>
                                <p className="font-semibold text-gray-800 truncate mb-2">
                                    {match.roomName || '문제 이름 없음'}
                                </p>
                                <span 
                                    className={`font-bold text-lg ${
                                        match.winner ? 'text-blue-600' : 'text-red-600'
                                    }`}
                                >
                                    {match.winner ? '승리' : '패배'}
                                </span>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

export default MyInfoTab;