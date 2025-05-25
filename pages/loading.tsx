// pages/loading.tsx

import { useEffect } from 'react';
import { useRouter } from 'next/router';

export default function Loading() {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      router.push('/search');
    }, 2000);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="min-h-screen bg-[#FFF5F5] flex justify-center items-center">
      <div className="w-[393px] flex flex-col items-center justify-center text-center">
        <p className="mb-4 text-sm text-gray-600 font-medium">
          삼성전자에 대한 정보를 찾고 있어요...
        </p>
        <div className="spinner">
          {[...Array(8)].map((_, i) => (
            <span key={i}></span>
          ))}
        </div>
      </div>
    </div>
  );
}
