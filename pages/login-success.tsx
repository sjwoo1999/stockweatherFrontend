// stockweather-frontend/src/pages/login-success.tsx
import React, { useEffect } from 'react';
import { useRouter } from 'next/router'; // Next.js useRouter 훅

function LoginSuccessPage() {
  const router = useRouter();

  useEffect(() => {
    // Next.js 라우터의 쿼리 파라미터가 준비되었는지 확인
    if (!router.isReady) return;

    const { token } = router.query; // URL 쿼리 파라미터에서 'token' 값 추출

    if (token && typeof token === 'string') {
      // 토큰이 존재하고 문자열 타입인 경우
      localStorage.setItem('jwtToken', token); // JWT 토큰을 로컬 스토리지에 저장
      console.log('JWT Token received and stored.'); // 실제 토큰 값은 보안상 로그에 직접 출력하지 않음
      router.replace('/dashboard'); // 토큰 저장 후 대시보드 페이지로 이동 (replace로 히스토리 남기지 않음)
    } else {
      console.error('URL에 토큰이 없거나 형식이 올바르지 않습니다. 로그인 실패 처리.');
      router.replace('/login'); // 토큰이 없으면 로그인 페이지로 리다이렉트
    }
  }, [router]); // router 객체가 변경될 때마다 useEffect 실행

  return (
    <div style={{ padding: '20px', textAlign: 'center' }}>
      <h2>로그인 처리 중...</h2>
      <p>인증 정보를 확인하고 있습니다. 잠시만 기다려 주세요.</p>
    </div>
  );
}

export default LoginSuccessPage;