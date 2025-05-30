// stockweather-frontend/src/pages/search-loading.tsx
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { searchStock } from '@/services/stockService'; // API 서비스 임포트
import { StockSearchResult } from '@/types/stock'; // 타입 임포트
import Head from 'next/head'; // Head 컴포넌트 임포트

export default function SearchLoading() {
  const router = useRouter();
  const { query } = router.query; // URL 쿼리 파라미터에서 'query' 값 가져오기
  const [loadingText, setLoadingText] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // router.isReady를 사용하여 라우터가 완전히 준비될 때까지 기다립니다.
    // 이렇게 하면 query 값이 undefined가 아닌 상태에서 로직이 실행됩니다.
    if (!router.isReady) {
      console.log('SearchLoading: router not ready yet.');
      return;
    }

    const stockQuery = Array.isArray(query) ? query[0] : query;

    if (!stockQuery || typeof stockQuery !== 'string' || stockQuery.trim() === '') {
      console.error('SearchLoading: No valid query provided. Redirecting to dashboard.');
      setError('검색어가 제공되지 않았습니다. 잠시 후 대시보드로 돌아갑니다.');
      // 검색어 없으면 사용자에게 메시지 보여주고 3초 후 대시보드로 리다이렉트
      setTimeout(() => {
        router.replace('/dashboard?error=no_query');
      }, 3000);
      return;
    }

    setLoadingText(`'${stockQuery}'에 대한 정보를 찾고 있어요...`); // 검색어를 포함한 로딩 메시지

    const fetchData = async () => {
      try {
        console.log(`SearchLoading: Calling searchStock for query: ${stockQuery}`);
        const result: StockSearchResult = await searchStock(stockQuery); // 백엔드 API 호출

        console.log('SearchLoading: Successfully fetched stock data.');
        // API 결과를 JSON 문자열로 변환 후 URL 안전하게 인코딩하여 다음 페이지로 전달
        const encodedData = encodeURIComponent(JSON.stringify(result));
        router.replace(`/stock-result?data=${encodedData}`); // 검색 결과 페이지로 이동
      } catch (err) {
        console.error('SearchLoading: Failed to fetch stock data:', err);
        setError('정보를 가져오는 데 실패했습니다. 다시 시도해주세요.');
        // 에러 발생 시 사용자에게 메시지 보여주고 3초 후 대시보드로 돌아가기
        setTimeout(() => {
          router.replace(`/dashboard?error=api_failed&stock=${encodeURIComponent(stockQuery)}`);
        }, 3000);
      }
    };

    // 지연 시간 없이 바로 데이터 가져오기를 시작 (필요시 setTimeout 추가)
    fetchData();
  }, [router, query]); // router.isReady와 query 값이 변경될 때마다 useEffect 실행

  if (error) {
    return (
      <div className="min-h-screen bg-[#FFF5F5] flex justify-center items-center">
        <Head>
          <title>오류 - StockWeather</title>
        </Head>
        <div className="w-[393px] flex flex-col items-center justify-center text-center p-6">
          <p className="mb-4 text-sm text-red-500 font-medium">
            오류: {error}
          </p>
          {/* 스피너는 에러 시에는 굳이 보여줄 필요 없으므로 제거 */}
          <p className="text-xs text-gray-500">잠시 후 대시보드로 돌아갑니다.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FFF5F5] flex justify-center items-center">
      <Head>
        <title>검색 중 - StockWeather</title>
      </Head>
      <div className="w-[393px] flex flex-col items-center justify-center text-center">
        <p className="mb-4 text-base text-gray-600 font-medium"> {/* 폰트 크기 조정 */}
          {loadingText || '정보를 로딩 중입니다...'}
        </p>
        {/* globals.css에 정의된 스피너 HTML 구조 사용 */}
        <div className="spinner">
          {[...Array(8)].map((_, i) => (
            <span key={i}></span>
          ))}
        </div>
      </div>
    </div>
  );
}