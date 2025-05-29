// stockweather-frontend/src/pages/login-success.tsx (재확인)
import React, { useEffect } from 'react';
import { useRouter } from 'next/router';

function LoginSuccessPage() {
  const router = useRouter();

  useEffect(() => {
    if (!router.isReady) {
      console.log('LoginSuccess: Router not ready yet, waiting...');
      return;
    }

    const { token } = router.query;

    console.log('LoginSuccess: router.query.token received:', token);
    console.log('LoginSuccess: typeof token:', typeof token);

    if (token && typeof token === 'string') {
      try {
        localStorage.setItem('jwtToken', token);
        console.log('LoginSuccess: JWT Token stored in localStorage.');
        console.log('LoginSuccess: Verifying localStorage AFTER set:', localStorage.getItem('jwtToken'));

        // ★ 중요: setTimeout을 사용하여 약간의 지연을 주면
        // localStorage 동기화 및 Next.js 렌더링 사이클에 도움이 될 수 있습니다.
        // 50ms 정도면 충분할 것입니다. (필요시 조절)
        setTimeout(() => {
          router.replace('/dashboard');
        }, 50); // 50ms 지연

      } catch (e) {
        console.error('LoginSuccess: Error setting localStorage:', e);
        router.replace('/login');
      }
    } else {
      console.error('LoginSuccess: URL에 토큰이 없거나 형식이 올바르지 않습니다. 로그인 실패 처리.');
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