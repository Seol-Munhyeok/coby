/**
 * 개별 플레이어 카드를 렌더링하는 컴포넌트입니다. host 클래스가 동적으로 적용됩니다.
 */
import React from 'react';
import '../ResultRoom.css';

function PlayerCard({ player, handlePlayerCardClick }) {
  if (player.isEmpty) {
    return (
      <div className="waitingRoom-glass-effect rounded-xl p-4 flex flex-col items-center opacity-50 m-2">
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

  // Existing PlayerCard rendering logic for active players
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
        <div className={`w-16 h-16 rounded-full flex items-center justify-center text-xl font-medium ${player.avatarColor}`}>
          {player.avatarInitials}
        </div>
      </div>
      <h3 className="font-medium  text-center">{player.name}</h3>
      <div className="flex items-center mt-1">
        <div className="waitingRoom-tier-badge w-6 h-6 rounded-full bg-blue-900 flex items-center justify-center mr-1">
          <span className="text-[0.6rem] font-bold text-blue-200">{player.tier}</span>
        </div>
        <span className="text-xs waitingRoom-text">{player.level}</span>
      </div>
      <div className={`${player.isReady ? 'waitingRoom-player-ready' : 'waitingRoom-player-not-ready'}`}>
          {player.isReady ? '준비 완료' : '대기 중'}
      </div>
    </div>
  );
}

export default PlayerCard;