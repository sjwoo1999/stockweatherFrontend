// stockweather-frontend/src/components/ProtectedRoute.tsx
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import React from 'react';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const router = useRouter();
  const [isClient, setIsClient] = useState(false); // 클라이언트 측 렌더링 확인

  useEffect(() => {
    setIsClient(true); // 컴포넌트가 클라이언트에서 마운트되었음을 표시
  }, []);

  useEffect(() => {
    if (!isClient) {
      // 서버 측 렌더링 시에는 localStorage에 접근 불가
      return;
    }

    const token = localStorage.getItem('jwtToken');
    console.log('ProtectedRoute: Checking for token. Current token:', token ? token : '없음');

    // 특정 경로에서만 보호 로직을 적용
    const publicPaths = ['/', '/login', '/login-success', '/api']; // 공개 경로 목록

    // 현재 경로가 보호되어야 하는 경로인지 확인
    const isProtectedPath = !publicPaths.includes(router.pathname) && !router.pathname.startsWith('/api');

    if (isProtectedPath) {
      if (!token) {
        // 토큰이 없으면 로그인 페이지로 리다이렉트
        console.log('ProtectedRoute: 토큰 없음. 로그인 페이지로 리다이렉트:', router.pathname);
        router.replace('/login');
      }
      // 토큰이 있으면 그대로 자식 컴포넌트 렌더링 (이상이 없으므로 아무것도 하지 않음)
    } else {
      // 공개 경로이지만 토큰이 있고, 현재 경로가 login 또는 login-success인 경우 대시보드로 리다이렉트
      // 이 부분이 "로그아웃 -> 로그인 페이지 -> 대시보드" 흐름의 원인이 될 수 있습니다.
      // 즉, 로그아웃 시 토큰이 제대로 지워지지 않았다면, login 페이지에서도 바로 대시보드로 갑니다.
      if (token && (router.pathname === '/login' || router.pathname === '/login-success')) {
        console.log('ProtectedRoute: 공개 경로이나 토큰 존재. 대시보드로 리다이렉트:', router.pathname);
        router.replace('/dashboard');
      }
    }
  }, [router, isClient]); // router와 isClient 변화에 반응

  // 클라이언트 측이 아니거나, 아직 토큰 검증 중이면 null 반환하여 깜빡임 방지
  // 또는 로딩 스피너 등을 표시할 수 있습니다.
  if (!isClient) {
    return null; // SSR 시에는 children을 렌더링하지 않음
  }

  // 보호된 경로이고 토큰이 없으면 리다이렉트 중이므로 children을 렌더링하지 않음
  const token = localStorage.getItem('jwtToken');
  const publicPaths = ['/', '/login', '/login-success', '/api'];
  const isProtectedPath = !publicPaths.includes(router.pathname) && !router.pathname.startsWith('/api');
  const isRedirecting = (isProtectedPath && !token) || (token && (router.pathname === '/login' || router.pathname === '/login-success'));

  if (isRedirecting) {
    return null; // 리다이렉트 중에는 아무것도 렌더링하지 않음
  }

  return <>{children}</>;
};

export default ProtectedRoute;