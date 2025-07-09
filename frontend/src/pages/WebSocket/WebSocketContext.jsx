// src/contexts/WebSocketContext.jsx
import React, { createContext, useState, useEffect, useRef, useContext } from 'react';

export const WebSocketContext = createContext(null);

export const WebSocketProvider = ({ children }) => {
  const [messages, setMessages] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState(null);
  const ws = useRef(null);

  useEffect(() => {
    if (!ws.current || ws.current.readyState === WebSocket.CLOSED) {
      console.log('Attempting to connect WebSocket...');
      const wsUrl = process.env.REACT_APP_API_URL.replace(/^http/, 'ws');
      ws.current = new WebSocket(`${wsUrl}/ws/chat`);

      ws.current.onopen = () => {
        console.log('WebSocket connected');
        setIsConnected(true);
        setError(null);
      };

      ws.current.onmessage = (event) => {
        console.log('Message received:', event.data);
        try {
          const receivedMessage = JSON.parse(event.data);
          setMessages((prevMessages) => [...prevMessages, receivedMessage]);
        } catch (e) {
          console.error("Failed to parse message:", e, event.data);
          setMessages((prevMessages) => [...prevMessages, { sender: "System", text: event.data, type: "raw" }]);
        }
      };

      ws.current.onclose = () => {
        console.log('WebSocket disconnected');
        setIsConnected(false);
        // Attempt to reconnect after a delay, or handle permanent disconnection
        // For simplicity, we won't add auto-reconnect here, but it's a common pattern.
      };

      ws.current.onerror = (err) => {
        console.error('WebSocket error:', err);
        setError('WebSocket connection error.');
        setIsConnected(false);
        ws.current.close(); // Ensure clean close on error
      };
    }

    // Cleanup on component unmount (or when this effect re-runs)
    return () => {
      if (ws.current && ws.current.readyState === WebSocket.OPEN) {
        console.log('Closing WebSocket due to unmount/re-run');
        ws.current.close();
      }
    };
  }, []); // Empty dependency array means this effect runs once on mount and cleans up on unmount

  const sendMessage = (messageData) => {
    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify(messageData));
    } else {
      console.warn('WebSocket not connected. Message not sent:', messageData);
      setError('채팅 서버에 연결되어 있지 않습니다. 메시지를 보낼 수 없습니다.');
    }
  };

  const contextValue = {
    messages,
    sendMessage,
    isConnected,
    error,
    wsInstance: ws.current // Expose the raw instance if needed (use with caution)
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