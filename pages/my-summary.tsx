// stockweather-frontend/src/pages/my-summary.tsx
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { fetchUserSummary } from '../services/stockService'; // <-- 경로 수정
import { StockSummary } from '../types/stock'; // <-- 경로 수정
import axios from 'axios';
import LoadingSpinner from '../components/LoadingSpinner'; // <-- LoadingSpinner 임포트

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
        // fetchUserSummary가 StockSummary[]를 반환한다고 가정
        if (result && result.length > 0) {
          setSummaryData(result[0]);
        } else {
          // 백엔드에서 빈 배열을 반환하거나, 데이터가 없을 때의 처리
          setError('요약 정보를 찾을 수 없습니다.');
          setSummaryData(null); // 데이터가 없을 때 summaryData를 null로 설정
        }
      } catch (err) {
        console.error('Failed to fetch user summary:', err);
        if (axios.isAxiosError(err) && err.response) {
            // 사용자에게 더 친화적인 메시지 제공
            if (err.response.status === 401) {
                setError('세션이 만료되었거나 로그인이 필요합니다.');
                alert('로그인이 필요합니다.');
                router.replace('/login');
            } else {
                setError(`요약 정보를 가져오는 데 실패했습니다: ${err.response.status} ${err.response.statusText || err.message}`);
            }
        } else {
            setError('요약 정보를 가져오는 중 알 수 없는 오류가 발생했습니다.');
        }
      } finally {
        setLoading(false);
      }
    };

    getSummary();
  }, [router]);

  const handleDetail = () => {
    router.push('/my-detail');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FFF5F5] flex justify-center items-center">
        <div className="w-[393px] flex flex-col items-center justify-center text-center">
          {/* LoadingSpinner 컴포넌트 사용 */}
          <LoadingSpinner message="관심 종목 요약 정보를 불러오는 중..." /> {/* <-- 변경된 부분 */}
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
            홈으로 돌아가기
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
            // `stock.name`이 고유하다고 가정하고 key로 사용, 또는 고유 ID 사용
            <li key={stock.name || idx}> {/* <-- key prop 개선 */}
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