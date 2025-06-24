import React, { useEffect, useState } from 'react';
import { useSocket } from '../contexts/SocketContext';
import { isSocketHealthy } from '../libs/socketUtils';

interface SocketStatusMonitorProps {
  showStatus?: boolean; // 상태 표시 여부 (개발 모드에서만 true)
}

const SocketStatusMonitor: React.FC<SocketStatusMonitorProps> = ({ 
  showStatus = process.env.NODE_ENV === 'development' 
}) => {
  const { socket, socketConnected, socketId, isSocketReady } = useSocket();
  const [lastHealthCheck, setLastHealthCheck] = useState<number>(Date.now());
  const [connectionQuality, setConnectionQuality] = useState<'good' | 'warning' | 'poor'>('good');

  useEffect(() => {
    const checkConnectionHealth = () => {
      const now = Date.now();
      setLastHealthCheck(now);

      if (!socket) {
        setConnectionQuality('poor');
        return;
      }

      const isHealthy = isSocketHealthy(socket);
      if (isHealthy && socketConnected && isSocketReady) {
        setConnectionQuality('good');
      } else if (socketConnected && !isSocketReady) {
        setConnectionQuality('warning');
      } else {
        setConnectionQuality('poor');
      }
    };

    // 초기 체크
    checkConnectionHealth();

    // 주기적 체크 (5초마다)
    const interval = setInterval(checkConnectionHealth, 5000);

    return () => clearInterval(interval);
  }, [socket, socketConnected, isSocketReady]);

  if (!showStatus) return null;

  const getStatusColor = () => {
    switch (connectionQuality) {
      case 'good':
        return 'text-green-500';
      case 'warning':
        return 'text-yellow-500';
      case 'poor':
        return 'text-red-500';
      default:
        return 'text-gray-500';
    }
  };

  const getStatusText = () => {
    switch (connectionQuality) {
      case 'good':
        return '연결 양호';
      case 'warning':
        return '연결 불안정';
      case 'poor':
        return '연결 끊김';
      default:
        return '상태 확인 중';
    }
  };

  const getConnectionDetails = () => {
    if (!socket) return '소켓 없음';
    if (!socketConnected) return '연결 안됨';
    if (!isSocketReady) return '준비 안됨';
    return '정상 연결';
  };

  return (
    <div className="fixed bottom-4 right-4 bg-white rounded-lg shadow-lg p-3 border border-gray-200 z-50">
      <div className="flex items-center space-x-2">
        <div className={`w-2 h-2 rounded-full ${getStatusColor()}`}></div>
        <span className="text-xs text-gray-600">소켓: {getStatusText()}</span>
      </div>
      <div className="text-xs text-gray-400 mt-1">
        상태: {getConnectionDetails()}
      </div>
      <div className="text-xs text-gray-400">
        ID: {socketId ? `${socketId.slice(0, 8)}...` : '없음'}
      </div>
      <div className="text-xs text-gray-400">
        마지막 체크: {new Date(lastHealthCheck).toLocaleTimeString()}
      </div>
    </div>
  );
};

export default SocketStatusMonitor; 