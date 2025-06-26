/**
 * 개별 플레이어 카드를 렌더링하는 컴포넌트입니다. host 클래스가 동적으로 적용됩니다.
 */
import React from 'react';

function PlayerCard({ player, handlePlayerCardClick }) {
  return (
    <div
      className={`waitingRoom-player-card waitingRoom-glass-effect rounded-xl p-4 flex flex-col items-center relative m-2
                  ${player.isHost ? 'host' : ''}
                  `}
      data-player={player.name}
      onClick={(e) => handlePlayerCardClick(e, player)}
      onContextMenu={(e) => handlePlayerCardClick(e, player)}
    >
      <div className="waitingRoom-character mb-2">
        <div className={`w-16 h-16 rounded-full flex items-center justify-center text-xl font-medium
                        ${player.name === "사용자1" ? 'bg-blue-700' :
                          player.name === "사용자2" ? 'bg-purple-700' :
                          player.name === "코드마스터" ? 'bg-green-700' :
                          'bg-yellow-700'
                        }`}>
          {player.avatarInitials}
        </div>
      </div>
      <h3 className="font-medium text-white text-center">{player.name}</h3>
      <div className="flex items-center mt-1">
        <div className="waitingRoom-tier-badge w-6 h-6 rounded-full bg-blue-900 flex items-center justify-center mr-1">
          <span className="text-[0.6rem] font-bold text-blue-200">{player.tier}</span>
        </div>
        <span className="text-xs text-blue-300">{player.level}</span>
      </div>
      <div className={`${player.isReady ? 'waitingRoom-player-ready' : 'waitingRoom-player-not-ready'}`}>
          {player.isReady ? '준비 완료' : '대기 중'}
      </div>
    </div>
  );
}

export default PlayerCard;