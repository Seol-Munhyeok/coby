import React from 'react';
import { DEFAULT_TIER_NAME, TierBadge } from './TierInfo';

/**
 * 랭킹 1, 2, 3위를 위한 새로운 타이포그래피 디자인 카드
 */
const TopRankerCard = ({ player, rank }) => {
    // 순위에 따라 높이를 조절하는 클래스를 동적으로 추가합니다.
    const rankHeightClass = `rank-card-${rank}`;

    return (
        <div className={`top-ranker-card ${rankHeightClass}`}>
            <div className={`rank-border rank-${rank}`}></div>
            <div className="relative z-10 flex flex-col items-center justify-center h-full">
                <p className="font-bold text-3xl text-gray-800">{player.nickName ?? '이름없음'}</p>
                <p className="text-lg text-gray-500">Score {player.tierPoint ?? 0}</p>
            </div>
            <div 
                className="absolute inset-0 flex items-center justify-center text-gray-200 font-bold pointer-events-none"
                style={{ fontSize: '12rem', lineHeight: '1' }}
            >
                {rank}
            </div>
        </div>
    );
};


/**
 * '랭킹' 탭에 표시될 콘텐츠 컴포넌트
 */
function RankingTab({ rankings }) {
    // 랭킹 데이터가 없거나 비어있으면 메시지 표시
    if (!rankings || rankings.length === 0) {
        return (
            <div className="text-center py-16 text-gray-500">
                <p className="text-xl">😢</p>
                <p className="mt-2 font-semibold">아직 랭킹 정보가 없습니다.</p>
                <p className="text-sm">게임에 참여하여 첫 랭커가 되어보세요!</p>
            </div>
        );
    }

    const top3 = rankings.slice(0, 3);
    const midRanks = rankings.slice(3, 10);
    const otherRanks = rankings.slice(10);

    return (
        <div className="space-y-10">
            {/* 1, 2, 3등 (2, 1, 3 순서로 배치하고 높이를 다르게 설정) */}
            <div>
                {/* items-end를 추가하여 박스를 하단 정렬합니다. */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:items-end">
                    {/* 2nd Place */}
                    {top3[1] && <TopRankerCard player={top3[1]} rank={2} />}
                    {/* 1st Place */}
                    {top3[0] && <TopRankerCard player={top3[0]} rank={1} />}
                    {/* 3rd Place */}
                    {top3[2] && <TopRankerCard player={top3[2]} rank={3} />}
                </div>
            </div>

            {/* 4~10등 및 11등 이하 */}
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-100">
                            <tr>
                                <th className="p-4 text-sm font-bold text-gray-600 text-center">순위</th>
                                <th className="p-4 text-sm font-bold text-gray-600">플레이어</th>
                                <th className="p-4 text-sm font-bold text-gray-600">티어</th>
                                <th className="p-4 text-sm font-bold text-gray-600 text-center">점수</th>
                            </tr>
                        </thead>
                        <tbody>
                            {/* 4~10등 (강조된 디자인) */}
                            {midRanks.map((player, index) => (
                                <tr key={player.nickName ?? index} className="ranking-row-mid">
                                    <td className="p-4 text-center font-bold text-lg text-gray-700">{index + 4}</td>
                                    <td className="p-4 font-semibold text-gray-900">{player.nickName ?? '이름없음'}</td>
                                    <td className="p-4"><TierBadge tierName={player.tier?.name ?? DEFAULT_TIER_NAME} /></td>
                                    <td className="p-4 text-center font-mono text-blue-600 font-bold">{player.tierPoint ?? 0}</td>
                                </tr>
                            ))}
                            {/* 11등 이하 (일반 디자인) */}
                            {otherRanks.map((player, index) => (
                                <tr key={player.nickName ?? index} className="ranking-row-normal">
                                    <td className="p-4 text-center font-medium text-gray-600">{index + 11}</td>
                                    <td className="p-4 text-gray-800">{player.nickName ?? '이름없음'}</td>
                                    <td className="p-4"><TierBadge tierName={player.tier?.name ?? DEFAULT_TIER_NAME} /></td>
                                    <td className="p-4 text-center font-mono text-blue-500">{player.tierPoint ?? 0}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

export default RankingTab;

