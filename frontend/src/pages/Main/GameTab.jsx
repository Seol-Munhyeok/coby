import React from 'react';
import RoomList from './RoomList';

/**
 * '게임' 탭에 표시될 콘텐츠 컴포넌트
 */
function GameTab({ enterRoomBtn, showRoomSettingsModal, rooms, fetchRooms }) {
    return (
        <div>
            {/* Game Participation Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="bg-white rounded-xl shadow-md overflow-hidden">
                    <div className="p-4 bg-blue-500 text-white">
                        <h2 className="text-xl font-bold">빠른 게임 참가</h2>
                    </div>
                    <div className="p-6">
                        <p className="text-gray-600 mb-6">실력이 비슷한 상대와 바로 대결을 시작합니다.</p>
                        <button className="btn-action w-full py-4 px-6 bg-blue-500 text-white font-medium rounded-lg hover:bg-blue-600 transition-colors flex items-center justify-center" onClick={enterRoomBtn}>
                            <i className="fas fa-bolt mr-2"></i> 빠른 게임 시작
                        </button>
                    </div>
                </div>
                <div className="bg-white rounded-xl shadow-md overflow-hidden">
                    <div className="p-4 bg-purple-500 text-white">
                        <h2 className="text-xl font-bold">방 생성</h2>
                    </div>
                    <div className="p-6">
                        <p className="text-gray-600 mb-6">나만의 게임 방을 만들고 친구를 초대하세요.</p>
                        <button className="btn-action w-full py-4 px-6 bg-purple-500 text-white font-medium rounded-lg hover:bg-purple-600 transition-colors flex items-center justify-center" onClick={() => showRoomSettingsModal(true)}>
                            <i className="fas fa-plus-circle mr-2"></i> 새 방 만들기
                        </button>
                    </div>
                </div>
            </div>

            {/* Available Rooms List - 2열 및 스크롤 적용 */}
            <div className="room-list-container">
                <RoomList rooms={rooms} enterRoomBtn={enterRoomBtn} fetchRooms={fetchRooms} />
            </div>
        </div>
    );
}

export default GameTab;

