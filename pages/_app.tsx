// stockweather-frontend/src/pages/_app.tsx
import type { AppProps } from 'next/app';
import ProtectedRoute from '../components/ProtectedRoute';

// 보호되어야 하는 경로 리스트
const protectedRoutes = ['/dashboard', '/profile', /* 여기에 보호하고 싶은 다른 경로 추가 */];
// login-success는 JWT 토큰을 받는 페이지이므로 보호 대상에서 제외

function MyApp({ Component, pageProps, router }: AppProps) {
  // 현재 경로가 보호된 경로인지 확인
  const isProtectedRoute = protectedRoutes.includes(router.pathname);

  return (
    <>
      {isProtectedRoute ? (
        <ProtectedRoute>
          <Component {...pageProps} />
        </ProtectedRoute>
      ) : (
        <Component {...pageProps} />
      )}
    </>
  );
}

export default MyApp;