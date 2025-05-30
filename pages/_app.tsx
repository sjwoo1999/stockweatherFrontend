// stockweather-frontend/src/pages/_app.tsx
import React from 'react';
import { AppProps } from 'next/app';
import { useRouter } from 'next/router';
import ProtectedRoute from '../components/ProtectedRoute';

import {
  Noto_Sans_KR,
  Black_Han_Sans,
  Plus_Jakarta_Sans,
  Public_Sans
} from 'next/font/google';

import '../styles/globals.css';

// 1. Noto Sans KR (Pretendard 대체)
const notoSansKR = Noto_Sans_KR({
  // ✨ subsets: ['korean'] 제거, 'latin'만 유지 또는 비워둠 ✨
  subsets: ['latin'],
  weight: ['400', '700'],
  display: 'swap',
  variable: '--font-body',
});

// 2. Black Han Sans (Gmarket Sans 대체)
const blackHanSans = Black_Han_Sans({
  // ✨ subsets: ['korean'] 제거, 'latin'만 유지 ✨
  subsets: ['latin'], // 에러 메시지에 'Available subsets: latin'으로 명시되어 있음
  weight: ['400'],
  display: 'swap',
  variable: '--font-accent',
});

// 3. Plus Jakarta Sans (기존 유지)
const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['400', '700'],
  display: 'swap',
  variable: '--font-heading',
});

// 4. Public Sans (기존 유지, 사용하지 않는다면 제거 가능)
const publicSans = Public_Sans({
  subsets: ['latin'],
  weight: ['400'],
  display: 'swap',
  variable: '--font-public-sans',
});

function MyApp({ Component, pageProps }: AppProps) {
  const router = useRouter();

  const publicPaths = ['/login', '/login-success'];
  const isPublicPath = publicPaths.includes(router.pathname);

  return (
    <main className={`${notoSansKR.variable} ${blackHanSans.variable} ${plusJakartaSans.variable} ${publicSans.variable}
                       font-body bg-brand-light text-text-default min-h-screen`}>
      {isPublicPath ? (
        <Component {...pageProps} />
      ) : (
        <ProtectedRoute>
          <Component {...pageProps} />
        </ProtectedRoute>
      )}
    </main>
  );
}

export default MyApp;