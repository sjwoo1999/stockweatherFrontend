// 예시: types/global.d.ts
import { Socket } from 'socket.io-client';

declare global {
  interface Window {
    socketInstance?: Socket;
  }
}