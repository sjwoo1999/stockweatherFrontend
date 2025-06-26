// stockweather-frontend/src/pages/index.tsx
import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { getJwtToken } from '../utils/cookieUtils';

const HomePage = () => {
  const router = useRouter();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const token = getJwtToken();
      if (token) {
        router.replace('/dashboard');
      } else {
        router.replace('/login');
      }
    }
  }, [router]);

  return (
    <div style={{ textAlign: 'center', padding: '50px', fontSize: '20px' }}>
      페이지 로딩 중...
    </div>
  );
};

export default HomePage;