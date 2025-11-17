import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom'; // useNavigate 임포트
import { useAuth } from '../../pages/AuthContext/AuthContext'; // useAuth 임포트

function RoomSettingsModal({
                           showModal,
                           onClose,
                           onSave,
                           initialSettings,
                           currentParticipantsCount,
                           roomId = null,
                           isEdit = false
}) {
  const [settings, setSettings] = useState(initialSettings);
  const navigate = useNavigate(); // useNavigate 훅 사용
  const { user } = useAuth(); // AuthContext에서 user 정보 가져오기
  const isEditMode = Boolean(isEdit && roomId);

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
      [name]: type === 'checkbox' ? checked : (
          name === 'maxParticipants' ? parseInt(value, 10) :
              value
      )
    }));
  };

  const handleSave = async () => {
    // 유효성 검사: 현재 참가자 수보다 최대 참가자 수를 적게 설정할 수 없음
    if (settings.maxParticipants < currentParticipantsCount) {
      alert(`현재 참가자(${currentParticipantsCount}명)보다 최대 참가자 수를 적게 설정할 수 없습니다.`);
      return; // 저장 중단
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

    const basePayload = {
      roomName: settings.roomName, // 방 이름 (문자열)
      difficulty: settings.difficulty, // 문제 난이도 (문자열)
      timeLimit: settings.timeLimit, // 제한 시간 (문자열)
      maxParticipants: settings.maxParticipants, // 최대 인원 (정수)
      isPrivate: settings.isPrivate, // 비밀방 여부 (불리언)
      password: settings.isPrivate ? settings.password : '', // 비밀방이 아니면 비밀번호 초기화 (문자열)
      itemMode: false// 아이템 모드 (불리언)
    };

    try {
      if (isEditMode) {
        const response = await axios.patch(
            `${process.env.REACT_APP_API_URL}/api/rooms/${roomId}`,
            basePayload,
            { withCredentials: true }
        );

        if (response.status === 200) {
          alert('방 설정이 성공적으로 저장되었습니다!');
          onSave({
            ...response.data,
            password: settings.isPrivate ? settings.password : '',
          });
        } else {
          alert('방 설정 저장에 실패했습니다. 다시 시도해주세요.');
        }
        return;
      }

      const roomData = {
        ...basePayload,
        currentPart: currentParticipantsCount,
        status: 0,
        password: settings.isPrivate ? settings.password : '',
      };

      const response = await axios.post(`${process.env.REACT_APP_API_URL}/api/rooms`, roomData, {
        withCredentials: true // 필요한 경우 쿠키 포함
      });

      if (response.status === 201) { // 성공적인 생성 또는 변경 (HTTP 201 Created)
        onSave(roomData); // 상위 컴포넌트로 저장된 설정 전달 (현재는 이 데이터가 사용되지 않음)

        // 새롭게 생성된 방의 ID를 가져와 대기실로 이동
        const newRoomId = response.data.id;
        if (newRoomId && user && user.id) {
            sessionStorage.setItem('isValidNavigation', 'true');
            navigate(`/waitingRoom/${newRoomId}?userId=${user.id}`); // 새 방의 ID와 사용자 ID로 이동
        } else {
            console.error("방 ID 또는 사용자 ID를 찾을 수 없어 대기실로 이동할 수 없습니다.");
            // 오류 발생 시 다른 적절한 처리 (예: 메인 페이지로 돌아가기)
            onClose(); // 모달 닫기
        }
      } else {
        alert('방 설정 저장에 실패했습니다. 다시 시도해주세요.');
      }
    } catch (error) {
      console.error('방 설정 저장 중 오류 발생:', error);
      alert('방 설정 저장 중 오류가 발생했습니다.');
    }
  };

  if (!showModal) {
    return null;
  }

  return (
      <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
        <div className="main-modal-content waitingRoom rounded-lg p-6 w-full max-w-md mx-auto relative border border-purple-800/50 bg-white">
          <div className="p-4 bg-purple-500 text-white flex justify-between items-center rounded-t-lg -mx-6 -mt-6 mb-6 border-b border-gray-200">
            <h2 className="text-xl font-bold">방 설정 변경</h2>
            <button onClick={onClose} className="text-white hover:text-gray-200">
              <i className="fas fa-times"></i>
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label htmlFor="roomName" className="block text-sm font-medium text-gray-700 mb-1">방 이름</label>
              <input
                  type="text"
                  id="roomName"
                  name="roomName"
                  value={settings.roomName}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="방 이름을 입력하세요"
              />
            </div>

            <div>
              <label htmlFor="difficulty" className="block text-sm font-medium text-gray-700 mb-1">난이도</label>
              <select
                  id="difficulty"
                  name="difficulty"
                  value={settings.difficulty || '무작위'}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="무작위">무작위</option>
                <option value="쉬움">쉬움</option>
                <option value="보통">보통</option>
                <option value="어려움">어려움</option>
              </select>
            </div>

            <div>
              <label htmlFor="timeLimit" className="block text-sm font-medium text-gray-700 mb-1">제한 시간</label>
              <select
                  id="timeLimit"
                  name="timeLimit"
                  value={settings.timeLimit}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="15분">15분</option>
                <option value="30분">30분</option>
                <option value="45분">45분</option>
                <option value="60분">60분</option>
              </select>
            </div>

            <div>
              <span className="block text-sm font-medium text-gray-700 mb-1">최대 인원</span>
              <div className="flex space-x-4">
                {[2, 3, 4].map(num => (
                    <label key={num} className="inline-flex items-center">
                      <input
                          type="radio"
                          name="maxParticipants"
                          value={num}
                          checked={settings.maxParticipants === num}
                          onChange={handleChange}
                          className="form-radio h-4 w-4 text-purple-600 transition duration-150 ease-in-out"
                      />
                      <span className="ml-2 text-gray-700">{num}명</span>
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
                  className="form-checkbox h-4 w-4 text-purple-600 transition duration-150 ease-in-out"
              />
              <label htmlFor="isPrivate" className="ml-2 block text-sm font-medium text-gray-700">비밀방</label>
            </div>

            {settings.isPrivate && (
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">비밀번호 설정</label>
                  <input
                      type="password"
                      id="password"
                      name="password"
                      value={settings.password}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="비밀번호를 입력하세요"
                  />
                </div>
            )}
          </div>

          <div className="mt-6 flex justify-end space-x-3">
            <button
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100"
                onClick={onClose}
            >
              취소
            </button>
            <button
                className="px-4 py-2 bg-purple-500 text-white rounded-md hover:bg-purple-600"
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