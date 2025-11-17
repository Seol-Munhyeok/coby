/**
 * 개별 플레이어 카드를 렌더링하는 컴포넌트입니다.
 * showReadyStatus prop을 통해 '준비 완료'/'대기 중' UI를 제어할 수 있습니다.
 * * 추가된 기능:
 * - oldScore, newScore, startAnimation props를 받아 점수 획득 애니메이션을 처리합니다.
 * - 애니메이션은 startAnimation이 true가 될 때 시작됩니다.
 * - 애니메이션 순서: 점수 획득(+N) 표시 -> 기존 점수 페이드 인 -> 점수 카운트업 -> 최종 점수 페이드 아웃
 */
import React, { useState, useEffect } from 'react';
import '../WaitingRoom.css';
import { DEFAULT_TIER_NAME, TierBadge } from '../../Main/TierInfo';

const DEFAULT_SCORE_GAIN = 200;

function PlayerCard({
    player,
    handlePlayerCardClick,
    showReadyStatus = true,
    // --- 애니메이션을 위한 props 수정 ---
    tierPoint,
    isWinner = false,
    startAnimation = false,
    scoreGain = DEFAULT_SCORE_GAIN
}) {
  // --- 애니메이션 상태 관리 ---
  const [animationStep, setAnimationStep] = useState('idle'); // 'idle', 'gain', 'countUp', 'done'
  const [displayScore, setDisplayScore] = useState(tierPoint);

  const effectiveScoreGain = typeof scoreGain === 'number' && scoreGain > 0
      ? scoreGain
      : DEFAULT_SCORE_GAIN;


  useEffect(() => {
    // startAnimation prop이 true이고, 승리자일 때만 애니메이션 시작
    if (startAnimation && !player.isEmpty && isWinner) {
      // 1. 점수 획득(+N) 애니메이션 시작
      setAnimationStep('gain');
      
      // 2. 1초 후, 기존 점수 표시 및 카운트업 시작
      setTimeout(() => {
        setAnimationStep('countUp');
        
        const oldScore = Math.max(0, tierPoint - effectiveScoreGain); //0 미만으로 떨어지지 않게
        const newScore = tierPoint;

        // 점수 카운트업 애니메이션
        let currentScore = oldScore;
        const increment = Math.ceil(effectiveScoreGain / 50); // 50프레임에 걸쳐 증가

        const counter = setInterval(() => {
          currentScore += increment;
          if (currentScore >= newScore) {
            setDisplayScore(newScore);
            clearInterval(counter);
            
            // 3. 2초 후, 최종 점수 표시가 서서히 사라짐
            setTimeout(() => {
              setAnimationStep('done');
            }, 2000);

          } else {
            setDisplayScore(currentScore);
          }
        }, 20); // 약 20ms 간격으로 업데이트
      }, 1000);
    }
  }, [startAnimation, player.isEmpty, isWinner, tierPoint, effectiveScoreGain]);


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
      <div className="flex items-center mt-1 h-6">
        <TierBadge
          tierName={player.tierName ?? player.tier ?? DEFAULT_TIER_NAME}
        />
      </div>
      {/* --- 점수 애니메이션 UI (승리자에게만 보임) --- */}
      {isWinner && (
        <div className="score-animation-container">
          
          {/* "+N" 텍스트 애니메이션 */}
          {animationStep === 'gain' && (
            <div className="score-gain">
              +{effectiveScoreGain}
            </div>
          )}
          {/* 점수 카운트업 및 페이드 아웃 */}
          {(animationStep === 'countUp' || animationStep === 'done') && (
            <div className={`score-display ${animationStep === 'countUp' ? 'visible' : ''}`}>
              {displayScore}점
            </div>
          )}
        </div>
      )}

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