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
  const [joinedRoomId, setJoinedRoomId] = useState(null);

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
      console.log('WebSocketContext: Connected to STOMP server.'); // 로그 추가
    };

    client.onStompError = (frame) => {
      console.error('WebSocketContext: STOMP Error:', frame); // 로그 추가
      setError('WebSocket connection error.');
      setIsConnected(false);
    };

    client.activate();
    clientRef.current = client;

    return () => {
      if (clientRef.current && clientRef.current.connected) {
        clientRef.current.deactivate();
        console.log('WebSocketContext: Deactivated STOMP client.'); // 로그 추가
      }
    };
  }, []);

  const joinRoom = (roomId, userInfo) => {
    if (!(clientRef.current && clientRef.current.connected)) {
      console.warn('WebSocketContext: Client not connected. Cannot join room.'); // 로그 추가
      return;
    }

    if (joinedRoomId === roomId) {
        console.log(`WebSocketContext: Already in room ${roomId}. Skipping join.`);
        return;
    }
    
    if (joinedRoomId && subscriptionsRef.current[joinedRoomId]) {
      console.log(`WebSocketContext: Unsubscribing from old room ${joinedRoomId}.`); // 로그 추가
      subscriptionsRef.current[joinedRoomId].forEach(sub => sub.unsubscribe());
      delete subscriptionsRef.current[joinedRoomId];
      setMessages([]);
      setUsers([]);
      setJoinedRoomId(null);
    }
    
    console.log(`WebSocketContext: Subscribing to room topics for ${roomId}.`); // 로그 추가
    const roomSub = clientRef.current.subscribe(`/topic/room/${roomId}`, (msg) => {
      const body = JSON.parse(msg.body);
      console.log('WebSocketContext: Received message from /topic:', body); // 로그 추가
      if (body.type === 'Chat') {
        setMessages((prev) => [...prev, { sender: body.nickname, text: body.content, profileUrl: body.profileUrl }]);
      } else if (body.type === 'Join') {
        setUsers((prev) => {
            if (prev.some(u => u.userId === body.userId)) return prev;
            return [...prev, { userId: body.userId, nickname: body.nickname, profileUrl: body.profileUrl }];
        });
      } else if (body.type === 'Leave') {
        setUsers((prev) => prev.filter(u => u.userId !== body.userId));
      } else if (body.type === 'CurrentUsers') {
        setUsers(body.users || []);
      }
    });
    
    const userSub = clientRef.current.subscribe(`/user/queue/room/${roomId}/users`, (msg) => {
      const body = JSON.parse(msg.body);
      console.log('WebSocketContext: Received message from /user/queue:', body); // 로그 추가
      if (body.type === 'CurrentUsers') {
        setUsers(body.users || []);
      }
    });

    subscriptionsRef.current[roomId] = [roomSub, userSub];
    
    console.log(`WebSocketContext: Publishing Join message to /app/room/${roomId}/join.`); // 로그 추가
    clientRef.current.publish({
      destination: `/app/room/${roomId}/join`,
      body: JSON.stringify({
        type: 'Join',
        userId: userInfo.userId,
        nickname: userInfo.nickname,
        profileUrl: userInfo.profileUrl,
      }),
    });
    setJoinedRoomId(roomId);
  };

  const sendMessage = (roomId, messageData) => {
    if (clientRef.current && clientRef.current.connected) {
      console.log(`WebSocketContext: Publishing Chat message to /app/room/${roomId}/chat:`, messageData); // 로그 추가
      clientRef.current.publish({
        destination: `/app/room/${roomId}/chat`,
        body: JSON.stringify({
          type: 'Chat',
          ...messageData,
        }),
      });
    } else {
      console.warn('WebSocketContext: Client not connected. Message not sent.', messageData);
      setError('채팅 서버에 연결되어 있지 않습니다. 메시지를 보낼 수 없습니다.');
    }
  };

  const leaveRoom = (roomId, userId) => {
    if (clientRef.current && clientRef.current.connected) {
      console.log(`WebSocketContext: Publishing Leave message to /app/room/${roomId}/leave.`); // 로그 추가
      clientRef.current.publish({
        destination: `/app/room/${roomId}/leave`,
        body: JSON.stringify({ type: 'Leave', userId }),
      });
      const subs = subscriptionsRef.current[roomId];
      if (subs) {
        console.log(`WebSocketContext: Unsubscribing from room ${roomId}.`); // 로그 추가
        subs.forEach(s => s.unsubscribe());
        delete subscriptionsRef.current[roomId];
      }
    }
    if (joinedRoomId === roomId) {
      setJoinedRoomId(null);
    }
  };

  const contextValue = {
    messages,
    sendMessage,
    joinRoom,
    leaveRoom,
    users,
    isConnected,
    error,
    client: clientRef.current,
    joinedRoomId
  };

  return (
      <WebSocketContext.Provider value={contextValue}>
        {children}
      </WebSocketContext.Provider>
  );
};

export const useWebSocket = () => {
  const context = useContext(WebSocketContext);
  if (context === undefined) {
    throw new Error('useWebSocket must be used within a WebSocketProvider');
  }
  return context;
};