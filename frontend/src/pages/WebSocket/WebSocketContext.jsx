// src/contexts/WebSocketContext.jsx
// WebSocketContext는 STOMP 기반의 WebSocket 연결을 관리하며
// 대기방/배틀룸에서 사용하는 실시간 기능을 제공한다.
import React, { createContext, useState, useEffect, useRef, useContext, useCallback } from 'react';
import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';

export const WebSocketContext = createContext(null);

const parseServerUtcMillis = (value) => {
  if (value == null) return Number.NaN;

  if (typeof value === 'number') {
    return Number.isFinite(value) ? value : Number.NaN;
  }

  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (!trimmed) return Number.NaN;
    const hasTimezone = /([zZ]|[+-]\d\d:\d\d)$/.test(trimmed);
    return new Date(hasTimezone ? trimmed : `${trimmed}Z`).getTime();
  }

  return Number.NaN;
};

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
  const [gameStartAt, setGameStartAt] = useState(null);
  const [gameExpireAt, setGameExpireAt] = useState(null);
  const [gameTimeLimitSeconds, setGameTimeLimitSeconds] = useState(null);
  const [gameStartDelaySeconds, setGameStartDelaySeconds] = useState(null);
  const [remainingTimeMs, setRemainingTimeMs] = useState(null);
  const [gameExpired, setGameExpired] = useState(false);
  // 강퇴 여부 및 현재 사용자 ID를 저장
  const [forcedOut, setForcedOut] = useState(false)
  const currentUserIdRef = useRef(null);
  const currentUserInfoRef = useRef(null);
  // 시스템 토스트 메시지와 자발적 퇴장을 구분하기 위한 ref
  const [systemMessage, setSystemMessage] = useState(null);
  const voluntaryLeaveRef = useRef(false);
  const leaveAckResolverRef = useRef(null);
  // 재시작 용 변수
  const [restartModal, setRestartModal] = useState(false);
  const [votes, setVotes] = useState({}); // { userId: true/false }

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
    currentUserInfoRef.current = userInfo;

    // 새로운 방에 참여할 때 기존 메시지와 유저 목록, 게임 시작 상태를 초기화합니다.
    setMessages([]);
    setUsers([]);
    setGameStart(false);
    setGameStartDelaySeconds(null);

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
                isHost: data.isHost ?? false,
                tier: data.tier ?? '브론즈',
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
            // 사용자 목록(users) 상태를 업데이트
            setUsers((prev) => {
              // 이전 사용자 목록(prev)에서 지금 나간 사용자의 정보를 찾음
              const leavingUser = prev.find((u) => u.userId === Number(data.userId));

              if (leavingUser) {
                setSystemMessage(`${leavingUser.nickname}님이 퇴장했습니다.`);
              }
              // 기존 사용자 목록에서 나간 사용자를 제외한 새로운 배열을 반환하여 화면을 갱신
              return prev.filter((u) => u.userId !== Number(data.userId));
            });

            // 나간 사용자가 '나 자신'인지 확인
            if (Number(data.userId) === Number(currentUserIdRef.current)) {
              const resolver = leaveAckResolverRef.current;
              if (resolver) {
                resolver();
                leaveAckResolverRef.current = null;
              }

              cleanupRoom(roomId);

              currentUserIdRef.current = null;
              currentUserInfoRef.current = null;

              if (!voluntaryLeaveRef.current) {
                setForcedOut(true);
              } else {
                voluntaryLeaveRef.current = false;
              }
            }
            break;
          case 'Host':
            setUsers((prev) =>
                prev.map((u) => ({ ...u, isHost: u.userId === Number(data.userId) }))
            );
            break;
          case 'StartGame':
            setGameStart(true);
            setGameExpired(false);
            if (typeof data.gameStartDelaySeconds === 'number') {
              setGameStartDelaySeconds(data.gameStartDelaySeconds);
            } else if (typeof data.gameStartDelaySeconds === 'string') {
              const parsedDelay = Number.parseInt(data.gameStartDelaySeconds, 10);
              setGameStartDelaySeconds(Number.isNaN(parsedDelay) ? null : parsedDelay);
            } else {
              setGameStartDelaySeconds(null);
            }
            if (data.startAt) {
              const parsedStart = parseServerUtcMillis(data.startAt);
              setGameStartAt(Number.isNaN(parsedStart) ? null : parsedStart);
            } else {
              setGameStartAt(null);
            }
            if (data.expireAt) {
              const parsedExpire = parseServerUtcMillis(data.expireAt);
              if (!Number.isNaN(parsedExpire)) {
                setGameExpireAt(parsedExpire);
                setRemainingTimeMs(Math.max(0, parsedExpire - Date.now()));
              } else {
                setGameExpireAt(null);
                setRemainingTimeMs(null);
              }
            } else {
              setGameExpireAt(null);
              setRemainingTimeMs(null);
            }
            if (typeof data.timeLimitSeconds === 'number') {
              setGameTimeLimitSeconds(data.timeLimitSeconds);
            } else {
              setGameTimeLimitSeconds(null);
            }
            break;
          case 'GameExpired':
            setGameExpired(true);
            setGameStart(false);
            setGameStartAt(null);
            setGameExpireAt(null);
            setGameTimeLimitSeconds(null);
            setRemainingTimeMs(0);
            setGameStartDelaySeconds(null);
            break;
          default:
            break;
        }
      });

      // 재시작 로직
      const restartSub = clientRef.current.subscribe(`/topic/restart/${roomId}`, (msg) => {
          const data = JSON.parse(msg.body);

          switch (data.type) {
              case "Vote":
                  setVotes((prev) => ({ ...prev, [data.userId]: data.join }));
                  break;
              case "RestartStarted":
                  setVotes({});
                  setRestartModal(true);
                  break;
              case "RestartResult":
                  setRestartModal(false);
                  if (data.newRoomId) {
                      // 기존 room 구독 해제
                      cleanupRoom(roomId);
                      leaveRoom(roomId, currentUserIdRef.current);
                      // 새 방으로 자동 이동
                      const newRoomIdStr = String(data.newRoomId);

                      // CustomEvent로 페이지 이동 알림
                      window.dispatchEvent(new CustomEvent('navigateToWaitingRoom', {
                        detail: { roomId: newRoomIdStr,
                        userId: data.userId}
                      }));
                  } else {
                      // 거부 or 타임아웃 → 메인으로 이동
                      cleanupRoom(roomId);
                      window.dispatchEvent(new CustomEvent('navigateToMain'));
                  }
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

      // 강퇴 알림을 위한 개인 큐 구독
      const kickedSub = clientRef.current.subscribe('/user/queue/kicked', (msg) => {
        const body = JSON.parse(msg.body);
        if (body.type === 'Kicked') {
          cleanupRoom(body.roomId);
          currentUserIdRef.current = null;
          currentUserInfoRef.current = null;
          setForcedOut(true);
        }
      });
      subscriptionsRef.current[roomId] = [roomSub, userSub, kickedSub, restartSub];
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

  // 재시작 요청 (방장이나 아무나 누를 수 있다고 가정)
  const requestRestart = useCallback((roomId, userId) => {
      if (clientRef.current && clientRef.current.connected) {
          clientRef.current.publish({
              destination: `/app/room/${roomId}/restart`,
              body: JSON.stringify({ type: "RestartGame", roomId, userId })
          });
      }
  }, []);
  // 투표 응답
  const sendVote = useCallback((roomId, userId, join) => {
      if (clientRef.current && clientRef.current.connected) {
          clientRef.current.publish({
              destination: `/app/room/${roomId}/vote`,
              body: JSON.stringify({ type: "Vote", roomId, userId, isJoin: join })
          });
      }
  }, []);

  // 방 관련 구독과 상태를 정리하는 공통 함수
  const cleanupRoom = useCallback((roomId) => {
    const subs = subscriptionsRef.current[roomId];
    if (subs) {
      subs.forEach(s => s.unsubscribe());
      delete subscriptionsRef.current[roomId];
    }
    leaveAckResolverRef.current = null;
    voluntaryLeaveRef.current = false;
    setJoinedRoomId(prev => (prev === roomId ? null : prev));
    setMessages([]);
    setUsers([]);
    setGameStart(false);
    setGameStartAt(null);
    setGameExpireAt(null);
    setGameTimeLimitSeconds(null);
    setRemainingTimeMs(null);
    setGameExpired(false);
    setGameStartDelaySeconds(null);
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
      voluntaryLeaveRef.current = true;
      const leaveAckPromise = new Promise((resolve) => {
        leaveAckResolverRef.current = resolve;
      });
      clientRef.current.publish({
        destination: `/app/room/${roomId}/leave`,
        body: JSON.stringify({ type: 'Leave', userId }),
      });
      return leaveAckPromise;
    }

    // 서버로부터 명시적인 응답을 받은 후에 구독을 정리한다.
    cleanupRoom(roomId);
    currentUserIdRef.current = null;
    currentUserInfoRef.current = null;
    return Promise.resolve();
  }, [cleanupRoom]);

  const resetForcedOut = useCallback(() => setForcedOut(false), []);
  const clearSystemMessage = useCallback(() => setSystemMessage(null), []);

  // joinRoom and sendMessage functions are defined above
  // 컨텍스트에서 노출할 값들
  const recalculateRemainingTime = useCallback(() => {
    if (gameExpireAt) {
      setRemainingTimeMs(Math.max(0, gameExpireAt - Date.now()));
    } else {
      setRemainingTimeMs(null);
    }
  }, [gameExpireAt]);

  useEffect(() => {
    if (!gameExpireAt) {
      setRemainingTimeMs(null);
      return;
    }

    const updateRemaining = () => {
      const diff = Math.max(0, gameExpireAt - Date.now());
      setRemainingTimeMs(diff);
      if (diff === 0) {
        setGameExpired(true);
      }
    };

    updateRemaining();
    const intervalId = setInterval(updateRemaining, 1000);

    return () => clearInterval(intervalId);
  }, [gameExpireAt]);

  const remainingTimeSeconds =
      remainingTimeMs !== null ? Math.max(0, Math.floor(remainingTimeMs / 1000)) : null;

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
    startAt: gameStartAt,
    expireAt: gameExpireAt,
    timeLimitSeconds: gameTimeLimitSeconds,
    gameStartDelaySeconds,
    remainingTimeMs,
    remainingTimeSeconds,
    recalculateRemainingTime,
    gameExpired,
    forcedOut,
    resetForcedOut,
    clearSystemMessage,
    systemMessage,
    requestRestart,
    sendVote,
    restartModal,
    votes,
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