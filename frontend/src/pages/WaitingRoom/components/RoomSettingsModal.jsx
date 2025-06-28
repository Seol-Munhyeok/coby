import React, { useState, useEffect } from 'react';

function RoomSettingsModal({ showModal, onClose, onSave, initialSettings, currentParticipantsCount }) {
  const [settings, setSettings] = useState(initialSettings);

  // 모달이 열릴 때마다 초기 설정을 다시 로드
  useEffect(() => {
    if (showModal) {
      setSettings(initialSettings);
    }
  }, [showModal, initialSettings]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSettings(prevSettings => ({
      ...prevSettings,
      [name]: type === 'checkbox' ? checked : (name === 'maxParticipants' ? parseInt(value, 10) : value)
    }));
  };

  const handleSave = () => {
    // New validation: maxParticipants vs currentParticipantsCount
    if (settings.maxParticipants < currentParticipantsCount) {
      alert(`현재 참가자(${currentParticipantsCount}명)보다 최대 참가자 수를 적게 설정할 수 없습니다.`);
      return; // Prevent saving
    }

    // 1. 방 이름 유효성 검사
    if (settings.roomName.trim() === '') {
      alert('방 이름을 입력해주세요.');
      return; // 저장 중단
    }

    // 2. 비밀방일 때 비밀번호 유효성 검사
    if (settings.isPrivate && settings.password.trim() === '') {
      alert('비밀방의 비밀번호를 입력해주세요.');
      return; // 저장 중단
    }

    // 비밀방이 아니면 비밀번호 초기화
    if (!settings.isPrivate) {
      onSave({ ...settings, password: "" });
    } else {
      onSave(settings);
    }
  };

  if (!showModal) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div className="waitingRoom-glass-effect rounded-lg p-6 w-full max-w-md mx-auto relative border border-blue-900/30">
        <h2 className="text-2xl font-bold text-white mb-6 text-center">방 설정 변경</h2>

        <div className="space-y-4">
          <div>
            <label htmlFor="roomName" className="block text-blue-300 text-sm font-medium mb-1">방 이름</label>
            <input
              type="text"
              id="roomName"
              name="roomName"
              value={settings.roomName}
              onChange={handleChange}
              className="w-full px-3 py-2 bg-blue-900/30 border border-blue-800 rounded-md text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div>
            <label htmlFor="problemType" className="block text-blue-300 text-sm font-medium mb-1">문제 유형</label>
            <select
              id="problemType"
              name="problemType"
              value={settings.problemType}
              onChange={handleChange}
              className="w-full px-3 py-2 bg-blue-900/30 border border-blue-800 rounded-md text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="알고리즘">알고리즘</option>
              <option value="자료구조">자료구조</option>
              <option value="SQL">SQL</option>
              <option value="네트워크">네트워크</option>
            </select>
          </div>

          <div>
            <label htmlFor="difficulty" className="block text-blue-300 text-sm font-medium mb-1">난이도</label>
            <select
              id="difficulty"
              name="difficulty"
              value={settings.difficulty}
              onChange={handleChange}
              className="w-full px-3 py-2 bg-blue-900/30 border border-blue-800 rounded-md text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="쉬움">쉬움</option>
              <option value="보통">보통</option>
              <option value="어려움">어려움</option>
            </select>
          </div>

          <div>
            <label htmlFor="timeLimit" className="block text-blue-300 text-sm font-medium mb-1">제한 시간</label>
            <select
              id="timeLimit"
              name="timeLimit"
              value={settings.timeLimit}
              onChange={handleChange}
              className="w-full px-3 py-2 bg-blue-900/30 border border-blue-800 rounded-md text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="15분">15분</option>
              <option value="30분">30분</option>
              <option value="45분">45분</option>
              <option value="60분">60분</option>
            </select>
          </div>

          <div>
            <label className="block text-blue-300 text-sm font-medium mb-1">최대 참가자</label>
            <div className="flex space-x-4">
              {[2, 3, 4].map(num => (
                <label key={num} className="inline-flex items-center text-white">
                  <input
                    type="radio"
                    name="maxParticipants"
                    value={num}
                    checked={settings.maxParticipants === num}
                    onChange={handleChange}
                    className="form-radio h-4 w-4 text-blue-600 transition duration-150 ease-in-out"
                  />
                  <span className="ml-2">{num}명</span>
                </label>
              ))}
            </div>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="isPrivate"
              name="isPrivate"
              checked={settings.isPrivate}
              onChange={handleChange}
              className="form-checkbox h-4 w-4 text-blue-600 transition duration-150 ease-in-out"
            />
            <label htmlFor="isPrivate" className="ml-2 block text-blue-300 text-sm font-medium">비밀방</label>
          </div>

          {settings.isPrivate && (
            <div>
              <label htmlFor="password" className="block text-blue-300 text-sm font-medium mb-1">비밀번호 설정</label>
              <input
                type="password"
                id="password"
                name="password"
                value={settings.password}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-blue-900/30 border border-blue-800 rounded-md text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          )}
        </div>

        <div className="mt-6 flex justify-end space-x-3">
          <button
            className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-md transition"
            onClick={onClose}
          >
            취소
          </button>
          <button
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition"
            onClick={handleSave}
          >
            저장
          </button>
        </div>
      </div>
    </div>
  );
}

export default RoomSettingsModal;