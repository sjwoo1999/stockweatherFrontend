// stockweather-frontend/src/pages/_app.tsx

import React, { useEffect, createContext, useState, useRef } from 'react'; // useRef 추가
import { AppProps } from 'next/app';
import { useRouter } from 'next/router';
import ProtectedRoute from '../components/ProtectedRoute';
import io, { Socket } from 'socket.io-client';
import '../styles/globals.css';

import {
  Noto_Sans_KR,
  Black_Han_Sans,
  Plus_Jakarta_Sans,
  Public_Sans
} from 'next/font/google';

// 폰트 설정 (기존과 동일)
const notoSansKR = Noto_Sans_KR({
  subsets: ['latin'],
  weight: ['400', '700'],
  display: 'swap',
  variable: '--font-body',
});

const blackHanSans = Black_Han_Sans({
  subsets: ['latin'],
  weight: ['400'],
  display: 'swap',
  variable: '--font-accent',
});

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['400', '700'],
  display: 'swap',
  variable: '--font-heading',
});

const publicSans = Public_Sans({
  subsets: ['latin'],
  weight: ['400'],
  display: 'swap',
  variable: '--font-public-sans',
});

// --- Socket.IO 관련 타입 정의 (기존과 동일) ---
interface AnalysisProgressData {
  status: string;
  message: string;
  query: string;
  socketId: string;
}

interface StockWeatherResponseDto {
  stock: {
    name: string;
    weatherSummary: string;
    reportSummary: string;
    detailedAnalysis: string;
    investmentOpinion: { opinion: string; confidence: number };
    keywords: { text: string; sentiment: 'POSITIVE' | 'NEGATIVE' | 'NEUTRAL' }[];
    relatedStocks: { name: string; opinion: string; confidence: number }[];
  };
  articles: { title: string; url: string; summary: string; thumbnailUrl?: string }[];
  weatherIcon: 'sunny' | 'partly-cloudy' | 'cloudy' | 'rainy' | 'stormy' | 'unknown';
  disclaimer: string;
  socketId?: string;
}

interface ServerToClientEvents {
  analysisProgress: (data: AnalysisProgressData) => void;
  processingComplete: (data: StockWeatherResponseDto | { error: string, query?: string, socketId?: string }) => void;
}

interface ClientToServerEvents {
  // 클라이언트에서 백엔드로 보내는 이벤트가 있다면 여기에 정의
}
// --- Socket.IO 관련 타입 정의 끝 ---

// Socket Context 생성
interface SocketContextType {
  socket: Socket<ServerToClientEvents, ClientToServerEvents> | null;
  socketId: string | null;
  socketConnected: boolean;
}
export const SocketContext = createContext<SocketContextType>({
  socket: null,
  socketId: null,
  socketConnected: false,
});

