// stockweather-frontend/src/contexts/SocketContext.tsx

import React, { createContext, useContext, useEffect, useRef, useState, ReactNode, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';

import {
  StockWeatherResponseDto,
  AnalysisProgressData,
  ServerToClientEvents,
  ClientToServerEvents,
} from '../types/stock';

interface SocketContextType {
  socket: Socket<ServerToClientEvents, ClientToServerEvents> | null;
  socketId: string | null;
  socketConnected: boolean;
  analysisStatus: AnalysisProgressData | null;
  processingResult: StockWeatherResponseDto | null;
  requestingSocketId: string | null;
  setRequestingSocketId: (id: string | null) => void;
  clearProcessingResult: () => void;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [socket, setSocket] = useState<Socket<ServerToClientEvents, ClientToServerEvents> | null>(null);
  const [socketId, setSocketId] = useState<string | null>(null);
  const [socketConnected, setSocketConnected] = useState<boolean>(false);
  
  const [analysisStatus, setAnalysisStatus] = useState<AnalysisProgressData | null>(null);
  const [processingResult, setProcessingResult] = useState<StockWeatherResponseDto | null>(null);
  
  const [requestingSocketId, setRequestingSocketId] = useState<string | null>(null);

  const socketRef = useRef<Socket<ServerToClientEvents, ClientToServerEvents> | null>(null);
  const socketUrl = process.env.NEXT_PUBLIC_SOCKET_SERVER_URL || 'http://localhost:3000';

  const requestingSocketIdRef = useRef(requestingSocketId);
  useEffect(() => {
      requestingSocketIdRef.current = requestingSocketId;
  }, [requestingSocketId]);

  // 분석 결과 및 진행 상태를 초기화하는 함수
  const clearProcessingResult = useCallback(() => {
    setAnalysisStatus(null);
    setProcessingResult(null);
    setRequestingSocketId(null);
  }, []); // 의존성 배열이 비어 있으므로 함수는 한 번만 생성됩니다.

  useEffect(() => {
    if (typeof window === 'undefined') {
      console.log('Socket.IO: SSR 환경. 연결 시도 안함.');
      return;
    }

    const storedToken = localStorage.getItem('jwtToken');

    if (!storedToken) {
      console.log('Socket.IO: JWT 토큰 없음. 연결 시도 안함.');
      if (socketRef.current && socketRef.current.connected) {
        console.log('Socket.IO: 토큰이 없어 기존 연결을 끊습니다.');
        socketRef.current.disconnect();
      }
      socketRef.current = null;
      setSocket(null);
      setSocketConnected(false);
      setSocketId(null);
      return;
    }

    // ⭐ 수정된 부분: socketRef.current.auth?.token 접근 로직 개선 ⭐
    if (socketRef.current && socketRef.current.connected) {
      const currentAuth = socketRef.current.auth;
      // currentAuth가 존재하고, 객체이며, 'token' 속성을 가지고 있는지 확인
      if (currentAuth && typeof currentAuth === 'object' && 'token' in currentAuth && currentAuth.token === storedToken) {
        console.log('Socket.IO 인스턴스 이미 존재하고 연결됨 (재활용):', socketRef.current.id);
        setSocket(socketRef.current);
        setSocketConnected(true);
        setSocketId(socketRef.current.id);
        return;
      }
    }

    console.log('Socket.IO 인스턴스 생성 또는 재연결 시도 시작...');
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

    const currentSocketInstance = socketRef.current;

    currentSocketInstance.off('connect');
    currentSocketInstance.on('connect', () => {
        console.log('Socket.IO 연결 성공! ID:', currentSocketInstance.id);
        setSocketConnected(true);
        setSocketId(currentSocketInstance.id);
    });

    currentSocketInstance.off('disconnect');
    currentSocketInstance.on('disconnect', (reason) => {
        console.log('Socket.IO 연결 해제됨:', reason);
        setSocketConnected(false);
        setSocketId(null);
        clearProcessingResult();
    });

    currentSocketInstance.off('connect_error');
    const handleSocketError = (err: Error) => {
        console.error('Socket.IO 연결 또는 내부 오류:', err.message, err);
        setSocketConnected(false);
        setSocketId(null);
        clearProcessingResult();
    };
    currentSocketInstance.on('connect_error', handleSocketError);

    currentSocketInstance.off('error');
    currentSocketInstance.on('error', handleSocketError);

    currentSocketInstance.off('analysisProgress');
    currentSocketInstance.on('analysisProgress', (data: AnalysisProgressData) => {
        console.log('Received analysisProgress in SocketProvider:', data);
        if (data.socketId === requestingSocketIdRef.current) {
            setAnalysisStatus(data);
            setProcessingResult(null); 
        } else {
            console.log(`SocketProvider: Ignoring analysisProgress from non-matching socketId: ${data.socketId}, current requesting: ${requestingSocketIdRef.current}`);
        }
    });

    currentSocketInstance.off('processingComplete');
    currentSocketInstance.on('processingComplete', (data: StockWeatherResponseDto | { error: string, query?: string, socketId?: string }) => {
        console.log('Received processingComplete in SocketProvider:', data);
        if (data.socketId === requestingSocketIdRef.current) {
            if (data.error) {
                setProcessingResult({ ...data as StockWeatherResponseDto, error: data.error });
            } else {
                setProcessingResult(data as StockWeatherResponseDto);
            }
            setAnalysisStatus(null);
        } else {
            console.log(`SocketProvider: Ignoring processingComplete from non-matching socketId: ${data.socketId}, current requesting: ${requestingSocketIdRef.current}`);
        }
    });

    return () => {
      const currentSocket = socketRef.current;
      if (currentSocket) {
        console.log('Socket.IO SocketProvider cleanup: Removing listeners for:', currentSocket.id);
        currentSocket.off('connect');
        currentSocket.off('disconnect');
        currentSocket.off('connect_error');
        currentSocket.off('error');
        currentSocket.off('analysisProgress');
        currentSocket.off('processingComplete');
      }
    };
  }, [socketUrl, clearProcessingResult]);

  useEffect(() => {
    console.log('SocketProvider: requestingSocketId updated to', requestingSocketId);
  }, [requestingSocketId]);

  return (
    <SocketContext.Provider value={{
      socket,
      socketId,
      socketConnected,
      analysisStatus,
      processingResult,
      requestingSocketId,
      setRequestingSocketId,
      clearProcessingResult
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