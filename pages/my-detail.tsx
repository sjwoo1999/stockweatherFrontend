// stockweather-frontend/src/pages/my-detail.tsx
'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { fetchUserDetail } from '@/services/stockService';
import { StockDetail } from '@/types/stock';
import axios from 'axios'; // Axios 에러 처리를 위해 임포트

export default function MyDetail() {
  const router = useRouter();
  const [stocks, setStocks] = useState<StockDetail[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const getDetail = async () => {
      try {
        setLoading(true);
        const result = await fetchUserDetail();
        setStocks(result);
      } catch (err) {
        console.error('Failed to fetch user detail:', err);
        // AxiosError의 경우 더 자세한 에러 정보 추출
        if (axios.isAxiosError(err) && err.response) {
            setError(`세부 정보를 가져오는 데 실패했습니다: ${err.response.status} ${err.response.statusText}`);
            if (err.response.status === 401) {
                // 토큰 만료 등 401 에러 시 로그인 페이지로 리다이렉트
                alert('로그인이 필요합니다.');
                router.replace('/login');
            }
        } else {
            setError('세부 정보를 가져오는 중 알 수 없는 오류가 발생했습니다.');
        }
      } finally {
        setLoading(false);
      }
    };

    getDetail();
  }, [router]); // router 객체가 필요하므로 의존성 배열에 추가

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FFF5F5] flex justify-center items-center">
        <div className="w-[393px] flex flex-col items-center justify-center text-center">
          <p className="mb-4 text-sm text-gray-600 font-medium">
            종목별 세부 현황 정보를 불러오는 중...
          </p>
          <div className="spinner">{/* 스피너 CSS는 search-loading.tsx 참고 */}</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#FFF5F5] flex justify-center items-center">
        <div className="w-[393px] flex flex-col items-center justify-center text-center p-6">
          <p className="mb-4 text-sm text-red-500 font-medium">
            오류: {error}
          </p>
          <button
            className="w-full mt-6 py-2 rounded-full text-sm font-medium bg-gray-200 text-gray-800 hover:opacity-90 transition"
            onClick={() => router.push('/dashboard')}
          >
            다시 시도하기
          </button>
        </div>
      </div>
    );
  }

  if (stocks.length === 0) {
    return (
      <div className="min-h-screen bg-[#FFF5F5] flex justify-center items-center">
        <div className="w-[393px] flex flex-col items-center justify-center text-center">
          <p className="mb-4 text-sm text-gray-600 font-medium">
            표시할 세부 종목 정보가 없습니다.
          </p>
          <button
            className="w-full mt-6 py-2 rounded-full text-sm font-medium bg-[#E30547] text-white hover:opacity-90 transition"
            onClick={() => router.push('/dashboard')}
          >
            홈으로 돌아가기
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex justify-center">
      <div className="w-[393px] min-h-screen bg-white p-6">
        <h2 className="text-lg font-heading font-bold mb-4">
          종목별 세부 현황은 아래와 같아요
        </h2>

        <div className="space-y-3">
          {stocks.map((stock) => (
            <div
              key={stock.name}
              className="bg-white p-4 rounded-lg flex justify-between items-center shadow-sm border border-[#E30547]"
            >
              <span className="flex items-center gap-2">
                <span>{stock.emoji}</span>
                <span>{stock.name}</span>
              </span>
              <span className={`${stock.color} font-semibold text-sm`}>
                {stock.signal}({stock.percent})
              </span>
            </div>
          ))}
        </div>

        <p className="text-xs text-gray-500 mt-4">
          ※ 해당 수치는 예시이며, 실제 수치와는 무관합니다.
        </p>

        <button
          className="w-full mt-6 py-2 rounded-full text-sm font-medium bg-[#E30547] text-white hover:opacity-90 transition"
          onClick={() => router.push('/dashboard')}
        >
          홈으로 돌아가기
        </button>
      </div>
    </div>
  );
}