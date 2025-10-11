import React from 'react';
import { DEFAULT_TIER_NAME, TierBadge } from './TierInfo';

/**
 * 랭킹 1, 2, 3위를 위한 특별 디자인 카드
 */
const TopRankerCard = ({ player, rank }) => {
    const rankStyles = {
        1: {
            bg: 'bg-gradient-to-br from-amber-300 to-yellow-500',
            shadow: 'shadow-yellow-400/50',
            icon: '🥇',
            textColor: 'text-yellow-900',
        },
        2: {
            bg: 'bg-gradient-to-br from-slate-300 to-gray-500',
            shadow: 'shadow-gray-400/50',
            icon: '🥈',
            textColor: 'text-gray-800',
        },
        3: {
            bg: 'bg-gradient-to-br from-orange-400 to-amber-600',
            shadow: 'shadow-orange-400/50',
            icon: '🥉',
            textColor: 'text-orange-900',
        },
    };

    const style = rankStyles[rank];

    return (
        <div className={`p-6 rounded-2xl ${style.bg} shadow-xl ${style.shadow} flex flex-col items-center text-center transform hover:-translate-y-2 transition-transform duration-300`}>
            <div className="text-5xl mb-2">{style.icon}</div>
            <div className={`text-2xl font-bold ${style.textColor}`}>{player.nickName ?? '이름없음'}</div>
            <div className={`text-sm font-semibold ${style.textColor} opacity-80 mb-4`}>
                {player.tierPoint ?? 0} 점
            </div>
            <TierBadge tierName={player.tier?.name ?? DEFAULT_TIER_NAME} />
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
            {/* 1, 2, 3등 */}
            <div>
                <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">명예의 전당</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {top3.map((player, index) => (
                        <TopRankerCard key={player.nickName ?? index} player={player} rank={index + 1} />
                    ))}
                </div>
            </div>

            {/* 4~10등 및 11등 이하 */}
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
                <div className="p-4 bg-gray-50 border-b">
                     <h2 className="text-xl font-bold text-gray-800">전체 순위</h2>
                </div>
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
