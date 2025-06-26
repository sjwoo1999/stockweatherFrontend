// stockweather-frontend/src/pages/login-success.tsx
import React, { useEffect } from 'react';
import { useRouter } from 'next/router';
import { setCookie } from '../utils/cookieUtils';

function LoginSuccessPage() {
  const router = useRouter();

  useEffect(() => {
    if (!router.isReady) {
      // console.log('LoginSuccess: Router not ready yet, waiting...');
      return;
    }

    const { token } = router.query;

    // console.log('LoginSuccess: router.query.token received:', token);
    // console.log('LoginSuccess: typeof token:', typeof token);

    if (token && typeof token === 'string') {
      try {
        // 쿠키에 JWT 토큰 저장 (7일간 유효)
        setCookie('jwtToken', token, 7);
        // console.log('LoginSuccess: JWT Token stored in cookie.');
        // console.log('LoginSuccess: Verifying cookie AFTER set:', document.cookie);

        // setTimeout 제거, 바로 리다이렉트
        router.replace('/dashboard'); 

      } catch (_e) {
        // console.error('LoginSuccess: Error setting cookie:', e);
        router.replace('/login');
      }
    } else {
      // console.error('LoginSuccess: URL에 토큰이 없거나 형식이 올바르지 않습니다. 로그인 실패 처리.');
      router.replace('/login');
    }
  }, [router]);

  return (
    <div style={{ padding: '20px', textAlign: 'center', minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
      <h2>로그인 처리 중...</h2>
      <p>인증 정보를 확인하고 있습니다. 잠시만 기다려 주세요.</p>
    </div>
  );
}

export default LoginSuccessPage;