// stockweather-frontend/src/components/ProtectedRoute.tsx
import { useRouter } from 'next/router';
import { useEffect, useState, ReactNode } from 'react';

interface ProtectedRouteProps {
  children: ReactNode;
}

// ⭐ publicPaths를 컴포넌트 외부로 이동하여 모듈 스코프 상수로 만듭니다. ⭐
// 이렇게 하면 publicPaths는 한 번만 정의되고, 렌더링 시마다 재생성되지 않음을 확실히 보장합니다.
const PUBLIC_PATHS = ['/', '/login', '/login-success'];

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (typeof window === 'undefined') {
      setLoading(false);
      return;
    }

    const token = localStorage.getItem('jwtToken');
    console.log('ProtectedRoute: Checking for token. Current token:', token ? '존재함' : '없음', 'on path:', router.pathname);

    // ⭐ PUBLIC_PATHS를 사용합니다. ⭐
    const isProtectedPath = !PUBLIC_PATHS.includes(router.pathname);

    if (isProtectedPath) {
      if (!token) {
        console.log('ProtectedRoute: 토큰 없음. 보호된 경로 접근 시도. 로그인 페이지로 리다이렉트:', router.pathname);
        router.replace('/login');
        setLoading(true);
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
  }, [router]); // ⭐ PUBLIC_PATHS는 이제 의존성 배열에 포함할 필요가 없습니다. ⭐

  if (loading) {
    return null;
  }

  return <>{children}</>;
};

export default ProtectedRoute;