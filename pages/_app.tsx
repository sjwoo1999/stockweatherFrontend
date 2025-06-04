// stockweather-frontend/src/pages/_app.tsx

import React from 'react'; // useEffect, createContext, useState, useRef 임포트 제거
import { AppProps } from 'next/app';
import { useRouter } from 'next/router';
import ProtectedRoute from '../components/ProtectedRoute';
import { SocketProvider } from '../contexts/SocketContext'; // 수정된 경로에서 임포트
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