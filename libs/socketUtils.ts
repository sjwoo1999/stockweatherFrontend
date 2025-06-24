import { Socket } from 'socket.io-client';

/**
 * 소켓 연결 상태를 체크하는 유틸리티 함수
 */
export const isSocketHealthy = (socket: Socket | null): boolean => {
  if (!socket) return false;
  return socket.connected && !!socket.id;
};

/**
 * 소켓 연결 대기를 위한 Promise 기반 함수
 */
export const waitForSocketConnection = (
  socket: Socket | null,
  timeoutMs: number = 15000
): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (!socket) {
      reject(new Error('소켓 인스턴스가 없습니다.'));
      return;
    }

    if (isSocketHealthy(socket)) {
      resolve();
      return;
    }

    const timeout = setTimeout(() => {
      reject(new Error('소켓 연결 시간이 초과되었습니다.'));
    }, timeoutMs);

    const checkConnection = () => {
      if (isSocketHealthy(socket)) {
        clearTimeout(timeout);
        resolve();
      }
    };

    // 연결 이벤트 리스너
    const onConnect = () => {
      checkConnection();
    };

    // 에러 이벤트 리스너
    const onError = (error: Error) => {
      clearTimeout(timeout);
      reject(error);
    };

    socket.on('connect', onConnect);
    socket.on('connect_error', onError);
    socket.on('error', onError);

    // 정리 함수
    return () => {
      clearTimeout(timeout);
      socket.off('connect', onConnect);
      socket.off('connect_error', onError);
      socket.off('error', onError);
    };
  });
};

/**
 * 소켓 ID 유효성 검증
 */
export const validateSocketId = (socketId: string | null): boolean => {
  return typeof socketId === 'string' && socketId.length > 0;
};

/**
 * 소켓 재연결 시도 횟수 제한
 */
export const createReconnectionManager = (maxAttempts: number = 5) => {
  let attemptCount = 0;
  let lastAttemptTime = 0;
  const minIntervalMs = 2000; // 최소 2초 간격

  return {
    canAttemptReconnection: (): boolean => {
      const now = Date.now();
      if (attemptCount >= maxAttempts) {
        return false;
      }
      if (now - lastAttemptTime < minIntervalMs) {
        return false;
      }
      return true;
    },
    recordAttempt: () => {
      attemptCount++;
      lastAttemptTime = Date.now();
    },
    reset: () => {
      attemptCount = 0;
      lastAttemptTime = 0;
    },
    getAttemptCount: () => attemptCount,
  };
};

/**
 * 소켓 이벤트 리스너 안전 등록/해제
 */
export const safeSocketListener = (
  socket: Socket | null,
  event: string,
  handler: (...args: any[]) => void
) => {
  if (!socket) return;

  // 기존 리스너 제거
  socket.off(event, handler);
  
  // 새 리스너 등록
  socket.on(event, handler);

  // 정리 함수 반환
  return () => {
    if (socket) {
      socket.off(event, handler);
    }
  };
}; 