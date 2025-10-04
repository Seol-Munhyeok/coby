import React from 'react';

import {
    BronzeTierBadge,
    SilverTierBadge,
    GoldTierBadge,
    PlatinumTierBadge,
    DiamondTierBadge,
    MasterTierBadge
} from './TierInfo'; 


// Unranked 뱃지는 TierInfo.jsx에 없으므로, 간단하게 정의해줍니다.
const UnrankedBadge = () => (<div className="inline-block bg-gray-100 text-gray-500 font-bold px-3 py-1 rounded-full text-sm">Unranked</div>);


// 헬퍼 함수: 점수에 따라 티어 이름 반환
const getTierFromScore = (score) => {
    if (score <= 1000) return '브론즈';
    if (score <= 1500) return '실버';
    if (score <= 2000) return '골드';
    if (score <= 2500) return '플래티넘';
    if (score <= 3000) return '다이아몬드';
    return '마스터';
};

// 헬퍼 함수: 티어에 맞는 뱃지 컴포넌트 반환
const renderTierBadge = (tier) => {
  switch (tier) {
    case '브론즈': return <BronzeTierBadge />;
    case '실버': return <SilverTierBadge />;
    case '골드': return <GoldTierBadge />;
    case '플래티넘': return <PlatinumTierBadge />;
    case '다이아몬드': return <DiamondTierBadge />;
    case '마스터': return <MasterTierBadge />;
    default: return <UnrankedBadge />;
  }
};


function RankingList({ showModal, onClose, rankings }) {
    if (!showModal) {
        return null;
    }

    const processedRankings = [];
    if (rankings && rankings.length > 0) {
        let currentRank = 0;
        let lastPoint = -1; 

        rankings.forEach((player, index) => {
            if (player.tierPoint !== lastPoint) {
                currentRank = index + 1;
            }
            
            processedRankings.push({
                ...player,
                rank: currentRank,
            });
            
            lastPoint = player.tierPoint;
        });
    }

    const getTopRankerStyle = (rank) => {
        switch (rank) {
            case 1:
                return 'bg-gradient-to-r from-yellow-100 to-yellow-200 hover:from-yellow-200 hover:to-yellow-300';
            case 2:
                return 'bg-gradient-to-r from-gray-100 to-gray-200 hover:from-gray-200 hover:to-gray-300';
            case 3:
                return 'bg-gradient-to-r from-orange-100 to-amber-200 hover:from-orange-200 hover:to-amber-300';
            default:
                return 'hover:bg-sky-100';
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50 p-4">
            <div 
                className="bg-gray-50 rounded-lg border-4 border-sky-300 shadow-2xl w-full max-w-3xl flex flex-col" 
                style={{maxHeight: '90vh'}}
            >
                <header className="p-5 bg-white border-b border-gray-200 flex justify-between items-center rounded-t-lg">
                    <h2 className="text-3xl font-extrabold text-gray-800">
                        전체 랭킹
                    </h2>
                    <button 
                        onClick={onClose} 
                        className="text-gray-500 hover:text-gray-800 transition-colors"
                        aria-label="Close modal"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                        </svg>
                    </button>
                </header>

                <main className="px-1 sm:px-2 overflow-y-auto">
                    <div className="w-full">
                        <table className="w-full text-left">
                            <thead className="sticky top-0 bg-gray-50 z-10">
                                <tr>
                                    <th className="p-4 text-sm font-bold text-sky-800 text-center">순위</th>
                                    <th className="p-4 text-sm font-bold text-sky-800">플레이어</th>
                                    <th className="p-4 text-sm font-bold text-sky-800">티어</th>
                                    <th className="p-4 text-sm font-bold text-sky-800 text-center">레이팅</th>
                                    <th className="p-4 text-sm font-bold text-sky-800 text-center">승/패</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-sky-200">
                                {processedRankings && processedRankings.length > 0 ? (
                                    processedRankings.map((player) => {
                                        const tierName = getTierFromScore(player.tierPoint ?? 0);

                                        return (
                                            <tr 
                                                key={player.nickName || player.rank} 
                                                className={`transition-all duration-200 ${getTopRankerStyle(player.rank)}`}
                                            >
                                                <td className="p-4 text-center font-bold text-lg text-gray-700">
                                                    {player.rank === 1 && '🥇'}
                                                    {player.rank === 2 && '🥈'}
                                                    {player.rank === 3 && '🥉'}
                                                    {player.rank > 3 ? player.rank : ''}
                                                </td>
                                                <td className="p-4 font-semibold text-gray-900">{player.nickName ?? '이름없음'}</td>
                                                
                                                {/* 실제 뱃지 컴포넌트가 렌더링되는 부분 */}
                                                <td className="p-4">
                                                    {renderTierBadge(tierName)}
                                                </td>
                                                
                                                <td className="p-4 text-center font-mono text-blue-600 font-bold">{player.tierPoint ?? 0}</td>
                                                <td className="p-4 text-center font-mono">
                                                    <span className="font-bold text-green-600">{player.wins ?? 0}</span>
                                                    <span className="mx-1 text-gray-400">/</span>
                                                    <span className="font-bold text-red-600">{player.losses ?? 0}</span>
                                                </td>
                                            </tr>
                                        );
                                    })
                                ) : (
                                    <tr>
                                        <td colSpan="5" className="text-center py-16 text-gray-500">
                                            <p className="text-xl">😢</p>
                                            <p className="mt-2 font-semibold">아직 랭킹 정보가 없습니다.</p>
                                            <p className="text-sm">게임에 참여하여 첫 랭커가 되어보세요!</p>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </main>
            </div>
        </div>
    );
}

export default RankingList;