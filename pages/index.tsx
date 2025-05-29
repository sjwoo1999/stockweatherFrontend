// stockweather-frontend/src/pages/index.tsx
import { useEffect } from 'react';
import { useRouter } from 'next/router';

const HomePage = () => {
  const router = useRouter();

  useEffect(() => {
    // 이 컴포넌트가 클라이언트에서 마운트될 때만 localStorage에 접근하도록
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('jwtToken');
      if (token) {
        router.replace('/dashboard'); // 토큰 있으면 대시보드로 리다이렉트
      } else {
        router.replace('/login'); // 토큰 없으면 로그인 페이지로 리다이렉트
      }
    }
  }, [router]); // router 객체가 변경될 때마다 실행

  return (
    <div style={{ textAlign: 'center', padding: '50px', fontSize: '20px' }}>
      페이지 로딩 중...
    </div>
  );
};

export default HomePage;