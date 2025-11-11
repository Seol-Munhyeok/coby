/**
 * 플레이어 정보 모달을 렌더링하는 컴포넌트입니다.
 */
import React from 'react';
import {PythonLogo, JavaLogo, CppLogo} from './LanguageCards';

// KST 시간으로 포맷하는 헬퍼 함수
function formatKST(utcDateString) {
    if (!utcDateString) return "시간 정보 없음";

    try {
        let parsableDateString = utcDateString;

        if (typeof utcDateString === 'string') {

            parsableDateString = utcDateString.replace(' ', 'T');

            if (!parsableDateString.endsWith('Z') && !parsableDateString.includes('+')) {
                parsableDateString += 'Z';
            }
        }

        const date = new Date(parsableDateString);

        if (isNaN(date.getTime())) {
            throw new Error("Invalid Date from input");
        }

        const formatter = new Intl.DateTimeFormat('ko-KR', {
            timeZone: 'Asia/Seoul',
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
        });
        return formatter.format(date).replace(/\. /g, '.').replace(/\.$/, '');
    } catch (error) {
        console.error("Error formatting date:", error, `Input: ${utcDateString}`);
        return "날짜 오류";
    }
}

const renderLanguageLogo = (preferredLanguage) => {
    const lang = preferredLanguage?.toLowerCase();
    switch (lang) {
        case 'python':
            return <PythonLogo/>;
        case 'java':
            return <JavaLogo/>;
        case 'cpp':
            return <CppLogo/>;
        default:
            return null;
    }
};

function PlayerInfoModal({showModal, onClose, playerData, selectedPlayerName}) {
    const totalGame = playerData?.totalGame ?? 0;
    const winGame = playerData?.winGame ?? 0;
    const loseGame = totalGame - winGame;
    const winRate = totalGame > 0 ? ((winGame / totalGame) * 100).toFixed(2) : "0.00";

    const renderRecentGames = (games) => {
        if (!games || games.length === 0) {
            return <p className="text-gray-400 text-center py-4">최근 기록이 없습니다.</p>;
        }

        return games.slice(-5).reverse().map((game, index) => {
            const resultText = game.winner ? '승리' : '패배';
            const resultColor = game.winner ? 'border-green-500 text-green-300' : 'border-red-500 text-red-300';
            const bgColor = 'bg-gray-700 bg-opacity-40';

            return (
                <div key={index}
                     className={`flex justify-between items-center ${bgColor} rounded-lg p-3 border-l-4 ${resultColor} transition-all duration-200 hover:bg-opacity-60`}>
                    <div>
                        <p className="font-semibold text-white text-base">{game.roomName || '알 수 없는 방'}</p>
                        <p className="text-xs text-gray-400 mt-1">{formatKST(game.createdAt)}</p>
                    </div>
                    <span className={`font-bold text-sm ${resultColor}`}>{resultText}</span>
                </div>
            );
        });
    };

    if (!showModal || !playerData) {
        return null;
    }

    const languageLogoComponent = renderLanguageLogo(playerData.preferredLanguage);

    return (
        <>
            <style>
                {`
          .custom-scrollbar::-webkit-scrollbar {
            width: 8px;
          }
          .custom-scrollbar::-webkit-scrollbar-track {
            background: #1f2937;
            border-radius: 4px;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb {
            background: #4b5563; 
            border-radius: 4px;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb:hover {
            background: #6b7280; 
          }
          .custom-scrollbar {
            scrollbar-width: thin;
            scrollbar-color: #4b5563 #1f2937;
          }
        `}
            </style>

            <div id="playerInfoModal"
                 className={`fixed inset-0 bg-black/80 flex items-center justify-center z-50 ${showModal ? '' : 'hidden'}`}>
                <div className="bg-gray-800 rounded-xl w-[750px] h-[580px] p-6 shadow-2xl flex flex-col">

                    <div className="flex justify-between items-center mb-5 flex-shrink-0">
                        <h2 className="text-2xl font-bold text-white">플레이어 정보</h2>
                        <button id="closePlayerModal" className="text-gray-400 hover:text-white transition-colors"
                                onClick={onClose}>
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24"
                                 stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                      d="M6 18L18 6M6 6l12 12"/>
                            </svg>
                        </button>
                    </div>

                    <div className="flex items-start justify-between mb-5 flex-shrink-0">
                        <div className="flex flex-col items-start mr-4">
                            <h3 id="playerName" className="text-2xl font-bold text-white mb-2">{selectedPlayerName}</h3>
                            <div className="flex items-center space-x-2 mb-2">
                                <div id="playerTier"
                                     className="bg-blue-900 rounded-full px-3 py-1 flex items-center justify-center min-w-[50px]">
                                    <span
                                        className="text-xs font-bold text-blue-200">{playerData.tierName || '??'}</span>
                                </div>
                            </div>
                            {languageLogoComponent && (
                                <div className="flex items-center mt-2">
                                    <div className="h-6 w-6 mr-2 flex items-center justify-center">
                                        {languageLogoComponent}
                                    </div>
                                    <span
                                        className="text-gray-300 text-sm capitalize">{playerData.preferredLanguage}</span>
                                </div>
                            )}
                            {!languageLogoComponent && playerData.preferredLanguage && (
                                <span
                                    className="text-gray-300 text-sm mt-2">선호 언어: {playerData.preferredLanguage}</span>
                            )}
                        </div>

                        <div className="bg-gray-700 bg-opacity-50 rounded-lg p-5 flex-1 ml-4 border border-gray-600">
                            <h4 className="text-lg font-semibold text-gray-200 mb-3">전적</h4>
                            <div className="grid grid-cols-3 gap-3 text-center">
                                <div className="bg-gray-600 bg-opacity-40 rounded-lg p-3 border border-gray-500">
                                    <p className="text-sm text-gray-300 mb-1">승률</p>
                                    <p id="playerWinRate" className="text-2xl font-bold text-white">{winRate}%</p>
                                </div>
                                <div className="bg-gray-600 bg-opacity-40 rounded-lg p-3 border border-gray-500">
                                    <p className="text-sm text-gray-300 mb-1">승리</p>
                                    <p id="playerWins" className="text-2xl font-bold text-green-400 ">{winGame}</p>
                                </div>
                                <div className="bg-gray-600 bg-opacity-40 rounded-lg p-3 border border-gray-500">
                                    <p className="text-sm text-gray-300 mb-1">패배</p>
                                    <p id="playerLosses"
                                       className="text-2xl font-bold text-red-400">{loseGame < 0 ? 0 : loseGame}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex-grow overflow-y-auto custom-scrollbar pr-2 min-h-0">

                        <div className="bg-gray-700 bg-opacity-50 rounded-lg p-5 border border-gray-600">
                            <h4 className="text-lg font-semibold text-gray-200 mb-3">최근 기록 (최신 5개)</h4>
                            <div className="space-y-3">
                                {renderRecentGames(playerData.recentGames)}
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </>
    );
}

export default PlayerInfoModal;