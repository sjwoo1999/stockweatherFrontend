// stockweather-frontend/src/components/ProtectedRoute.tsx
import React from 'react';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const router = useRouter();
  const [isClient, setIsClient] = useState(false); // 클라이언트 측 렌더링 여부 확인

  useEffect(() => {
    setIsClient(true); // 컴포넌트가 클라이언트에서 마운트되었음을 표시
  }, []);

  // 클라이언트 측에서만 localStorage 접근 및 라우팅 처리
  useEffect(() => {
    if (isClient) { // isClient가 true일 때만 실행 (CSR 환경)
      const token = localStorage.getItem('jwtToken');
      if (!token) {
        console.log('No JWT token found. Redirecting to login.');
        router.replace('/login'); // 토큰이 없으면 로그인 페이지로 리다이렉트
      }
    }
  }, [isClient, router]); // isClient 또는 router 변경 시 실행

  // 클라이언트 측에서 토큰을 확인하고 유효할 때만 자식 컴포넌트를 렌더링
  // 초기에는 SSR이므로 token이 없을 수 있어 null을 반환하여 깜빡임 방지
  if (!isClient) {
    return null; // 클라이언트가 아닌 경우 (SSR) 렌더링하지 않음
  }

  const token = localStorage.getItem('jwtToken'); // 다시 한번 토큰 확인 (isClient가 true일 때)
  if (token) {
    return <>{children}</>;
  }

  // 토큰이 없으면 (이미 리다이렉트되었으므로) 아무것도 렌더링하지 않음
  return null;
};

export default ProtectedRoute;