// stockweather-frontend/src/contexts/SocketContext.tsx

import React, { createContext, useContext, useEffect, useRef, useState, ReactNode } from 'react';
import { io, Socket } from 'socket.io-client';

import {
  ServerToClientEvents,
  ClientToServerEvents,
  StockWeatherResponseDto,
} from '../types/stock';

interface SocketContextType {
  socket: Socket<ServerToClientEvents, ClientToServerEvents> | null;
  socketId: string | null;
  socketConnected: boolean;
  requestingSocketId: string | null;
  setRequestingSocketId: (id: string | null) => void;
  processingResult: StockWeatherResponseDto | null; // ✅ 추가
  setProcessingResult: (result: StockWeatherResponseDto | null) => void; // ✅ 추가
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export const SocketProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [socket, setSocket] = useState<Socket<ServerToClientEvents, ClientToServerEvents> | null>(null);
  const [socketId, setSocketId] = useState<string | null>(null);
  const [socketConnected, setSocketConnected] = useState<boolean>(false);
  const [requestingSocketId, setRequestingSocketId] = useState<string | null>(null);
  const [processingResult, setProcessingResult] = useState<StockWeatherResponseDto | null>(null); // ✅ 추가

  const socketRef = useRef<Socket<ServerToClientEvents, ClientToServerEvents> | null>(null);
  const socketUrl = process.env.NEXT_PUBLIC_SOCKET_SERVER_URL || 'http://localhost:3001';

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const storedToken = localStorage.getItem('jwtToken');

    if (!storedToken) {
      if (socketRef.current && socketRef.current.connected) {
        socketRef.current.disconnect();
      }
      socketRef.current = null;
      setSocket(null);
      setSocketConnected(false);
      setSocketId(null);
      setRequestingSocketId(null);
      setProcessingResult(null); // ✅ 초기화
      return;
    }

    if (socketRef.current && socketRef.current.connected) {
      const currentAuth = socketRef.current.auth;
      if (currentAuth && typeof currentAuth === 'object' && 'token' in currentAuth && currentAuth.token === storedToken) {
        setSocket(socketRef.current);
        setSocketConnected(true);
        setSocketId(socketRef.current.id || null);
        return;
      }
    }

    const newSocket = io(socketUrl, {
      auth: { token: storedToken },
      transports: ['websocket', 'polling'],
      forceNew: false,
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    socketRef.current = newSocket;
    setSocket(newSocket);

    const currentSocketInstance = newSocket;

    currentSocketInstance.on('connect', () => {
      console.log('[Socket.IO] Connected to server:', currentSocketInstance.id);
      setSocketConnected(true);
      setSocketId(currentSocketInstance.id || null);
    });

    currentSocketInstance.on('disconnect', (reason) => {
      console.log('[Socket.IO] Disconnected from server:', reason);
      setSocketConnected(false);
      setSocketId(null);
      setRequestingSocketId(null);
      setProcessingResult(null); // ✅ 초기화
    });

    currentSocketInstance.on('connect_error', (err) => {
      console.error('[Socket.IO] Connection Error:', err.message, err);
      setSocketConnected(false);
      setSocketId(null);
      setRequestingSocketId(null);
      setProcessingResult(null); // ✅ 초기화
    });

    currentSocketInstance.on('error', (err) => {
      console.error('[Socket.IO] General Error:', err);
    });

    // ✅ 핵심: processingComplete 전역 리스너
    const handleProcessingComplete = (data: StockWeatherResponseDto) => {
      console.log('[SocketContext] processingComplete received:', data);
      setProcessingResult(data);
    };

    currentSocketInstance.on('processingComplete', handleProcessingComplete);

    return () => {
      if (currentSocketInstance) {
        console.log('[Socket.IO] Cleaning up Socket.IO listeners.');
        currentSocketInstance.off('connect');
        currentSocketInstance.off('disconnect');
        currentSocketInstance.off('connect_error');
        currentSocketInstance.off('error');
        currentSocketInstance.off('processingComplete', handleProcessingComplete); // ✅ 클린업
      }
    };
  }, [socketUrl]);

  return (
    <SocketContext.Provider value={{
      socket,
      socketId,
      socketConnected,
      requestingSocketId,
      setRequestingSocketId,
      processingResult, // ✅ 제공
      setProcessingResult, // ✅ 제공
    }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (context === undefined) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};
