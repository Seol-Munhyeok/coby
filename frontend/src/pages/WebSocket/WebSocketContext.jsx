// src/contexts/WebSocketContext.jsx
import React, { createContext, useState, useEffect, useRef, useContext } from 'react';
import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';

export const WebSocketContext = createContext(null);

export const WebSocketProvider = ({ children }) => {
  const [messages, setMessages] = useState([]);
  const [users, setUsers] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState(null);
  const clientRef = useRef(null);
  const subscriptionsRef = useRef({});

  useEffect(() => {
    const socketFactory = () => new SockJS(`${process.env.REACT_APP_API_URL}/ws`);
    const client = new Client({
      webSocketFactory: socketFactory,
      debug: (str) => console.log(str),
      reconnectDelay: 5000,
    });

    client.onConnect = () => {
      setIsConnected(true);
      setError(null);
    };

    client.onStompError = () => {
      setError('WebSocket connection error.');
      setIsConnected(false);
    };

    client.activate();
    clientRef.current = client;

    return () => {
      if (clientRef.current && clientRef.current.connected) {
        clientRef.current.deactivate();
      }
    };
  }, []);

  const joinRoom = (roomId, userInfo) => {
    if (clientRef.current && clientRef.current.connected && !subscriptionsRef.current[roomId]) {
      const roomSub = clientRef.current.subscribe(`/topic/room/${roomId}`, (msg) => {
        const body = JSON.parse(msg.body);
        if (body.type === 'Chat') {
          setMessages((prev) => [...prev, { sender: body.nickname, text: body.content, profileUrl: body.profileUrl }]);
        } else if (body.type === 'Join') {
          setUsers((prev) => [...prev, { userId: body.userId, nickname: body.nickname, profileUrl: body.profileUrl }]);
        } else if (body.type === 'Leave') {
          setUsers((prev) => prev.filter(u => u.userId !== body.userId));
        }
      });
      const userSub = clientRef.current.subscribe(`/user/queue/room/${roomId}/users`, (msg) => {
        const body = JSON.parse(msg.body);
        if (body.type === 'CurrentUsers') {
          setUsers(body.users || []);
        }
      });
      subscriptionsRef.current[roomId] = [roomSub, userSub];
      clientRef.current.publish({
        destination: `/app/room/${roomId}/join`,
        body: JSON.stringify({
          type: 'CurrentUsers',
          userId: userInfo.userId,
          nickname: userInfo.nickname,
          profileUrl: userInfo.profileUrl,
        }),
      });
    }
  };

  const sendMessage = (roomId, messageData) => {
    if (clientRef.current && clientRef.current.connected) {
      clientRef.current.publish({
        destination: `/app/room/${roomId}/chat`,
        body: JSON.stringify({
          type: 'Chat',
          ...messageData,
        }),
      });
    } else {
      console.warn('WebSocket not connected. Message not sent:', messageData);
      setError('채팅 서버에 연결되어 있지 않습니다. 메시지를 보낼 수 없습니다.');
    }
  };

  const leaveRoom = (roomId, userId) => {
    if (clientRef.current && clientRef.current.connected) {
      clientRef.current.publish({
        destination: `/app/room/${roomId}/leave`,
        body: JSON.stringify({ type: 'Leave', userId }),
      });
      const subs = subscriptionsRef.current[roomId];
      if (subs) {
        subs.forEach(s => s.unsubscribe());
        delete subscriptionsRef.current[roomId];
      }
    }
  };

  // joinRoom and sendMessage functions are defined above

  const contextValue = {
    messages,
    sendMessage,
    joinRoom,
    leaveRoom,
    users,
    isConnected,
    error,
    client: clientRef.current
  };

  return (
      <WebSocketContext.Provider value={contextValue}>
        {children}
      </WebSocketContext.Provider>
  );
};

// Custom hook to easily consume the context
export const useWebSocket = () => {
  const context = useContext(WebSocketContext);
  if (context === undefined) {
    throw new Error('useWebSocket must be used within a WebSocketProvider');
  }
  return context;
};