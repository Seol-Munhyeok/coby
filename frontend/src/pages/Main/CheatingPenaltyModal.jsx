// src/pages/MainPage/CheatingPenaltyModal.jsx

import React from 'react';

/**
 * 부정행위로 인해 강제 퇴장되었을 때 메인 페이지에 표시되는 모달 컴포넌트입니다.
 * @param {object} props - 컴포넌트 프로퍼티
 * @param {boolean} props.isOpen - 모달의 표시 여부
 * @param {Function} props.onClose - 닫기 버튼 클릭 시 호출될 함수
 */
export default function CheatingPenaltyModal({ isOpen, onClose }) {
  // isOpen 상태가 false이면 아무것도 렌더링하지 않음
  if (!isOpen) return null;

  return (
    // 모달을 화면 최상단(z-index)에 오버레이로 표시하기 위한 컨테이너
    <div className="fixed inset-0 flex items-center justify-center z-[100]">
      {/* 배경을 어둡게 처리하는 백드롭 */}
      <div className="absolute inset-0 bg-black bg-opacity-70" />

      {/* 모달 콘텐츠 */}
      <div className="bg-white rounded-lg p-8 shadow-xl z-10 w-full max-w-sm border border-gray-200 text-center">
        {/* 에러/경고 아이콘 */}
        <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>

        <h2 className="text-2xl font-bold text-gray-800 mb-2">강제 퇴장 알림</h2>
        <p className="text-gray-600 mb-6">
          부정행위가 감지되어 대결에서<br/>
          퇴장 조치되었습니다.
        </p>
        <div className="flex justify-center">
          <button
            onClick={onClose}
            className="w-full px-6 py-2 rounded-lg font-semibold bg-gray-600 hover:bg-gray-700 text-white transition-colors focus:outline-none focus:ring-2 focus:ring-gray-400"
          >
            확인
          </button>
        </div>
      </div>
    </div>
  );
}