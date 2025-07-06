/**
 * 채팅 기능을 담당하는 컴포넌트입니다.
 * 웹소켓 연동을 고려하여 메시지 목록과 전송 기능을 분리합니다.
 */
import React, { useState, useRef, useEffect } from 'react';
import '../WaitingRoom.css';

function ChatWindow({ messages, onSendMessage, currentUser, playerData }) {
  const [inputMessage, setInputMessage] = useState('');
  const chatMessagesRef = useRef(null);

  useEffect(() => {
    if (chatMessagesRef.current) {
      chatMessagesRef.current.scrollTop = chatMessagesRef.current.scrollHeight;
    }
  }, [messages]);

  const handleInputChange = (e) => {
    setInputMessage(e.target.value);
  };

  const handleSendClick = () => {
    if (inputMessage.trim() !== '') {
      onSendMessage(inputMessage);
      setInputMessage('');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSendClick();
    }
  };

  return (
    <div className="waitingRoom-glass-effect rounded-lg p-4 flex flex-col h-full">
      <h3 className="text-lg font-semibold  mb-3 flex items-center">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 waitingRoom-text" viewBox="0 0 20 20" fill="currentColor">
          <path d="M2 5a2 2 0 012-2h7a2 2 0 012 2v4a2 2 0 01-2 2H9l-3 3v-3H4a2 2 0 01-2-2V5z" />
          <path d="M15 7v2a4 4 0 01-4 4H9.828l-1.766 1.767c.28.149.599.233.938.233h2l3 3v-3h2a2 2 0 002-2V9a2 2 0 00-2-2h-1z" />
        </svg>
        채팅
      </h3>
      <div id="chatMessages" className="overflow-y-auto waitingRoom-custom-scrollbar space-y-3 mb-3 h-[300px]" ref={chatMessagesRef}>
        {messages.map((msg, index) => (
          <div key={index} className={`flex items-start ${msg.sender === currentUser ? 'justify-end' : ''}`}>
            {/* msg.sender !== currentUser 조건으로 아바타 표시를 제어 */}
            {msg.sender !== currentUser && (
              <div className="avatar-wrapper w-8 h-8 rounded-full overflow-hidden mr-2 flex-shrink-0">
                {playerData?.[msg.sender]?.profileUrl ? (
                    <img 
                        src={playerData[msg.sender].profileUrl} 
                        alt={`${msg.sender} 아바타`} 
                        className="w-full h-full object-cover" 
                    />
                ) : (
                    // 이미지 없을 경우 기존 이니셜/색상 폴백 (선택 사항)
                    <div className={`w-full h-full flex items-center justify-center text-xs font-medium ${playerData?.[msg.sender]?.avatarColor || 'bg-gray-500'}`}>
                        {playerData?.[msg.sender]?.avatar || msg.sender.charAt(0)}
                    </div>
                )}
            </div>
            )}
            <div className={`waitingRoom-chat-bubble rounded-lg p-2 max-w-[80%] ${msg.sender === currentUser ? 'waitingRoom-chat-bubble-right bg-blue-600/50' : 'waitingRoom-chat-bubble-left bg-blue-900/50'}`}>
              <p className="text-xs waitingRoom-text mb-1">
                {msg.sender === currentUser ? '코드마스터 (나)' : msg.sender}
              </p>
              <p className="text-sm ">{msg.text}</p>
            </div>
            {/* msg.sender === currentUser 조건으로 아바타 표시를 제어 */}
            {msg.sender === currentUser && (
              <div className={`w-8 h-8 rounded-full ${playerData[msg.sender]?.avatarColor || 'bg-gray-500'} flex items-center justify-center text-xs font-medium ml-2 flex-shrink-0`}>
                {playerData[msg.sender]?.avatar || msg.sender.charAt(0)}
              </div>
            )}
          </div>
        ))}
      </div>
      <div className="flex items-center mt-3">
        <input
          type="text"
          id="chatInput"
          placeholder="메시지 입력..."
          className="bg-blue-900/30  border border-blue-800 rounded-l-md px-3 py-2 text-sm flex-1 focus:outline-none focus:ring-1 focus:ring-blue-500"
          value={inputMessage}
          onChange={handleInputChange}
          onKeyPress={handleKeyPress}
        />
        <button id="sendChat" className="bg-blue-600 hover:bg-blue-700  px-4 py-2 rounded-r-md transition" onClick={handleSendClick}>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
          </svg>
        </button>
      </div>
    </div>
  );
}

export default ChatWindow;