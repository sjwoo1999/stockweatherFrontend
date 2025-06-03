// stockweather-frontend/src/pages/loading.tsx
import { useEffect, useState, useRef, useCallback } from 'react';
import { useRouter } from 'next/router';
import Image from 'next/image';
import io, { Socket } from 'socket.io-client';
import axios from 'axios';
import Debug from 'debug';

const log = Debug('stockweather:loading');

const BACKEND_URL = process.env.NEXT_PUBLIC_SOCKET_SERVER_URL || 'http://localhost:3000';

let globalSocketInstance: Socket | null = null;

const getSocketInstance = (): Socket => {
  if (typeof window === 'undefined') {
    throw new Error("Socket.IO client is only available on the client side (browser).");
  }

  if (!globalSocketInstance || !globalSocketInstance.connected) {
    log(`[Socket] Creating new global socket instance, connecting to: ${BACKEND_URL}`);
    globalSocketInstance = io(BACKEND_URL, {
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
      timeout: 20000,
      withCredentials: true,
      transports: ['websocket', 'polling'],
    });

    globalSocketInstance.on('connect', () => {
      log('[Socket] 전역 소켓: 연결됨', globalSocketInstance!.id);
    });

    globalSocketInstance.on('disconnect', (reason) => {
      log('[Socket] 전역 소켓: 연결 해제됨', reason);
      if (reason === 'io server disconnect') {
        log('[Socket] 서버 요청으로 연결 해제. 다시 연결 시도...');
        globalSocketInstance!.connect();
      }
    });

    globalSocketInstance.on('connect_error', (err) => {
      log('[Socket] 전역 소켓: 연결 오류', err);
    });
  }
  return globalSocketInstance;
};

