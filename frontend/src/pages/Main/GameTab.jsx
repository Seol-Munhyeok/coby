import React, { useState } from 'react';
import RoomList from './RoomList';

function GameTab({ enterRoomBtn, showRoomSettingsModal, rooms, fetchRooms }) {
    const [searchTerm, setSearchTerm] = useState('');

    const handleQuickJoin = () => {
        // 참여 가능한 방을 찾아 바로 입장하는 로직
        const availableRoom = rooms.find(room => room.status === 'WAITING' && room.currentPart < room.maxParticipants);
        if (availableRoom) {
            enterRoomBtn(availableRoom.id);
        } else {
            alert('참여 가능한 방이 없습니다. 새로운 방을 만들어보세요!');
        }
    };

    return (
        <div>
            {/* Action Buttons and Search Bar */}
            <div className="flex justify-between items-center mb-6">
                <div className="flex space-x-2">
                    <button 
                        onClick={() => showRoomSettingsModal(true)}
                        className="bg-blue-700 hover:bg-blue-800 text-white font-bold py-2 px-4 rounded-lg flex items-center transition-colors"
                    >
                        <i className="fas fa-plus mr-2"></i> 방 생성
                    </button>
                    <button 
                        onClick={handleQuickJoin}
                        className="bg-white hover:bg-gray-100 text-gray-800 font-semibold py-2 px-4 border border-gray-300 rounded-lg flex items-center transition-colors shadow-sm"
                    >
                        <i className="fas fa-bolt mr-2"></i> 빠른 게임 시작
                    </button>
                </div>
                <div className="flex items-center">
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="방 이름으로 검색..."
                            className="border rounded-md pl-3 pr-10 py-2 text-sm w-64 focus:ring-blue-500 focus:border-blue-500"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                         <i className="fas fa-search absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
                    </div>
                     <button title="새로고침" className="p-2 text-gray-500 hover:text-gray-800 ml-2" onClick={fetchRooms}>
                        <i className="fas fa-sync-alt"></i>
                    </button>
                </div>
            </div>

            {/* Available Rooms List */}
            <div className="room-list-container">
                 <RoomList rooms={rooms} enterRoomBtn={enterRoomBtn} searchTerm={searchTerm} />
            </div>
        </div>
    );
}

export default GameTab;

