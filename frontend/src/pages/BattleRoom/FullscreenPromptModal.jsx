// FullscreenPromptModal.jsx
import React from 'react';

const FullscreenPromptModal = ({ isOpen, onClose, onEnterFullscreen }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-slate-800 rounded-lg shadow-xl overflow-hidden w-96 max-w-lg p-6 text-center">
        <h3 className="text-xl font-bold text-white mb-4">전체 화면으로 만들어주세요</h3>
        <p className="text-slate-300 mb-6">
          최적의 경험을 위해 전체 화면 모드로 전환해주세요.
        </p>
        <button
          onClick={onEnterFullscreen}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-5 rounded-lg transition duration-200"
        >
          전체 화면으로 전환
        </button>
      </div>
    </div>
  );
};

export default FullscreenPromptModal;