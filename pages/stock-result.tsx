import React from 'react';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { StockSearchResult } from '@/types/stock'; // '@/types/stock' 경로가 올바르다고 가정합니다.
import Head from 'next/head';
import Image from 'next/image'; // ⭐ Image 컴포넌트 임포트

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
  }, [router]); // router는 router.isReady, router.query를 사용하므로 의존성 배열에 유지하는 것이 맞습니다.

  if (error) {
    return (
      // ✨ 배경색, 텍스트 색상 변경 ✨
      <div className="min-h-screen bg-brand-light flex justify-center items-center font-body text-text-default">
        <Head>
          <title>오류 - StockWeather</title>
        </Head>
        <p className="text-brand-primary">{error}</p> {/* ✨ 에러 텍스트 색상 변경 ✨ */}
      </div>
    );
  }

  if (!stockData) {
    return (
      // ✨ 배경색, 텍스트 색상 변경 ✨
      <div className="min-h-screen bg-brand-light flex justify-center items-center font-body text-text-default">
        <Head>
          <title>로딩 중 - StockWeather</title>
        </Head>
        <p>데이터 로딩 중...</p> {/* 이 부분은 스피너 컴포넌트로 대체할 수 있습니다. */}
      </div>
    );
  }

  // 데이터가 성공적으로 로드된 경우
  return (
    // ✨ 배경색, 텍스트 색상 변경 ✨
    <div className="min-h-screen bg-brand-light text-text-default p-4">
      <Head>
        <title>{stockData.stockName} - StockWeather</title>
      </Head>
      {/* ✨ 카드 배경색, 둥글기, 그림자 변경 ✨ */}
      <div className="max-w-md mx-auto bg-surface-base rounded-md shadow-card p-6 my-8">
        {/* ✨ 종목명 폰트, 색상 변경 ✨ */}
        <h1 className="text-2xl font-bold mb-4 text-center font-heading text-brand-dark">
          {stockData.stockName}
        </h1>

        <div className="mb-4 text-center">
          {/* ⭐ <img> 태그를 <Image /> 컴포넌트로 교체 */}
          <Image
            src={stockData.weatherImage}
            alt="날씨 이미지"
            width={96} // `w-24` (tailwindcss)는 기본적으로 96px 이므로 `width`를 96으로 설정합니다.
            height={96} // `h-24` (tailwindcss)는 기본적으로 96px 이므로 `height`를 96으로 설정합니다.
            className="mx-auto mb-2" // TailwindCSS 클래스는 className으로 그대로 유지
          />
          {/* ✨ 감성 텍스트 폰트, 색상 변경 (브랜드 메인 색상 또는 강조색) ✨ */}
          <p className="text-lg font-semibold font-body text-brand-primary">
            {stockData.sentimentText}
          </p>
        </div>

        <div className="mb-4">
          {/* ✨ 제목 폰트 변경 ✨ */}
          <h2 className="text-xl font-bold mb-2 font-heading text-text-default">요약</h2>
          {/* ✨ 본문 텍스트 폰트, 색상 변경 ✨ */}
          <p className="text-sm font-body text-text-muted mb-4 leading-relaxed">
            {stockData.summaryText.split('\n').map((line, index) => (
              <React.Fragment key={index}>
                {line}
                {(index < stockData.summaryText.split('\n').length - 1) && <br />}
              </React.Fragment>
            ))}
          </p>
        </div>

        <div className="mb-4">
          {/* ✨ 제목 폰트 변경 ✨ */}
          <h2 className="text-xl font-bold mb-2 font-heading text-text-default">핵심 키워드</h2>
          <div className="flex flex-wrap gap-2">
            {stockData.keywords.map((keyword, index) => (
              <span
                key={index}
                // ✨ 키워드 스타일 변경: 배경색은 surface.subtle, 텍스트 색상은 text.default ✨
                className="bg-surface-subtle text-text-default text-xs font-semibold px-2.5 py-0.5 rounded-full font-body"
              >
                {keyword}
              </span>
            ))}
          </div>
        </div>

        <div>
          {/* ✨ 제목 폰트 변경 ✨ */}
          <h2 className="text-xl font-bold mb-2 font-heading text-text-default">관련 기사</h2>
          {stockData.articles.map((article, index) => (
            <div key={index} className="mb-3 p-3 border border-surface-subtle rounded-md shadow-sm bg-surface-base"> {/* ✨ 기사 카드 스타일 변경 ✨ */}
              <h3 className="text-base font-semibold font-body text-text-default">{article.title}</h3>
              <p className="text-sm font-body text-text-muted mt-1">{article.summary}</p>
              {article.fullContent && (
                <p className="text-xs font-body text-text-muted mt-2">전문: {article.fullContent}</p>
              )}
            </div>
          ))}
        </div>

        <button
          onClick={() => router.push('/dashboard')}
          // ✨ 버튼 스타일 변경 ✨
          className="mt-6 w-full bg-brand-primary text-white py-2 px-4 rounded-md hover:bg-brand-primary/90 transition duration-300 font-body"
        >
          대시보드로 돌아가기
        </button>
      </div>
    </div>
  );
}