// SocketProvider 컴포넌트
const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Context에 전달할 상태
  const [socketState, setSocketState] = useState<Socket<ServerToClientEvents, ClientToServerEvents> | null>(null);
  const [socketId, setSocketId] = useState<string | null>(null);
  const [socketConnected, setSocketConnected] = useState<boolean>(false);

  // 소켓 인스턴스를 useRef로 관리 (useEffect의 의존성에서 벗어나게 함)
  const socketRef = useRef<Socket<ServerToClientEvents, ClientToServerEvents> | null>(null);
  const socketUrl = process.env.NEXT_PUBLIC_SOCKET_SERVER_URL || 'http://localhost:3000'; // NEXT_PUBLIC_SOCKET_URL 대신 NEXT_PUBLIC_SOCKET_SERVER_URL 사용 권장 (기존 코드에 맞춰 수정)

  useEffect(() => {
    // 클라이언트 측에서만 실행되도록 보장
    if (typeof window === 'undefined') return;

    const token = localStorage.getItem('jwtToken');
    if (!token) {
      console.log('Socket.IO: JWT 토큰 없음. 연결 시도 안함.');
      // ProtectedRoute에서 로그인 리다이렉션을 처리할 것이므로 여기서 별도 리다이렉션은 필요 없음
      return;
    }

    // 이미 소켓 인스턴스가 Ref에 할당되어 있다면, 다시 생성하지 않습니다.
    // 이는 이펙트가 여러 번 실행되더라도 단 한 번만 소켓을 생성하도록 합니다.
    if (!socketRef.current) {
      console.log('Socket.IO 인스턴스 생성 시작...');
      const newSocket = io(socketUrl, {
        auth: { token: token },
        transports: ['websocket', 'polling'],
        forceNew: false, // 중요한 설정: 매번 강제로 새 연결을 만들지 않음
        autoConnect: false, // 수동으로 connect() 호출
      });

      socketRef.current = newSocket; // useRef에 인스턴스 저장
      setSocketState(newSocket); // Context에 제공하기 위해 상태에도 저장

      // 이벤트 리스너 등록
      newSocket.on('connect', () => {
        console.log('Socket.IO 연결 성공! ID:', newSocket.id);
        setSocketConnected(true);
        setSocketId(newSocket.id);
      });

      newSocket.on('disconnect', (reason) => {
        console.log('Socket.IO 연결 해제됨:', reason);
        setSocketConnected(false);
        setSocketId(null);
      });

      // connect_error와 error 이벤트를 동일하게 처리
      const handleSocketError = (err: Error) => {
        console.error('Socket.IO 연결 또는 내부 오류:', err.message);
        setSocketConnected(false); // 연결이 끊어진 상태로 표시
        // 여기서 socketRef.current = null; 또는 setSocketState(null); 등을 호출하지 마세요.
        // 그러면 useEffect가 다시 트리거되어 무한 루프를 일으킬 수 있습니다.
      };

      newSocket.on('connect_error', handleSocketError);
      newSocket.on('error', handleSocketError); // Engine.IO 레벨의 오류도 처리

      // 수동으로 연결 시도
      newSocket.connect();
    } else {
        console.log('Socket.IO 인스턴스 이미 존재. 상태 업데이트 확인:', socketRef.current.connected);
        // 이미 인스턴스가 있는데 연결이 끊겼다면 재연결 시도
        if (!socketRef.current.connected) {
            console.log('Socket.IO: 기존 인스턴스 연결 시도 중...');
            socketRef.current.connect();
        }
    }


    // 클린업 함수: 컴포넌트 언마운트 시 또는 토큰 변경 시 (재실행)
    return () => {
      const currentSocket = socketRef.current;
      if (currentSocket) {
        console.log('Socket.IO 연결 해제 및 리스너 제거 (cleanup)');
        currentSocket.off('connect');
        currentSocket.off('disconnect');
        currentSocket.off('connect_error');
        currentSocket.off('error');
        // socketRef.current를 null로 만들고, socketState도 null로 만듭니다.
        // 이는 컴포넌트가 완전히 언마운트될 때 (앱 종료 등) 한 번만 발생합니다.
        // 중요한 점: `forceNew: false` 덕분에 실제 소켓 객체는 앱이 다시 마운트될 때 재활용될 수 있습니다.
        if (currentSocket.connected) {
          currentSocket.disconnect(); // 연결이 되어 있다면 끊기
        }
        socketRef.current = null; // Ref 초기화
        setSocketState(null);     // 상태 초기화
        setSocketId(null);
        setSocketConnected(false);
      }
    };
  }, [socketUrl]); // 의존성 배열에서 `socket`을 제거하고 `socketUrl`만 남김 (URL이 변경될 때만 재실행)

  // Context를 통해 소켓 인스턴스, ID, 연결 상태를 하위 컴포넌트에 제공
  return (
    <SocketContext.Provider value={{ socket: socketState, socketId, socketConnected }}>
      {children}
    </SocketContext.Provider>
  );
};

// 메인 앱 컴포넌트
function MyApp({ Component, pageProps }: AppProps) {
  const router = useRouter();

  const publicPaths = ['/login', '/login-success'];
  const isPublicPath = publicPaths.includes(router.pathname);

  return (
    <main className={`${notoSansKR.variable} ${blackHanSans.variable} ${plusJakartaSans.variable} ${publicSans.variable}
                       font-body bg-brand-light text-text-default min-h-screen`}>
      <SocketProvider>
        {isPublicPath ? (
          <Component {...pageProps} />
        ) : (
          <ProtectedRoute>
            <Component {...pageProps} />
          </ProtectedRoute>
        )}
      </SocketProvider>
    </main>
  );
}

export default MyApp;