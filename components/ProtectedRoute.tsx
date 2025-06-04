// stockweather-frontend/src/components/ProtectedRoute.tsx
import { useRouter } from 'next/router';
import { useEffect, useState, ReactNode } from 'react';

interface ProtectedRouteProps {
  children: ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  const publicPaths = ['/', '/login', '/login-success'];

  useEffect(() => {
    if (typeof window === 'undefined') {
      setLoading(false);
      return;
    }

    // 🔴 token을 useEffect 내부에서 직접 가져와 사용
    const token = localStorage.getItem('jwtToken');
    console.log('ProtectedRoute: Checking for token. Current token:', token ? '존재함' : '없음', 'on path:', router.pathname);

    const isProtectedPath = !publicPaths.includes(router.pathname);

    if (isProtectedPath) {
      if (!token) {
        console.log('ProtectedRoute: 토큰 없음. 보호된 경로 접근 시도. 로그인 페이지로 리다이렉트:', router.pathname);
        router.replace('/login');
        setLoading(true); // 리다이렉트 중이므로 로딩 상태 유지
      } else {
        setLoading(false);
      }
    } else {
      if (token && (router.pathname === '/login' || router.pathname === '/login-success')) {
        console.log('ProtectedRoute: 공개 경로이나 토큰 존재. 대시보드로 리다이렉트:', router.pathname);
        router.replace('/dashboard');
        setLoading(true);
      } else {
        setLoading(false);
      }
    }
  }, [router]); // 🔴 의존성 배열에서 'token' 제거! 'router'만 남김.

  if (loading) {
    return null;
  }

  return <>{children}</>;
};

export default ProtectedRoute;