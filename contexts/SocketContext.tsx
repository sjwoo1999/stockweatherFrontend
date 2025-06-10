// src/contexts/SocketContext.tsx

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { io, Socket } from 'socket.io-client';

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'https://stockweather-websocket-xxx.run.app';

type SocketContextType = {
  socket: Socket | null;
  socketConnected: boolean;
  socketId: string | null;
  requestingSocketId: string | null;
  setRequestingSocketId: (id: string | null) => void;
  processingResult: any;
  setProcessingResult: (result: any) => void;
};

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export const SocketProvider = ({ children }: { children: ReactNode }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [socketConnected, setSocketConnected] = useState(false);
  const [socketId, setSocketId] = useState<string | null>(null);
  const [requestingSocketId, setRequestingSocketId] = useState<string | null>(null);
  const [processingResult, setProcessingResult] = useState<any>(null);

  useEffect(() => {
    const newSocket = io(SOCKET_URL, {
      transports: ['websocket'],
    });

    setSocket(newSocket);

    newSocket.on('connect', () => {
      console.log('[Socket] Connected:', newSocket.id);
      setSocketConnected(true);
      setSocketId(newSocket.id);
    });

    newSocket.on('disconnect', (reason) => {
      console.warn('[Socket] Disconnected:', reason);
      setSocketConnected(false);
      setSocketId(null);
    });

    // reconnect 처리
    newSocket.io.on('reconnect', (attempt) => {
      console.log(`[Socket] Reconnected on attempt ${attempt}`);
      setSocketConnected(true);
      setSocketId(newSocket.id); // 새 ID 갱신
    });

    return () => {
      newSocket.disconnect();
    };
  }, []);

  return (
    <SocketContext.Provider
      value={{
        socket,
        socketConnected,
        socketId,
        requestingSocketId,
        setRequestingSocketId,
        processingResult,
        setProcessingResult,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) throw new Error('useSocket must be used within a SocketProvider');
  return context;
};