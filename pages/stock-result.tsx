// stockweather-frontend/src/pages/stock-result.tsx

import React from 'react'; // ⭐️⭐️⭐️ 이 줄을 추가합니다! ⭐️⭐️⭐️
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { StockSearchResult } from '@/types/stock';
import Head from 'next/head';

export default function StockResultPage() {
  const router = useRouter();
  const [stockData, setStockData] = useState<StockSearchResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!router.isReady) return;

    const { data } = router.query;

    if (typeof data === 'string') {
      try {
        const decodedData = decodeURIComponent(data);
        const parsedData: StockSearchResult = JSON.parse(decodedData);
        setStockData(parsedData);
      } catch (err) {
        console.error('Failed to parse stock data:', err);
        setError('데이터를 불러오는 데 실패했습니다.');
      }
    } else {
      setError('올바른 주식 데이터가 제공되지 않았습니다.');
    }
  }, [router]);

  if (error) {
    return (
      <div className="min-h-screen bg-[#FFF5F5] flex justify-center items-center">
        <Head>
          <title>오류 - StockWeather</title>
        </Head>
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  if (!stockData) {
    // 데이터가 로딩 중이거나 없는 경우 (혹은 에러 시)
    return (
      <div className="min-h-screen bg-[#FFF5F5] flex justify-center items-center">
        <Head>
          <title>로딩 중 - StockWeather</title>
        </Head>
        <p>데이터 로딩 중...</p>
      </div>
    );
  }

  // 데이터가 성공적으로 로드된 경우
  return (
    <div className="min-h-screen bg-[#FFF5F5] text-gray-800 p-4">
      <Head>
        <title>{stockData.stockName} - StockWeather</title>
      </Head>
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6 my-8">
        <h1 className="text-2xl font-bold mb-4 text-center">{stockData.stockName}</h1>

        <div className="mb-4 text-center">
          <img src={stockData.weatherImage} alt="날씨 이미지" className="w-24 h-24 mx-auto mb-2" />
          <p className="text-lg font-semibold">{stockData.sentimentText}</p>
        </div>

        <div className="mb-4">
          <h2 className="text-xl font-bold mb-2">요약</h2>
          <p className="text-sm text-muted mb-4 leading-relaxed">
            {stockData.summaryText.split('\n').map((line, index) => (
              <React.Fragment key={index}>
                {line}
                {(index < stockData.summaryText.split('\n').length - 1) && <br />}
              </React.Fragment>
            ))}
          </p>
        </div>

        <div className="mb-4">
          <h2 className="text-xl font-bold mb-2">핵심 키워드</h2>
          <div className="flex flex-wrap gap-2">
            {stockData.keywords.map((keyword, index) => (
              <span
                key={index}
                className="bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-0.5 rounded-full"
              >
                {keyword}
              </span>
            ))}
          </div>
        </div>

        <div>
          <h2 className="text-xl font-bold mb-2">관련 기사</h2>
          {stockData.articles.map((article, index) => (
            <div key={index} className="mb-3 p-3 border border-gray-200 rounded-md">
              <h3 className="text-base font-semibold">{article.title}</h3>
              <p className="text-sm text-gray-600 mt-1">{article.summary}</p>
              {article.fullContent && (
                <p className="text-xs text-gray-500 mt-2">전문: {article.fullContent}</p>
              )}
            </div>
          ))}
        </div>

        <button
          onClick={() => router.push('/dashboard')}
          className="mt-6 w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition duration-300"
        >
          대시보드로 돌아가기
        </button>
      </div>
    </div>
  );
}