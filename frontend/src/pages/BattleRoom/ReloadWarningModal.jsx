// src/components/ReloadWarningModal.jsx

import React from 'react';

/**
 * 새로고침 또는 페이지 이탈 시도 시 나타나는 경고 모달 컴포넌트입니다.
 * @param {object} props - 컴포넌트 프로퍼티
 * @param {boolean} props.isOpen - 모달의 표시 여부
 * @param {Function} props.onClose - '머무르기(취소)' 버튼 클릭 시 호출될 함수
 * @param {Function} props.onConfirm - '강제 이동' 버튼 클릭 시 호출될 함수
 */
export default function ReloadWarningModal({ isOpen, onClose, onConfirm }) {
  // isOpen 상태가 false이면 아무것도 렌더링하지 않음
  if (!isOpen) return null;

  return (
    // 모달을 화면 최상단(z-index)에 오버레이로 표시하기 위한 컨테이너
    <div className="fixed inset-0 flex items-center justify-center z-[100]">
      {/* 배경을 어둡게 처리하는 백드롭. 클릭 시 모달이 닫힙니다. */}
      <div className="absolute inset-0 bg-black bg-opacity-70" onClick={onClose} />

      {/* 모달 콘텐츠 */}
      <div className="bg-slate-800 rounded-lg p-8 shadow-xl z-10 w-full max-w-md border border-slate-700">
        <div className="flex items-start mb-4">
          {/* 경고 아이콘 (Heroicons 사용) */}
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-yellow-400 mr-4 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.21 3.03-1.742 3.03H4.42c-1.532 0-2.492-1.696-1.742-3.03l5.58-9.92zM10 13a1 1 0 110-2 1 1 0 010 2zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          <div>
            <h2 className="text-2xl font-bold text-slate-100">정말로 나가시겠습니까?</h2>
            <p className="text-slate-400 mt-1">새로고침 또는 페이지 이탈 시도 감지</p>
          </div>
        </div>
        <p className="text-slate-300 my-6 pl-12">
          페이지를 벗어나면 현재까지의 모든 진행 상황이 사라지며,
          <strong className="text-red-400"> 대결에서 패배 처리될 수 있습니다.</strong>
          <br />
          메인 페이지로 강제 이동됩니다.
        </p>
        <div className="flex justify-end space-x-4">
          <button
            onClick={onClose}
            className="px-6 py-2 rounded-lg font-semibold bg-slate-600 hover:bg-slate-500 text-white transition-colors focus:outline-none focus:ring-2 focus:ring-slate-400"
          >
            머무르기 (취소)
          </button>
          <button
            onClick={onConfirm}
            className="px-6 py-2 rounded-lg font-semibold bg-red-600 hover:bg-red-700 text-white transition-colors focus:outline-none focus:ring-2 focus:ring-red-400"
          >
            강제 이동
          </button>
        </div>
      </div>
    </div>
  );
}