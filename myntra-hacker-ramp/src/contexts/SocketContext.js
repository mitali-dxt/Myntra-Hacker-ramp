"use client";

import { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';

const SocketContext = createContext();

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};

export function SocketProvider({ children }) {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // Initialize socket connection
    const socketInstance = io(process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3000', {
      transports: ['websocket', 'polling'],
    });

    socketInstance.on('connect', () => {
      console.log('Connected to socket server');
      setIsConnected(true);
    });

    socketInstance.on('disconnect', () => {
      console.log('Disconnected from socket server');
      setIsConnected(false);
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
    };
  }, []);

  const joinSession = (sessionCode) => {
    if (socket) {
      socket.emit('join-session', sessionCode);
    }
  };

  const leaveSession = (sessionCode) => {
    if (socket) {
      socket.emit('leave-session', sessionCode);
    }
  };

  const sendMessage = (sessionCode, message, userName) => {
    if (socket) {
      socket.emit('chat-message', { sessionCode, message, userName, timestamp: new Date() });
    }
  };

  const updateCart = (sessionCode, cartData) => {
    if (socket) {
      socket.emit('cart-update', { sessionCode, cartData });
    }
  };

  const sendVote = (sessionCode, itemId, value, userName) => {
    if (socket) {
      socket.emit('vote-update', { sessionCode, itemId, value, userName });
    }
  };

  const value = {
    socket,
    isConnected,
    joinSession,
    leaveSession,
    sendMessage,
    updateCart,
    sendVote,
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
}