import React, { useState, useEffect } from 'react';
import axios from 'axios'; // axios import

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

  const handleSave = async () => { // 비동기 함수로 변경
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

    const roomData = {
      roomName: settings.roomName, //방이름 str
      difficulty: settings.difficulty, //문제 난이도 str
      timeLimit: settings.timeLimit, //제한 시간 str
      maxParticipants: settings.maxParticipants, //최대 인원 int
      currentPart : currentParticipantsCount, //int
      status : 0, //int
      isPrivate: settings.isPrivate, //bool
      password: settings.isPrivate ? settings.password : '', // 비밀방이 아니면 비밀번호 초기화 //str
      itemMode: settings.itemMode // 새로운 itemMode 추가 //bool
    };

    try {
      // 서버에 방 생성 요청
      const response = await axios.post(`${process.env.REACT_APP_API_URL}/api/rooms`, roomData, {
        withCredentials: true // 필요한 경우 쿠키 포함
      });

      if (response.status === 201) { // 성공적인 생성 (HTTP 201 Created)
        alert('방이 성공적으로 생성되었습니다!');
        onSave(roomData); // 상위 컴포넌트로 저장된 설정 전달
      } else {
        alert('방 생성에 실패했습니다. 다시 시도해주세요.');
      }
    } catch (error) {
      console.error('방 생성 중 오류 발생:', error);
      alert('방 생성 중 오류가 발생했습니다.');
    }
  };

  if (!showModal) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div className="waitingRoom-glass-effect rounded-lg p-6 w-full max-w-md mx-auto relative border border-blue-900/30">
        <h2 className="text-2xl font-bold  mb-6 text-center">방 설정 변경</h2>

        <div className="space-y-4">
          <div>
            <label htmlFor="roomName" className="block waitingRoom-text text-sm font-medium mb-1">방 이름</label>
            <input
              type="text"
              id="roomName"
              name="roomName"
              value={settings.roomName}
              onChange={handleChange}
              className="w-full px-3 py-2 bg-blue-900/30 border border-blue-800 rounded-md  focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div>
            <label htmlFor="difficulty" className="block waitingRoom-text text-sm font-medium mb-1">난이도</label>
            <select
              id="difficulty"
              name="difficulty"
              value={settings.difficulty}
              onChange={handleChange}
              className="w-full px-3 py-2 bg-blue-900/30 border border-blue-800 rounded-md  focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="쉬움">쉬움</option>
              <option value="보통">보통</option>
              <option value="어려움">어려움</option>
            </select>
          </div>

          <div>
            <label htmlFor="timeLimit" className="block waitingRoom-text text-sm font-medium mb-1">제한 시간</label>
            <select
              id="timeLimit"
              name="timeLimit"
              value={settings.timeLimit}
              onChange={handleChange}
              className="w-full px-3 py-2 bg-blue-900/30 border border-blue-800 rounded-md  focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="15분">15분</option>
              <option value="30분">30분</option>
              <option value="45분">45분</option>
              <option value="60분">60분</option>
            </select>
          </div>

          {/* 노템전/아이템전 선택 버튼 추가 */}
          <div>
            <label className="block waitingRoom-text text-sm font-medium mb-1">모드 선택</label>
            <div className="flex space-x-4">
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  name="itemMode"
                  value="노템전"
                  checked={settings.itemMode === false}
                  onChange={handleChange}
                  className="form-radio h-4 w-4 text-blue-600 transition duration-150 ease-in-out"
                />
                <span className="ml-2">노템전</span>
              </label>
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  name="itemMode"
                  value="아이템전"
                  checked={settings.itemMode === true}
                  onChange={handleChange}
                  className="form-radio h-4 w-4 text-blue-600 transition duration-150 ease-in-out"
                />
                <span className="ml-2">아이템전</span>
              </label>
            </div>
          </div>

          <div>
            <label className="block waitingRoom-text text-sm font-medium mb-1">최대 참가자</label>
            <div className="flex space-x-4">
              {[2, 3, 4].map(num => (
                <label key={num} className="inline-flex items-center ">
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
            <label htmlFor="isPrivate" className="ml-2 block waitingRoom-text text-sm font-medium">비밀방</label>
          </div>

          {settings.isPrivate && (
            <div>
              <label htmlFor="password" className="block waitingRoom-text text-sm font-medium mb-1">비밀번호 설정</label>
              <input
                type="password"
                id="password"
                name="password"
                value={settings.password}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-blue-900/30 border border-blue-800 rounded-md  focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          )}
        </div>

        <div className="mt-6 flex justify-end space-x-3">
          <button
            className="px-4 py-2 bg-gray-600 hover:bg-gray-700  rounded-md transition"
            onClick={onClose}
          >
            취소
          </button>
          <button
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700  rounded-md transition"
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