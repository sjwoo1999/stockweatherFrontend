// stockweather-frontend/src/components/ProtectedRoute.tsx
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const router = useRouter();
  const [loading, setLoading] = useState(true); // 로딩 상태: 토큰 확인 중일 때 true
  const [isAuthenticated, setIsAuthenticated] = useState(false); // 인증 상태: 토큰이 유효하면 true

  useEffect(() => {
    // 이 useEffect는 컴포넌트가 클라이언트 측에서 마운트될 때 한 번 실행됩니다.
    // (Next.js의 SSR 특성상 localStorage는 window 객체처럼 클라이언트에서만 접근 가능)
    const checkAuth = () => {
      let token: string | null = null;
      try {
        // localStorage는 클라이언트 환경에서만 접근 가능하므로, window 객체 확인.
        // 하지만 Next.js의 useEffect는 클라이언트에서만 실행되므로, 이 조건은 일반적으로 필요 없음.
        // 다만, 안전하게 `window`가 정의되었는지 확인하는 것은 좋은 습관.
        if (typeof window !== 'undefined') {
          token = localStorage.getItem('jwtToken');
        }
      } catch (e) {
        console.error('ProtectedRoute: Error accessing localStorage:', e);
        // localStorage 접근 실패 시, 인증되지 않은 것으로 간주
        setIsAuthenticated(false);
        setLoading(false);
        router.replace('/login');
        return;
      }

      console.log('ProtectedRoute: Checking for token. Current token:', token); // ★ 4. ProtectedRoute가 읽은 토큰 값 확인

      if (token) {
        // TODO: 실제 프로젝트에서는 여기서 토큰 유효성 (만료 여부 등)을 백엔드에 요청하여 검증하는 로직이 추가되어야 합니다.
        // 현재는 토큰 존재 여부만으로 인증된 것으로 간주합니다.
        setIsAuthenticated(true);
      } else {
        console.log('ProtectedRoute: No JWT token found. Redirecting to login.'); // ★ 5. 토큰이 없을 때 이 로그가 찍힘
        setIsAuthenticated(false); // 인증 실패
        router.replace('/login'); // 로그인 페이지로 리다이렉트
      }
      setLoading(false); // 토큰 확인이 완료되면 로딩 상태 해제
    };

    // router.isReady는 Next.js 라우터의 쿼리 파라미터 등이 준비되었음을 의미합니다.
    // 여기서는 localStorage 접근이 주 목적이지만, Next.js의 하이드레이션 문제 방지를 위해
    // router가 준비될 때까지 기다리는 것이 더 견고합니다.
    if (router.isReady) {
      checkAuth();
    } else {
      setLoading(true); // router가 준비되지 않은 상태에서는 계속 로딩 상태 유지
    }

  }, [router]); // router 객체에 의존성을 두어 라우터 변경 시 재실행 (거의 없음)

  // 로딩 중일 때는 로딩 UI를 보여줍니다.
  if (loading) {
    return (
      <div style={{ padding: '20px', textAlign: 'center', minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
        <h2>인증 확인 중...</h2>
        <p>잠시만 기다려 주세요.</p>
        {/* 선택적으로 로딩 스피너 등을 여기에 추가할 수 있습니다 */}
      </div>
    );
  }

  // 인증되지 않았다면 (이미 /login으로 리다이렉트되었거나 리다이렉트될 예정이므로) 아무것도 렌더링하지 않습니다.
  if (!isAuthenticated) {
    return null;
  }

  // 인증이 완료되었고 유효하다면, 자식 컴포넌트 (보호된 페이지의 내용)를 렌더링합니다.
  return <>{children}</>;
};

export default ProtectedRoute;