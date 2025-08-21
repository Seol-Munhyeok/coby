// src/contexts/WebSocketContext.jsx
// WebSocketContext는 STOMP 기반의 WebSocket 연결을 관리하며
// 대기방/배틀룸에서 사용하는 실시간 기능을 제공한다.
import React, { createContext, useState, useEffect, useRef, useContext, useCallback } from 'react';
import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';

export const WebSocketContext = createContext(null);

export const WebSocketProvider = ({ children }) => {
  // 실시간 채팅 메시지 목록
  const [messages, setMessages] = useState([]);
  // 현재 방의 참여자 정보
  const [users, setUsers] = useState([]);
  // 소켓 연결 여부와 에러 메시지
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState(null);
  // STOMP 클라이언트 인스턴스와 구독 목록을 저장
  const clientRef = useRef(null);
  const subscriptionsRef = useRef({});
  // 현재 참여 중인 방 ID와 게임 시작 여부
  const [joinedRoomId, setJoinedRoomId] = useState(null);
  const [gameStart, setGameStart] = useState(false);
  // 강퇴 여부 및 현재 사용자 ID를 저장
  const [forcedOut, setForcedOut] = useState(false)
  const currentUserIdRef = useRef(null);

  // 컴포넌트가 마운트될 때 서버와 WebSocket 연결을 설정
  useEffect(() => {
    const socketFactory = () => new SockJS(`${process.env.REACT_APP_API_URL}/ws`);
    const client = new Client({
      webSocketFactory: socketFactory,
      debug: (str) => console.log(str),
      reconnectDelay: 5000,  // 연결이 끊어지면 5초 뒤 재시도
    });

    // 연결 성공 시 상태를 초기화
    client.onConnect = () => {
      setIsConnected(true);
      setError(null);
    };

    // STOMP 프로토콜 오류 발생 시 호출
    client.onStompError = () => {
      setError('WebSocket connection error.');
      setIsConnected(false);
    };

    client.activate();
    clientRef.current = client;

    // 언마운트 시 연결 해제
    return () => {
      if (clientRef.current && clientRef.current.connected) {
        clientRef.current.deactivate();
      }
    };
  }, []);


  // 특정 방에 참여하고 서버로부터 오는 메시지를 구독
  const joinRoom = useCallback((roomId, userInfo) => {
    if (!(clientRef.current && clientRef.current.connected)) return;

    // 이미 해당 방에 참여 중이면 재참여를 건너뜁니다.
    if (joinedRoomId === roomId) return;

    // 현재 사용자 ID 저장
    currentUserIdRef.current = userInfo.userId;

    // 새로운 방에 참여할 때 기존 메시지와 유저 목록, 게임 시작 상태를 초기화합니다.
    setMessages([]);
    setUsers([]);
    setGameStart(false);

    // 방 정보에 대한 구독이 아직 없다면 생성
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
                userId: Number(data.userId),
                nickname: data.nickname,
                profileUrl: data.profileUrl,
                isReady: data.isReady ?? false,
                isHost: data.isHost ?? false
              }
            ]);
            break;
          case 'Ready':
            setUsers((prev) =>
              prev.map((u) =>
                u.userId === Number(data.userId) ? { ...u, isReady: data.isReady } : u)
            );
            break;
          case 'Leave':
            setUsers((prev) => prev.filter((u) => u.userId !== data.userId));
            if (Number(data.userId) === Number(currentUserIdRef.current)) {
              cleanupRoom(roomId);
              setForcedOut(true);
            }
            break;
          case 'Host':
            setUsers((prev) =>
                prev.map((u) => ({ ...u, isHost: u.userId === Number(data.userId) }))
            );
            break;
          case 'StartGame':
            setGameStart(true);
            break;
          default:
            break;

        }
      });

      // 서버로부터 현재 방의 유저 목록을 받아오기 위한 구독
      const userSub = clientRef.current.subscribe(`/user/queue/room/${roomId}/users`, (msg) => {
        const body = JSON.parse(msg.body);
        if (body.type === 'CurrentUsers') {
          setUsers((body.users || []).map((user) => ({
            ...user,
            userId: Number(user.userId),
            isHost: user.isHost ?? false,
          })));
        }
      });
      subscriptionsRef.current[roomId] = [roomSub, userSub];
    }

    // 서버에 현재 방 참여를 알림
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

  // 방 관련 구독과 상태를 정리하는 공통 함수
  const cleanupRoom = useCallback((roomId) => {
    const subs = subscriptionsRef.current[roomId];
    if (subs) {
      subs.forEach(s => s.unsubscribe());
      delete subscriptionsRef.current[roomId];
    }
    setJoinedRoomId(prev => (prev === roomId ? null : prev));
    setMessages([]);
    setUsers([]);
    setGameStart(false);
  }, []);

  // 채팅 메시지를 서버로 전송
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

  // 준비 상태를 서버에 전달
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

  // 방장 권한을 다른 플레이어에게 위임
  const delegateHost = useCallback((roomId, userId) => {
    if (clientRef.current && clientRef.current.connected) {
      clientRef.current.publish({
        destination: `/app/room/${roomId}/host`,
        body: JSON.stringify({
          type: 'Host',
          userId,
        }),
      });
    }
  }, []);

  // 게임 시작 요청을 서버로 전송
  const startGame = useCallback((roomId) => {
    if (clientRef.current && clientRef.current.connected) {
      clientRef.current.publish({
        destination: `/app/room/${roomId}/start`,
        body: JSON.stringify({ type: 'StartGame'}),
      });
    }
  }, []);

  // 방에서 나가고 관련 구독 및 상태를 정리
  const leaveRoom = useCallback((roomId, userId) => {
    if (clientRef.current && clientRef.current.connected) {
      clientRef.current.publish({
        destination: `/app/room/${roomId}/leave`,
        body: JSON.stringify({type: 'Leave', userId}),
      });
    }
    cleanupRoom(roomId);
  }, [cleanupRoom]);

  const resetForcedOut = useCallback(() => setForcedOut(false), []);

  // joinRoom and sendMessage functions are defined above
  // 컨텍스트에서 노출할 값들
  const contextValue = {
    messages,
    sendMessage,
    joinRoom,
    leaveRoom,
    toggleReady,
    delegateHost,
    startGame,
    users,
    isConnected,
    error,
    client: clientRef.current,
    joinedRoomId,
    gameStart,
    forcedOut,
    resetForcedOut
  };

  // 자식 컴포넌트들이 사용할 수 있도록 컨텍스트 제공
  return (
      <WebSocketContext.Provider value={contextValue}>
        {children}
      </WebSocketContext.Provider>
  );
};

// 컨텍스트를 쉽게 사용하기 위한 커스텀 훅
export const useWebSocket = () => {
  const context = useContext(WebSocketContext);
  if (context === undefined) {
    throw new Error('useWebSocket must be used within a WebSocketProvider');
  }
  return context;
};