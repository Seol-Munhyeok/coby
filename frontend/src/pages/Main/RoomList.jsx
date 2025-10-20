import React from 'react';

function RoomList({ rooms, enterRoomBtn, searchTerm }) {

    // 검색어에 따라 방 목록 필터링
    const filteredRooms = rooms.filter(room =>
        room.roomName.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredRooms.length > 0 ? (
                filteredRooms.map((room) => {
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
                    return (
                        <div key={room.id} className="main-room-card bg-white rounded-xl overflow-hidden border border-gray-200 transition-shadow hover:shadow-lg">
                            <div className="px-4 py-3 flex justify-between items-center border-b bg-gray-50">
                                <h3 className="font-bold text-gray-800 truncate">{room.roomName}</h3>
                                <span className={`text-xs px-2 py-1 rounded-full font-semibold ${statusColorClass}`}>
                                    {room.status === 'WAITING' ? '대기중' : room.status === 'IN_PROGRESS' ? '진행중' : '결과 확인'}
                                </span>
                            </div>
                            <div className="p-4">
                                <div className="grid grid-cols-2 gap-y-2 text-sm mb-4">
                                    <div className="text-gray-500">난이도</div>
                                    <div className="text-gray-800 font-medium">{room.difficulty}</div>
                                    <div className="text-gray-500">시간 제한</div>
                                    <div className="text-gray-800 font-medium">{room.timeLimit}</div>
                                    <div className="text-gray-500">인원</div>
                                    <div className="text-gray-800 font-medium">{room.currentPart}/{room.maxParticipants}</div>
                                </div>
                                <div className="flex justify-between items-center text-sm mb-3">
                                    <span className="text-gray-500">방장: <span className="text-gray-800 font-medium">{room.owner}</span></span>
                                    {room.isPrivate && (
                                        <span className="text-yellow-600 flex items-center">
                                            <i className="fas fa-lock mr-1"></i>비공개
                                        </span>
                                    )}
                                </div>
                                <button className={`w-full py-2 rounded-lg transition ${isDisabled
                                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
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
                })
            ) : (
                <div className="col-span-2 text-center py-16 text-gray-500">
                    <p className="text-lg">텅...</p>
                    <p className="mt-2 font-semibold">현재 참여 가능한 방이 없습니다.</p>
                    <p className="text-sm">새로운 방을 만들어보세요!</p>
                </div>
            )}
        </div>
    );
}

export default RoomList;
