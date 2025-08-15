// src/contexts/WebSocketContext.jsx
import React, { createContext, useState, useEffect, useRef, useContext, useCallback } from 'react';
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

  const joinRoom = useCallback((roomId, userInfo) => {
    if (!(clientRef.current && clientRef.current.connected)) return;

    // 이미 해당 방에 참여 중이면 재참여를 건너뜀
    if (joinedRoomId === roomId) return;

    // 새로운 방에 참여할 때 기존 메시지와 유저 목록을 초기화합니다.
    setMessages([]);
    setUsers([]);

    if (!subscriptionsRef.current[roomId]) {
      const roomSub = clientRef.current.subscribe(`/topic/room/${roomId}`, (message) => {
        const data = JSON.parse(message.body);
        switch (data.type) {
          case 'Chat':
            setMessages((prev) => [
              ...prev,
              { sender: data.nickname, text: data.content, profileUrl: data.profileUrl }
            ]);
            break;
          case 'Join':
            setUsers((prev) => [
              ...prev,
              {
                userId: data.userId,
                nickname: data.nickname,
                profileUrl: data.profileUrl,
                isReady: data.isReady ?? false
              }
            ]);
            break;
          case 'Ready':
            setUsers((prev) =>
              prev.map((u) =>
                u.userId === data.userId ? { ...u, isReady: data.isReady } : u)
            );
            break;
          case 'Leave':
            setUsers((prev) => prev.filter((u) => u.userId !== data.userId));
            break;
          default:
            break;
        }
      });
      const userSub = clientRef.current.subscribe(`/user/queue/room/${roomId}/users`, (msg) => {
        const body = JSON.parse(msg.body);
        if (body.type === 'CurrentUsers') {
          setUsers(body.users || []);
        }
      });
      subscriptionsRef.current[roomId] = [roomSub, userSub];
    }
    clientRef.current.publish({
      destination: `/app/room/${roomId}/join`,
      body: JSON.stringify({
        type: 'CurrentUsers',
        userId: userInfo.userId,
        nickname: userInfo.nickname,
        profileUrl: userInfo.profileUrl,
      }),
    });
    setJoinedRoomId(roomId);
  }, [joinedRoomId]);

  const sendMessage = useCallback((roomId, messageData) => {
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
  }, []);

  const toggleReady = useCallback((roomId, userId, isReady) => {
    if (clientRef.current && clientRef.current.connected) {
      clientRef.current.publish({
        destination: `/app/room/${roomId}/ready`,
        body: JSON.stringify({
          type: 'Ready',
          userId,
          isReady,
        }),
      });
    }
  }, []);

  const leaveRoom = useCallback((roomId, userId) => {
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
    setJoinedRoomId(prev => (prev === roomId ? null : prev));
    // 방을 나가면 상태를 초기화하여 이전 메시지가 남지 않도록 합니다.
    setMessages([]);
    setUsers([]);
  }, []);




  // joinRoom and sendMessage functions are defined above

  const contextValue = {
    messages,
    sendMessage,
    joinRoom,
    leaveRoom,
    toggleReady,
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

// Custom hook to easily consume the context
export const useWebSocket = () => {
  const context = useContext(WebSocketContext);
  if (context === undefined) {
    throw new Error('useWebSocket must be used within a WebSocketProvider');
  }
  return context;
};