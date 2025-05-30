// stockweather-frontend/src/pages/my-summary.tsx
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { fetchUserSummary } from '@/services/stockService';
import { StockSummary } from '@/types/stock';

export default function MySummary() {
  const router = useRouter();
  const [summaryData, setSummaryData] = useState<StockSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const getSummary = async () => {
      try {
        setLoading(true);
        const result = await fetchUserSummary();
        if (result && result.length > 0) {
          setSummaryData(result[0]);
        } else {
          setError('요약 정보를 찾을 수 없습니다.');
        }
      } catch (err) {
        console.error('Failed to fetch user summary:', err);
        // AxiosError의 경우 더 자세한 에러 정보 추출
        if (axios.isAxiosError(err) && err.response) {
            setError(`요약 정보를 가져오는 데 실패했습니다: ${err.response.status} ${err.response.statusText}`);
            if (err.response.status === 401) {
                // 토큰 만료 등 401 에러 시 로그인 페이지로 리다이렉트
                alert('로그인이 필요합니다.');
                router.replace('/login');
            }
        } else {
            setError('요약 정보를 가져오는 중 알 수 없는 오류가 발생했습니다.');
        }
      } finally {
        setLoading(false);
      }
    };

    // 컴포넌트가 마운트될 때만 데이터를 가져오도록
    getSummary();
  }, [router]); // router 객체가 필요하므로 의존성 배열에 추가

  const handleDetail = () => {
    router.push('/my-detail');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FFF5F5] flex justify-center items-center">
        <div className="w-[393px] flex flex-col items-center justify-center text-center">
          <p className="mb-4 text-sm text-gray-600 font-medium">
            관심 종목 요약 정보를 불러오는 중...
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
            onClick={() => router.push('/dashboard')}
            className="mt-4 bg-gray-200 text-gray-800 px-6 py-2 rounded-full text-sm font-semibold shadow-sm"
          >
            다시 시도하기
          </button>
        </div>
      </div>
    );
  }

  if (!summaryData) {
    return (
      <div className="min-h-screen bg-[#FFF5F5] flex justify-center items-center">
        <div className="w-[393px] flex flex-col items-center justify-center text-center">
          <p className="mb-4 text-sm text-gray-600 font-medium">
            표시할 요약 정보가 없습니다.
          </p>
          <button
            onClick={() => router.push('/dashboard')}
            className="mt-4 bg-white text-black px-6 py-2 rounded-full text-sm font-semibold shadow-sm"
          >
            종목 검색하러 가기
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className="w-[393px] h-screen bg-cover bg-center flex flex-col items-center justify-center text-white text-center"
      style={{
        backgroundImage: 'url(/weather/column.png)', // 배경 이미지는 실제 사용 시 CDN 등으로 변경
      }}
    >
      <div className="px-6 py-10 flex flex-col items-center justify-center w-full h-full">
        <h2 className="text-xl text-black font-bold mb-2">{summaryData.date}</h2>
        <p className="mb-4 text-black text-sm">
          {summaryData.overallSentiment}
        </p>
        <ul className="text-sm space-y-2 mb-6 text-black">
          {summaryData.stocks.map((stock, idx) => (
            <li key={idx}>
              {/* 이모지는 백엔드에서 함께 제공되거나 프론트엔드에서 매핑 로직 필요 */}
              {stock.name}: {stock.summary}
            </li>
          ))}
        </ul>
        <button
          onClick={handleDetail}
          className="bg-white text-black px-6 py-2 rounded-full text-sm font-semibold shadow-sm"
        >
          자세한 종목 정보 확인하기
        </button>
      </div>
    </div>
  );
}