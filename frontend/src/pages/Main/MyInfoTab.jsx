import React from 'react';
import { useAuth } from '../AuthContext/AuthContext';
import { DEFAULT_TIER_NAME, TierBadge } from './TierInfo';

/**
 * '내 정보' 탭에 표시될 콘텐츠 컴포넌트
 */
function MyInfoTab({ onOpenInfoModal }) {
    const { user } = useAuth();

    // 사용자 정보가 없을 경우를 대비한 기본값 설정
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
        </div>
    );
}

export default MyInfoTab;
