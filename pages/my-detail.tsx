// stockweather-frontend/src/pages/my-detail.tsx
'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { fetchUserDetail } from '../services/stockService';
import { StockDetail } from '../types/stock';
import axios from 'axios';
import LoadingSpinner from '../components/LoadingSpinner'; // <-- LoadingSpinner 컴포넌트 임포트

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
        setError(null); // 성공 시 에러 상태 초기화
      } catch (err) {
        console.error('Failed to fetch user detail:', err);
        // AxiosError의 경우 더 자세한 에러 정보 추출
        if (axios.isAxiosError(err) && err.response) {
            // 사용자에게 더 친화적인 메시지 제공
            if (err.response.status === 401) {
                setError('세션이 만료되었거나 로그인이 필요합니다.');
                alert('로그인이 필요합니다.'); // alert 추가
                router.replace('/login');
            } else {
                setError(`세부 정보를 가져오는 데 실패했습니다: ${err.response.status} ${err.response.statusText || err.message}`);
            }
        } else {
            setError('세부 정보를 가져오는 중 알 수 없는 오류가 발생했습니다.');
        }
      } finally {
        setLoading(false);
      }
    };

    getDetail();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FFF5F5] flex justify-center items-center">
        <div className="w-[393px] flex flex-col items-center justify-center text-center">
          {/* LoadingSpinner 컴포넌트를 사용하여 스피너와 메시지를 함께 표시 */}
          <LoadingSpinner message="종목별 세부 현황 정보를 불러오는 중..." /> {/* <-- 변경된 부분 */}
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
            onClick={() => router.push('/dashboard')} // 홈으로 돌아가기 또는 다시 시도하기
          >
            홈으로 돌아가기
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
              key={stock.name} // stock.name이 고유하다고 가정, 더 고유한 ID가 있다면 그것을 사용
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