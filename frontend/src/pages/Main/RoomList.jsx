import React from 'react';

function RoomList({ rooms, enterRoomBtn, fetchRooms }) { // fetchRooms 함수도 props로 받도록 추가
    return (
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="p-4 bg-gray-50 border-b flex justify-between items-center">
                <h2 className="text-xl font-bold text-gray-800">참여 가능한 방</h2>
                <div className="flex items-center">
                
                    <button className="p-1 text-gray-500 hover:text-gray-700" onClick={fetchRooms}> {/* 새로고침 버튼에 fetchRooms 연결 */}
                        <i className="fas fa-sync-alt"></i>
                    </button>
                </div>
            </div>

            <div className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {rooms.map((room) => (
                        <div key={room.id} className="main-room-card main-glass-effect backdrop-filter backdrop-blur-md bg-white/70 rounded-xl overflow-hidden  border border-gray-300">
                            <div className="main-gradient-bg px-4 py-3 flex justify-between items-center">
                                <h3 className="font-bold text-black">{room.roomName}</h3>
                                <span className={`text-xs px-2 py-1 rounded-full ${room.status === 0 ? 'bg-green-500/20 text-green-700' : 'bg-yellow-500/20 text-yellow-700'}`}>
                                    {room.status === 0 ? '대기중' : '진행중'}
                                </span>
                            </div>
                            <div className="p-4">
                                <div className="flex justify-between mb-3">
                                    <span className="text-sm text-blue-700">난이도: <span className="text-black">{room.difficulty}</span></span>
                                    <span className="text-sm text-blue-700">시간 제한: <span className="text-black">{room.timeLimit}</span></span>
                                </div>
                                <div className="flex justify-between mb-4">
                                    <span className="text-sm text-blue-700">참가자: <span className="text-black">{room.currentPart}/{room.maxParticipants}</span></span>
                                    <span className="text-sm text-blue-700">모드: <span className="text-black">{room.itemMode ? '아이템전' : '노템전'}</span></span>
                                </div>
                                {room.isPrivate && (
                                    <div className="flex items-center mb-4">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-700 mr-1" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                                        </svg>
                                        <span className="text-xs text-blue-700">비밀방</span>
                                    </div>
                                )}
                                <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg transition" onClick={enterRoomBtn}>
                                    입장하기
                                </button>
                            </div>
                        </div>
                    ))}
                    {rooms.length === 0 && (
                        <p className="text-white text-center col-span-full">아직 생성된 방이 없습니다. 새로운 방을 만들어 보세요!</p>
                    )}
                </div>
            </div>
        </div>
    );
}

export default RoomList;