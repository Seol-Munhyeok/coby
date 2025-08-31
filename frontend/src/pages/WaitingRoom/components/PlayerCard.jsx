/**
 * 개별 플레이어 카드를 렌더링하는 컴포넌트입니다.
 * showReadyStatus prop을 통해 '준비 완료'/'대기 중' UI를 제어할 수 있습니다.
 */
import React from 'react';
import '../WaitingRoom.css';
// 1. TierInfo.jsx에서 뱃지 컴포넌트들을 import 합니다.
import {
  BronzeTierBadge,
  SilverTierBadge,
  GoldTierBadge,
  PlatinumTierBadge,
  DiamondTierBadge,
  MasterTierBadge
} from '../../Main/TierInfo';

// 2. player.tier 값에 따라 적절한 뱃지를 반환하는 헬퍼 함수를 만듭니다.
const renderTierBadge = (tier) => {
  switch (tier) {
    case '브론즈':
      return <BronzeTierBadge />;
    case '실버':
      return <SilverTierBadge />;
    case '골드':
      return <GoldTierBadge />;
    case '플래티넘':
      return <PlatinumTierBadge />;
    case '다이아몬드':
      return <DiamondTierBadge />;
    case '마스터':
      return <MasterTierBadge />;
    default:
      // 혹시 모를 기본값으로 실버 티어를 설정합니다.
      return <GoldTierBadge />;
  }
};

// showReadyStatus prop을 추가하고 기본값을 true로 설정합니다.
function PlayerCard({ player, handlePlayerCardClick, showReadyStatus = true }) {
  if (player.isEmpty) {
    return (
      <div className="bg-white shadow-md rounded-xl p-4 flex flex-col items-center opacity-50 m-2">
        <div className="mb-2">
          <div className="w-16 h-16 rounded-full bg-gray-700 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-500" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
            </svg>
          </div>
        </div>
        <h3 className="font-medium text-gray-400 text-center">빈 자리</h3>
      </div>
    );
  }

  return (
    <div
      className={`waitingRoom-player-card bg-white shadow-md rounded-xl p-4 flex flex-col items-center relative m-2
                  ${player.isHost ? 'host' : ''}
                  `}
      data-player={player.name}
      onClick={(e) => handlePlayerCardClick(e, player)}
      onContextMenu={(e) => handlePlayerCardClick(e, player)}
    >
      <div className="waitingRoom-character mb-2">
        <div className={`w-16 h-16 rounded-full flex items-center justify-center text-xl font-medium ${player.avatarColor}`}>
          {player.avatarInitials}
        </div>
      </div>
      <h3 className="font-medium  text-center">{player.name}</h3>
      {/* 3. 기존 티어 UI를 새로운 뱃지 렌더링 코드로 교체합니다. */}
      <div className="flex items-center mt-1 h-6"> {/* h-6으로 높이를 고정하여 UI 떨림 방지 */}
        {renderTierBadge(player.tier)}
      </div>
      {/* showReadyStatus가 true일 때만 아래 div 블록이 렌더링됩니다. */}
      {showReadyStatus && (
        <div className={`${player.isReady ? 'waitingRoom-player-ready' : 'waitingRoom-player-not-ready'}`}>
            {player.isReady ? '준비 완료' : '대기 중'}
        </div>
      )}
    </div>
  );
}

export default PlayerCard;