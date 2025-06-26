/**
 * 게임 시작 확인 모달을 렌더링하는 컴포넌트입니다.
 */
import React from 'react';
import '../WaitingRoom.css';


function StartGameConfirmModal() {
  return (
    <div id="startGameConfirmModal" className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 hidden">
      <div className="waitingRoom-glass-effect rounded-xl w-full max-w-md p-6 waitingRoom-animate-fade-in">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-white">게임 시작</h2>
          <button id="closeStartConfirmModal" className="text-blue-300 hover:text-white transition" onClick={() => document.getElementById('startGameConfirmModal').classList.add('hidden')}>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="text-center mb-6">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-yellow-500 mx-auto mb-4" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
          <h3 className="text-lg font-semibold text-white mb-2">게임을 시작하시겠습니까?</h3>
          <p className="text-blue-300">아직 준비되지 않은 참가자가 있습니다. 그래도 시작하시겠습니까?</p>
        </div>
        <div className="flex space-x-3">
          <button id="cancelStartGame" className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-2 rounded-lg transition">
            취소
          </button>
          <button id="confirmStartGame" className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg transition">
            시작하기
          </button>
        </div>
      </div>
    </div>
  );
}

export default StartGameConfirmModal;