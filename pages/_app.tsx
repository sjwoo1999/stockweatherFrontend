// stockweather-frontend/src/pages/_app.tsx
import type { AppProps } from 'next/app';
import { useRouter } from 'next/router';
import ProtectedRoute from '../components/ProtectedRoute'; // ProtectedRoute 임포트

// 보호할 경로들을 정의합니다.
// 여기에 추가된 경로는 ProtectedRoute에 의해 로그인 여부가 체크됩니다.
// 'index.tsx'가 `/` 경로를 나타내므로, 로그인되지 않은 사용자가 '/'에 접근 시 '/login'으로 리다이렉트하려면
// protectedRoutes에 '/'도 포함해야 합니다.
const protectedRoutes = ['/dashboard', '/']; // 예시: 대시보드와 루트 페이지만 보호 (필요에 따라 추가/삭제)

function MyApp({ Component, pageProps }: AppProps) {
  const router = useRouter();
  // 현재 라우터 경로가 보호된 경로 목록에 포함되어 있는지 확인
  const isProtectedRoute = protectedRoutes.includes(router.pathname);

  return (
    <>
      {isProtectedRoute ? (
        // 보호된 경로인 경우 ProtectedRoute로 래핑
        <ProtectedRoute>
          <Component {...pageProps} />
        </ProtectedRoute>
      ) : (
        // 보호되지 않은 경로인 경우 그대로 렌더링
        <Component {...pageProps} />
      )}
    </>
  );
}

export default MyApp;