export default function LoadingPage() {
  const router = useRouter();
  const [loadingText, setLoadingText] = useState('');
  const [error, setError] = useState<string | null>(null);
  const searchInitiated = useRef(false);
  const socket = useRef<Socket | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && !socket.current) {
      socket.current = getSocketInstance();
      log('[LoadingPage] Socket instance initialized on mount.');
    }
  }, []);

  const getAuthToken = useCallback((): string | null => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('jwtToken');
    }
    return null;
  }, []);

  const sendSearchRequest = useCallback(async (stockQuery: string, currentSocketId: string) => {
    if (!socket.current) {
      log('[LoadingPage] Socket is not initialized when attempting to send search request.');
      setError('네트워크 연결 문제 또는 초기화 오류. 잠시 후 다시 시도해주세요.');
      setTimeout(() => router.replace('/dashboard'), 3000);
      return;
    }

    log(`[LoadingPage] Sending search request for '${stockQuery}' with socket ID: ${currentSocketId}`);
    const token = getAuthToken();

    if (!token) {
      setError('인증 토큰이 없습니다. 다시 로그인해주세요.');
      log('[LoadingPage] No auth token found. Redirecting to login.');
      searchInitiated.current = false;
      setTimeout(() => router.replace('/login'), 3000);
      return;
    }

    try {
      await axios.post(`${BACKEND_URL}/api/search`, {
        query: stockQuery,
        socketId: currentSocketId,
      }, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      log('[LoadingPage] Search request sent successfully to backend API with token.');
    } catch (axiosError: any) {
      log('[LoadingPage] Error sending search request to backend:', axiosError);
      if (axiosError.response) {
        if (axiosError.response.status === 401) {
          setError('인증에 실패했습니다. 다시 로그인해주세요.');
          log('[LoadingPage] Authentication failed (401). Redirecting to login.');
          setTimeout(() => router.replace('/login'), 3000);
        } else if (axiosError.response.status === 404) {
          setError('서버 API 경로를 찾을 수 없습니다. 백엔드 설정을 확인해주세요.');
          log('[LoadingPage] API path not found (404). Check backend configuration. (Hint: /api/search vs /search)');
          setTimeout(() => router.replace('/dashboard'), 3000);
        } else {
          setError(`검색 요청 실패: ${axiosError.response.status} ${axiosError.response.data?.message || axiosError.message}`);
          setTimeout(() => router.replace('/dashboard'), 3000);
        }
      } else if (axiosError.request) {
        setError('서버 응답이 없습니다. 서버가 실행 중인지 확인해주세요.');
        log('[LoadingPage] No response from server. Check if backend is running.');
        setTimeout(() => router.replace('/dashboard'), 3000);
      } else {
        setError(`알 수 없는 오류가 발생했습니다: ${axiosError.message}`);
        setTimeout(() => router.replace('/dashboard'), 3000);
      }
      searchInitiated.current = false;
    }
  }, [router, getAuthToken]);

  const handleConnect = useCallback(() => {
    if (!socket.current) {
      log('[LoadingPage] Component-specific socket handler - Socket is null on connect.');
      return; // socket.current가 null인 경우 조기 종료
    }

    log('[LoadingPage] Component-specific socket handler - Connected! ID:', socket.current.id);

    // searchInitiated.current는 이미 요청이 시작된 경우 중복 방지
    if (!searchInitiated.current) {
      const stockQuery = router.query.query;

      if (stockQuery && typeof stockQuery === 'string') {
        // ✨ 이 부분을 수정합니다. socket.current.id가 있는지 확인합니다. ✨
        if (socket.current.id) { // socket.current.id가 undefined가 아닌지 확인
          sendSearchRequest(stockQuery, socket.current.id);
          searchInitiated.current = true;
          log('[LoadingPage] searchInitiated.current set to TRUE. Search request sent.');
        } else {
          log('[LoadingPage] handleConnect: Socket ID is not yet available. Waiting or retrying...');
          // 여기에 socket.current.id가 나중에 할당될 때까지 기다리거나 재시도하는 로직을 추가할 수 있습니다.
          // 현재는 바로 에러 처리 후 대시보드로 리다이렉트되도록 합니다.
          setError('소켓 ID를 얻지 못했습니다. 잠시 후 다시 시도해주세요.');
          setTimeout(() => router.replace('/dashboard?error=no_socket_id'), 3000);
        }
      } else {
        log('[LoadingPage] handleConnect: No valid stockQuery found. Cannot send request.');
        setError('유효한 검색어가 제공되지 않았습니다.');
        setTimeout(() => router.replace('/dashboard?error=no_query'), 3000);
      }
    }
  }, [socket, router.query.query, sendSearchRequest, router]);

  const handleProcessingComplete = useCallback((data: any) => {
    log('processingComplete event received. Raw data:', data);
    if (data && typeof data === 'object' && data.stock && data.stock.name && data.timestamp) {
      log('Valid data format received. Attempting to save to localStorage...');
      try {
        const dataToStore = JSON.stringify(data);
        // debugger; // ✨ 이 debugger는 이제 주석 처리 또는 삭제합니다 ✨
        localStorage.setItem('stockWeatherData', dataToStore);
        log('Data saved to localStorage. Saved string length:', dataToStore.length);

        // 로컬 스토리지에 데이터가 제대로 저장되었는지 한 번 더 확인합니다.
        const verifyStoredData = localStorage.getItem('stockWeatherData');
        log('Verifying localStorage.getItem after set:', verifyStoredData ? 'Data is present.' : 'Data is NOT present.');

        if (verifyStoredData) {
          log('Data saved to localStorage. Redirecting to stock-result page...');
          searchInitiated.current = false;
          // ✨ 중요: 여기에 아주 짧은 딜레이를 줍니다. ✨
          setTimeout(() => {
            router.replace('/stock-result');
          }, 50); // 50ms 정도의 짧은 딜레이
        } else {
          setError('데이터 저장에 실패했습니다. 잠시 후 다시 시도해주세요.');
          searchInitiated.current = false;
          setTimeout(() => router.replace('/dashboard?error=save_failed_verify'), 3000);
        }

      } catch (e) {
        log('Failed to save data to localStorage or redirect:', e);
        setError('데이터 저장 또는 페이지 이동 중 오류가 발생했습니다.');
        searchInitiated.current = false;
        setTimeout(() => router.replace('/dashboard?error=save_failed'), 3000);
      }
    } else if (data && data.error) {
      log('[LoadingPage] Backend reported an error:', data.error);
      setError(`분석 실패: ${data.error}`);
      searchInitiated.current = false;
      setTimeout(() => router.replace('/dashboard?error=backend_error'), 3000);
    } else {
      log('[LoadingPage] Invalid or incomplete data format received from backend:', data);
      setError('유효한 분석 결과를 받지 못했습니다. 데이터 형식을 확인해주세요.');
      searchInitiated.current = false;
      setTimeout(() => router.replace('/dashboard?error=invalid_data'), 3000);
    }
  }, [router]);

  const handleConnectError = useCallback((err: any) => {
    log('[LoadingPage] Socket.IO connection error:', err);
    setError('WebSocket 서버 연결에 실패했습니다. 백엔드 서버를 확인해주세요.');
    searchInitiated.current = false;
    setTimeout(() => router.replace('/dashboard?error=socket_connect_failed'), 3000);
  }, [router]);

  const handleDisconnect = useCallback((reason: any) => {
    log('[LoadingPage] WebSocket server disconnected:', reason);
  }, []);

  useEffect(() => {
    if (!router.isReady || !socket.current) {
      log('[LoadingPage] router not ready or socket not initialized.');
      return;
    }

    const stockQuery = router.query.query;

    log('[LoadingPage] useEffect executed. router.isReady:', router.isReady, 'raw router.query:', router.query, 'parsed stockQuery:', stockQuery);

    if (!stockQuery || typeof stockQuery !== 'string' || stockQuery.trim() === '') {
      log('[LoadingPage] No valid query string provided from URL. Redirecting to dashboard.');
      setError('검색어가 제공되지 않았습니다. 잠시 후 대시보시도로 돌아갑니다.');
      setTimeout(() => {
        router.replace('/dashboard?error=no_query');
      }, 3000);
      return;
    }

    setLoadingText(`'${stockQuery}'에 대한 정보를 찾고 있어요...`);

    // 기존 리스너 제거 (중복 방지)
    socket.current.off('connect', handleConnect);
    socket.current.off('processingComplete', handleProcessingComplete);
    socket.current.off('connect_error', handleConnectError);
    socket.current.off('disconnect', handleDisconnect);

    // 새 리스너 등록
    socket.current.on('connect', handleConnect);
    socket.current.on('processingComplete', handleProcessingComplete);
    socket.current.on('connect_error', handleConnectError);
    socket.current.on('disconnect', handleDisconnect);

    if (socket.current.connected) {
      if (!searchInitiated.current) {
        log('[LoadingPage] Socket already connected. Initiating search request immediately.');
        sendSearchRequest(stockQuery, socket.current.id);
        searchInitiated.current = true;
      } else {
        log('[LoadingPage] Search request already initiated. Avoiding duplicate.');
      }
    } else {
      log('[LoadingPage] Socket not connected yet. Waiting for connection before sending request.');
    }

    return () => {
      log('[LoadingPage] Component unmount cleanup initiated. Removing all socket listeners.');
      if (socket.current) {
        socket.current.off('connect', handleConnect);
        socket.current.off('processingComplete', handleProcessingComplete);
        socket.current.off('connect_error', handleConnectError);
        socket.current.off('disconnect', handleDisconnect);
      }
    };
  }, [
    router.isReady,
    router.query.query,
    socket.current,
    sendSearchRequest,
    handleConnect,
    handleProcessingComplete,
    handleConnectError,
    handleDisconnect,
    router,
  ]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white p-4">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">정보를 분석 중입니다...</h1>
        <div className="relative w-24 h-24 mx-auto mb-6">
          <Image
            src="/loading-spinner.gif"
            alt="Loading Spinner"
            fill
            className="object-contain"
            unoptimized
          />
        </div>
        <p className="text-xl text-gray-300 mb-2">{loadingText}</p>
        {error && <p className="text-red-500 mt-4 text-lg animate-pulse">{error}</p>}
        {error && (
          <button
            onClick={() => router.replace('/dashboard')}
            className="mt-6 bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
          >
            대시보드로 돌아가기
          </button>
        )}
      </div>
    </div>
  );
}