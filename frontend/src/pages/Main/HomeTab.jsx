import React from 'react';
import { useAuth } from '../AuthContext/AuthContext';
import { TierBadge, DEFAULT_TIER_NAME } from './TierInfo';

/**
 * '홈' 탭에 표시될 콘텐츠 컴포넌트 (정보 웹사이트 형식)
 */
function HomeTab({ roomCount, topRanker, setActiveTab }) {
    const { user: currentUser } = useAuth();

    // 랭킹 1위 정보
    const topRankerNick = topRanker?.nickName ?? 'N/A';
    const topRankerTier = topRanker?.tier?.name ?? DEFAULT_TIER_NAME;
    const topRankerPoints = topRanker?.tierPoint ?? 0;

    // 현재 사용자 정보
    const userNick = currentUser?.nickname ?? '게스트';
    const userWin = currentUser?.winGame ?? 0;
    const userTotal = currentUser?.totalGame ?? 0;
    const userLoss = userTotal - userWin < 0 ? 0 : userTotal - userWin;
    const userWinRate = userTotal > 0 ? ((userWin / userTotal) * 100).toFixed(1) : 0;

    return (
        <div className="p-4 md:p-8 space-y-8">
            
            {/* --- 환영 메시지 섹션 --- */}
            <section>
                <h2 className="text-3xl md:text-4xl font-bold text-gray-800">
                    <span className="text-blue-600">{userNick}</span>님, 환영합니다!
                </h2>
                <p className="mt-2 text-gray-500">
                    오늘도 COBY와 함께 코딩 실력을 향상시켜 보세요.
                </p>
            </section>

            {/* --- 바로가기가 포함된 정보 섹션 --- */}
            <section className="space-y-6">
                
                {/* Row 1: 현재 생성된 방 */}
                <div className="bg-white rounded-lg p-6 flex items-center justify-between shadow-sm border hover:shadow-md transition-shadow">
                    <div className="flex items-center">
                        <i className="fas fa-door-open text-3xl text-blue-500 mr-5 w-8 text-center"></i>
                        <div>
                            <h3 className="font-bold text-gray-700 text-lg">현재 생성된 방</h3>
                            <p className="text-3xl font-bold text-blue-600">{roomCount}개</p>
                        </div>
                    </div>
                    <button 
                        onClick={() => setActiveTab('game')}
                        className="bg-blue-50 text-blue-700 font-semibold py-2 px-5 rounded-lg hover:bg-blue-100 transition-colors flex items-center text-sm">
                        게임하러 가기 <i className="fas fa-arrow-right ml-2"></i>
                    </button>
                </div>

                {/* Row 2: 내 정보 (승률 + 전적) */}
                <div className="bg-white rounded-lg p-6 flex items-center justify-between shadow-sm border hover:shadow-md transition-shadow">
                    <div className="flex items-center divide-x divide-gray-200">
                        {/* 내 승률 */}
                        <div className="flex items-center pr-8">
                            <i className="fas fa-chart-line text-3xl text-purple-500 mr-5 w-8 text-center"></i>
                            <div>
                                <h3 className="font-bold text-gray-700 text-lg">내 승률</h3>
                                <p className="text-3xl font-bold text-purple-600">{userWinRate}%</p>
                            </div>
                        </div>
                        {/* 내 전적 */}
                        <div className="flex items-center pl-8">
                            <i className="fas fa-gamepad text-3xl text-gray-500 mr-5 w-8 text-center"></i>
                            <div>
                                <h3 className="font-bold text-gray-700 text-lg">내 전적</h3>
                                <p className="text-2xl font-mono">
                                    <span className="text-green-600 font-semibold">{userWin}</span> W / <span className="text-red-600 font-semibold">{userLoss}</span> L
                                </p>
                            </div>
                        </div>
                    </div>
                    <button 
                        onClick={() => setActiveTab('my-info')}
                        className="bg-green-50 text-green-700 font-semibold py-2 px-5 rounded-lg hover:bg-green-100 transition-colors flex items-center text-sm">
                        내 정보 확인 <i className="fas fa-arrow-right ml-2"></i>
                    </button>
                </div>

                {/* Row 3: 랭킹 1위 */}
                <div className="bg-white rounded-lg p-6 flex items-center justify-between shadow-sm border hover:shadow-md transition-shadow">
                    {topRanker ? (
                        <>
                            <div className="flex items-center flex-grow">
                                <i className="fas fa-crown text-3xl text-amber-500 mr-5 w-8 text-center"></i>
                                <div className="text-left">
                                    <p className="text-sm font-semibold text-gray-500">현재 랭킹 1위</p>
                                    <p className="text-2xl font-bold text-gray-800 truncate">{topRankerNick}</p>
                                </div>
                                <div className="flex items-center space-x-8 ml-12">
                                    <div className="text-center">
                                        <p className="text-sm font-semibold text-gray-500">티어</p>
                                        <TierBadge tierName={topRankerTier} />
                                    </div>
                                    <div className="text-center">
                                        <p className="text-sm font-semibold text-gray-500">점수</p>
                                        <p className="text-2xl font-mono font-bold text-gray-700">{topRankerPoints.toLocaleString()}</p>
                                    </div>
                                </div>
                            </div>
                            <button 
                                onClick={() => setActiveTab('ranking')}
                                className="bg-amber-50 text-amber-700 font-semibold py-2 px-5 rounded-lg hover:bg-amber-100 transition-colors flex items-center text-sm">
                                랭킹 보러가기 <i className="fas fa-arrow-right ml-2"></i>
                            </button>
                        </>
                    ) : (
                        <p className="text-gray-500 w-full text-center py-8">아직 랭킹 정보가 없습니다.</p>
                    )}
                </div>
            </section>
        </div>
    );
}

export default HomeTab;