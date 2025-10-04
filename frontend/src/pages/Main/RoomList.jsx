import React, { useState } from 'react'; // useState import

function RoomList({ rooms, enterRoomBtn, fetchRooms }) {
    const [searchTerm, setSearchTerm] = useState(''); // 검색어 상태 추가

    // 검색어에 따라 방 목록 필터링
    const filteredRooms = rooms.filter(room =>
        room.roomName.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="p-4 bg-gray-50 border-b flex justify-between items-center">
                <h2 className="text-xl font-bold text-gray-800">참여 가능한 방</h2>
                <div className="flex items-center">
                    {/* 검색 입력 상자 추가 */}
                    <input
                        type="text"
                        placeholder="방 이름 검색..."
                        className="mr-2 text-sm border rounded-md px-2 py-1"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <button className="p-1 text-gray-500 hover:text-gray-700" onClick={fetchRooms}>
                        <i className="fas fa-sync-alt"></i>
                    </button>
                </div>
            </div>

            <div className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredRooms.map((room) => {
                        const isFull = room.currentPart >= room.maxParticipants;
                        const isInProgressOrFinished = room.status !== 'WAITING';
                        const isDisabled = isFull || isInProgressOrFinished;

                        let buttonText = '입장하기';
                        if (isFull) {
                            buttonText = '정원 초과';
                        } else if (room.status === 'IN_PROGRESS') {
                            buttonText = '게임 진행 중';
                        } else if (room.status === 'RESULT') {
                            buttonText = '게임 종료됨';
                        }
                        let statusColorClass = '';
                        switch (room.status) {
                            case 'WAITING':
                                statusColorClass = 'bg-green-100 text-green-700';
                                break;
                            case 'IN_PROGRESS':
                                statusColorClass = 'bg-red-100 text-red-700';
                                break;
                            case 'RESULT':
                                statusColorClass = 'bg-gray-200 text-gray-700';
                                break;
                            default:
                                statusColorClass = 'bg-yellow-100 text-yellow-700';
                        }
                        // 필터링된 방 목록 사용
                        return( <div key={room.id} className="main-room-card main-glass-effect backdrop-filter backdrop-blur-md bg-white/70 rounded-xl overflow-hidden border border-gray-300">
                            <div className="main-gradient-bg px-4 py-3 flex justify-between items-center">
                                <h3 className="font-bold text-black">{room.roomName}</h3>
                                <span className={`text-xs px-2 py-1 rounded-full ${statusColorClass}`}>
                                    {room.status === 'WAITING' ? '대기중' : room.status === 'IN_PROGRESS' ? '진행중' : '결과 대기'}
                                </span>
                            </div>
                            <div className="p-4">
                                <div className="flex justify-between mb-3">
                                    <span className="text-sm text-blue-700">난이도: <span className="text-black">{room.difficulty}</span></span>
                                    <span className="text-sm text-blue-700">시간 제한: <span className="text-black">{room.timeLimit}</span></span>
                                </div>
                                <div className="flex justify-between mb-3">
                                    <span className="text-sm text-blue-700">인원: <span className="text-black">{room.currentPart}/{room.maxParticipants}</span></span>
                                    <span className="text-sm text-blue-700">
                                        아이템 모드: <span className="text-black">{room.itemMode ? '적용' : '미적용'}</span>
                                    </span>
                                </div>
                                <div className="flex justify-between items-center text-sm mb-3">
                                    <span className="text-blue-700">방장: <span className="text-black">{room.owner}</span></span>
                                    {room.isPrivate && (
                                        <span className="text-yellow-600">
                                            <i className="fas fa-lock mr-1"></i>비공개
                                        </span>
                                    )}
                                </div>
                                <button className={`w-full py-2 rounded-lg transition ${isDisabled
                                    ? 'bg-gray-400 text-gray-700 cursor-not-allowed'
                                    : 'bg-blue-600 hover:bg-blue-700 text-white' 
                                }`}
                                        onClick={() => enterRoomBtn(room.id)}
                                        disabled={isDisabled}
                                >
                                    {buttonText}
                                </button>
                            </div>
                        </div>
                    );
                    })}
                </div>
            </div>
        </div>
    );
}

export default RoomList;