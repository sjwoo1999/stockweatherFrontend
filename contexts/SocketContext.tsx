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
  processingResult: StockWeatherResponseDto | null;
  setProcessingResult: (result: StockWeatherResponseDto | null) => void;
  isSocketReady: boolean;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export const SocketProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [socket, setSocket] = useState<Socket<ServerToClientEvents, ClientToServerEvents> | null>(null);
  const [socketId, setSocketId] = useState<string | null>(null);
  const [socketConnected, setSocketConnected] = useState<boolean>(false);
  const [requestingSocketId, setRequestingSocketId] = useState<string | null>(null);
  const [processingResult, setProcessingResult] = useState<StockWeatherResponseDto | null>(null);
  const [isSocketReady, setIsSocketReady] = useState<boolean>(false);

  const socketRef = useRef<Socket<ServerToClientEvents, ClientToServerEvents> | null>(null);
  const connectionTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const socketUrl = process.env.NEXT_PUBLIC_SOCKET_SERVER_URL || 'https://stockweather-websocket-1011872961068.asia-northeast3.run.app';

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const storedToken = localStorage.getItem('jwtToken');

    if (!storedToken) {
      console.log('[Socket.IO] JWT 토큰이 없습니다. 로그인이 필요합니다.');
      if (socketRef.current && socketRef.current.connected) {
        socketRef.current.disconnect();
      }
      socketRef.current = null;
      setSocket(null);
      setSocketConnected(false);
      setSocketId(null);
      setRequestingSocketId(null);
      setProcessingResult(null);
      setIsSocketReady(false);
      return;
    }

    if (!storedToken.startsWith('Bearer ')) {
      console.warn('[Socket.IO] JWT 토큰 형식이 올바르지 않습니다.');
      setSocketConnected(false);
      setSocketId(null);
      setIsSocketReady(false);
      return;
    }

    if (socketRef.current && socketRef.current.connected) {
      const currentAuth = socketRef.current.auth;
      if (currentAuth && typeof currentAuth === 'object' && 'token' in currentAuth && currentAuth.token === storedToken) {
        const currentId = socketRef.current.id;
        if (currentId) {
          setSocket(socketRef.current);
          setSocketConnected(true);
          setSocketId(currentId);
          setIsSocketReady(true);
          return;
        }
      }
    }

    const connectionTimeout = 10000;
    connectionTimeoutRef.current = setTimeout(() => {
      console.error('[Socket.IO] Connection timeout');
      setSocketConnected(false);
      setSocketId(null);
      setIsSocketReady(false);
    }, connectionTimeout);

    const newSocket = io(socketUrl, {
      auth: { token: storedToken },
      transports: ['websocket', 'polling'],
      forceNew: true,
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 20000,
      upgrade: true,
      rememberUpgrade: true,
    });

    socketRef.current = newSocket;
    setSocket(newSocket);

    const currentSocketInstance = newSocket;

    currentSocketInstance.on('connect', () => {
      if (connectionTimeoutRef.current) {
        clearTimeout(connectionTimeoutRef.current);
        connectionTimeoutRef.current = null;
      }

      const id = currentSocketInstance.id;
      if (id) {
        console.log('[Socket.IO] Connected to server:', id);
        setSocketId(id);
        setSocketConnected(true);
        setIsSocketReady(true);
      } else {
        console.warn('[Socket.IO] Connected but missing socket.id!');
        setSocketConnected(true);
        setIsSocketReady(false);
      }
    });

    currentSocketInstance.on('disconnect', (reason) => {
      console.log('[Socket.IO] Disconnected from server:', reason);
      setSocketConnected(false);
      setSocketId(null);
      setRequestingSocketId(null);
      setProcessingResult(null);
      setIsSocketReady(false);
    });

    currentSocketInstance.on('connect_error', (err) => {
      console.error('[Socket.IO] Connection Error:', err.message, err);
      
      // 🔥 JWT 인증 에러 특별 처리
      if (err.message.includes('Invalid or expired token') || err.message.includes('auth_error')) {
        console.error('[Socket.IO] JWT 인증 실패. 로그인이 필요합니다.');
        // JWT 토큰 제거하고 로그인 페이지로 리다이렉트
        localStorage.removeItem('jwtToken');
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
      }
      
      setSocketConnected(false);
      setSocketId(null);
      setRequestingSocketId(null);
      setProcessingResult(null);
      setIsSocketReady(false);
    });

    currentSocketInstance.on('error', (err) => {
      console.error('[Socket.IO] General Error:', err);
    });

    currentSocketInstance.on('reconnect_attempt', (attemptNumber) => {
      console.log(`[Socket.IO] Reconnection attempt ${attemptNumber}`);
    });

    currentSocketInstance.on('reconnect', (attemptNumber) => {
      console.log(`[Socket.IO] Reconnected after ${attemptNumber} attempts`);
      const id = currentSocketInstance.id;
      if (id) {
        setSocketId(id);
        setSocketConnected(true);
        setIsSocketReady(true);
      }
    });

    currentSocketInstance.on('connectionConfirmed', (data) => {
      console.log('[Socket.IO] Connection confirmed by server:', data);
    });

    currentSocketInstance.on('auth_error', (error) => {
      console.error('[Socket.IO] Authentication error:', error);
      setSocketConnected(false);
      setSocketId(null);
      setRequestingSocketId(null);
      setProcessingResult(null);
      setIsSocketReady(false);
    });

    const handleProcessingComplete = (data: StockWeatherResponseDto) => {
      console.log('[SocketContext] processingComplete received:', data);
      setProcessingResult(data);
    };

    currentSocketInstance.on('processingComplete', handleProcessingComplete);

    return () => {
      if (connectionTimeoutRef.current) {
        clearTimeout(connectionTimeoutRef.current);
      }
      if (currentSocketInstance) {
        console.log('[Socket.IO] Cleaning up Socket.IO listeners.');
        currentSocketInstance.off('connect');
        currentSocketInstance.off('disconnect');
        currentSocketInstance.off('connect_error');
        currentSocketInstance.off('error');
        currentSocketInstance.off('reconnect_attempt');
        currentSocketInstance.off('reconnect');
        currentSocketInstance.off('connectionConfirmed');
        currentSocketInstance.off('auth_error');
        currentSocketInstance.off('processingComplete', handleProcessingComplete);
      }
    };
  }, []);

  useEffect(() => {
    if (requestingSocketId && socketId) {
      const isStaleRequest = !socket?.connected || socket.id !== requestingSocketId;
  
      if (isStaleRequest) {
        console.warn('[SocketContext] Detected stale requestingSocketId. Resetting requestingSocketId.');
        setRequestingSocketId(null);
      }
    }
  }, [socket, socketId, requestingSocketId]);

  return (
    <SocketContext.Provider
      value={{
        socket,
        socketId,
        socketConnected,
        requestingSocketId,
        setRequestingSocketId,
        processingResult,
        setProcessingResult,
        isSocketReady,
      }}
    >
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