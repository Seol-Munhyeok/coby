// WarningModal.jsx
import React from 'react';

const WarningModal = ({ isOpen, title, message, type, onClose }) => {
  if (!isOpen) return null;

  let headerBgClass = "bg-blue-500";
  let icon = (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-100" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );

  if (type === 'warning') {
    headerBgClass = "bg-yellow-500";
    icon = (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-yellow-100" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
    );
  } else if (type === 'error') {
    headerBgClass = "bg-red-600";
    icon = (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-100" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-slate-800 rounded-lg shadow-xl overflow-hidden w-96 max-w-lg">
        <div className={`flex items-center justify-between p-4 ${headerBgClass} text-white`}>
          <div className="flex items-center">
            {icon}
            <h3 className="ml-2 text-lg font-bold">{title}</h3>
          </div>
          <button onClick={onClose} className="text-white hover:text-gray-200">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="p-6 text-slate-200">
          <p className="text-sm text-center">{message}</p>
        </div>
        <div className="p-4 bg-slate-700 flex justify-end">
          <button
            onClick={onClose}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            확인
          </button>
        </div>
      </div>
    </div>
  );
};

export default WarningModal;