import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { StockWeatherResponseDto, NewsArticleSummary } from '@/types/stock'; // NewsArticleSummary도 필요할 수 있으므로 추가
import Head from 'next/head';
import Image from 'next/image';
import axios from 'axios'; // axios.isAxiosError를 위해 필요
import axiosInstance from '../api/axiosInstance'; // axiosInstance 임포트

export default function StockResultPage() {
  const router = useRouter();
  const [stockResponse, setStockResponse] = useState<StockWeatherResponseDto | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    // Next.js 라우터가 준비되었는지 확인
    if (!router.isReady) {
      return;
    }

    const { query } = router.query; // URL 쿼리 파라미터 'query'를 가져옴

    // 검색어가 없으면 에러 처리
    if (typeof query !== 'string' || !query) {
      setError('검색어가 누락되었습니다. 대시보드에서 다시 검색해주세요.');
      setLoading(false);
      return;
    }

    // 백엔드 API를 직접 호출하여 데이터를 가져옵니다.
    const fetchStockData = async () => {
      try {
        setLoading(true); // 데이터 fetch 시작 시 로딩 상태로 설정
        setError(null);   // 이전 에러 메시지 초기화

        // ✨ 수정된 부분: fetch 대신 axiosInstance 사용 및 경로 수정 ✨
        const response = await axiosInstance.get<StockWeatherResponseDto>('/stock/search', {
          params: { query: query } // 쿼리 파라미터는 params 객체로 전달
        });

        // axios는 응답 데이터를 response.data에 넣어줍니다.
        const data = response.data;
        console.log('Fetched stock data:', data);

        // 백엔드 응답이 올바른 StockWeatherResponseDto 구조인지 확인
        if (!data || !data.stock || !data.stock.name) {
          setError('필수 주식 정보(종목명)가 누락되었습니다. 대시보드에서 다시 검색해주세요.');
          setLoading(false);
          return;
        }

        setStockResponse(data); // 전체 응답 객체를 상태에 저장
        setLoading(false);

      } catch (err: any) {
        console.error('Failed to fetch stock data:', err);
        // axios 에러 처리
        if (axios.isAxiosError(err)) {
          // 백엔드에서 보낸 에러 메시지 또는 일반 에러 메시지 사용
          setError(err.response?.data?.message || err.message || '데이터를 불러오는 데 실패했습니다.');
        } else {
          setError('데이터를 불러오는 데 실패했습니다.');
        }
        setLoading(false);
      }
    };

    fetchStockData();

  }, [router.isReady, router.query.query]); // router.query.query가 변경될 때마다 데이터를 다시 가져옵니다.

  // 로딩, 에러, 데이터 없음 상태 처리 (이전 코드와 동일)
  if (loading) {
    return (
      <div className="min-h-screen bg-brand-light flex justify-center items-center font-body text-text-default">
        <Head>
          <title>로딩 중 - StockWeather</title>
        </Head>
        <p>데이터 로딩 중...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-brand-light flex justify-center items-center font-body text-text-default">
        <Head>
          <title>오류 - StockWeather</title>
        </Head>
        <div className="text-center p-4">
          <p className="text-brand-primary mb-4">{error}</p>
          <button
            onClick={() => router.push('/dashboard')}
            className="mt-6 w-full max-w-xs bg-brand-primary text-white py-2 px-4 rounded-md hover:bg-brand-primary/90 transition duration-300 font-body"
          >
            대시보드로 돌아가기
          </button>
        </div>
      </div>
    );
  }

  // stockResponse 상태가 null이거나 stock 데이터가 없을 때 처리
  if (!stockResponse || !stockResponse.stock) {
    return (
      <div className="min-h-screen bg-brand-light flex justify-center items-center font-body text-text-default">
        <Head>
          <title>데이터 없음 - StockWeather</title>
        </Head>
        <div className="text-center p-4">
          <p className="text-brand-primary mb-4">표시할 데이터가 없습니다.</p>
          <button
              onClick={() => router.push('/dashboard')}
              className="mt-6 w-full max-w-xs bg-brand-primary text-white py-2 px-4 rounded-md hover:bg-brand-primary/90 transition duration-300 font-body"
            >
              대시보드로 돌아가기
            </button>
        </div>
      </div>
    );
  }

  // 주식 정보 표시
  const stockData = stockResponse.stock; // 편의를 위해 별도 변수에 할당

  return (
    <div className="min-h-screen bg-brand-light text-text-default p-4">
      <Head>
        <title>{stockData.name} - StockWeather</title>
      </Head>
      <div className="max-w-md mx-auto bg-surface-base rounded-md shadow-card p-6 my-8">
        <h1 className="text-2xl font-bold mb-4 text-center font-heading text-brand-dark">
          {stockData.name}
        </h1>

        <div className="mb-4 text-center">
          {stockResponse.weatherIcon ? (
            <Image
              src={`/images/weather/${stockResponse.weatherIcon}.png`} // weatherIcon 경로 수정 예시
              alt="날씨 이미지"
              width={96}
              height={96}
              priority
              className="mx-auto mb-2"
            />
          ) : (
            <div className="w-24 h-24 mx-auto mb-2 flex items-center justify-center bg-gray-200 rounded-full">
              <p className="text-sm text-gray-500">이미지 없음</p>
            </div>
          )}
          <p className="text-lg font-semibold font-body text-brand-primary">
            {stockData.overallSentiment}
          </p>
          <p className="text-sm text-text-muted">{stockData.weatherSummary}</p>
        </div>

        <div className="mb-4">
          <h2 className="text-xl font-bold mb-2 font-heading text-text-default">요약</h2>
          <p className="text-sm font-body text-text-muted mb-4 leading-relaxed">
            {stockData.reportSummary ? (
              stockData.reportSummary.split('\n').map((line, index) => (
                <React.Fragment key={index}>
                  {line}
                  {(index < stockData.reportSummary.split('\n').length - 1) && <br />}
                </React.Fragment>
              ))
            ) : (
              "현재 관련 뉴스를 찾을 수 없어 심층적인 분석 요약을 제공하기 어렵습니다."
            )}
          </p>
        </div>

        <div className="mb-4">
          <h2 className="text-xl font-bold mb-2 font-heading text-text-default">관련 기사</h2>
          <div className="space-y-4">
            {stockData.articles && stockData.articles.length > 0 ? (
              stockData.articles.map((article: NewsArticleSummary, index) => (
                <div key={index} className="mb-3 p-3 border border-surface-subtle rounded-md shadow-sm bg-surface-base">
                  <h3 className="text-base font-semibold font-body text-text-default">{article.title}</h3>
                  <p className="text-sm font-body text-text-muted mt-1">{article.summary}</p>
                  {article.url && (
                    <a
                      href={article.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-primary-default hover:underline mt-2 inline-block"
                    >
                      기사 원문 보기
                    </a>
                  )}
                </div>
              ))
            ) : (
              <p className="text-sm text-text-muted">관련 기사를 찾을 수 없습니다.</p>
            )}
          </div>
        </div>

        {/* 관련 종목 추가 (선택 사항) */}
        {stockData.relatedStocks && stockData.relatedStocks.length > 0 && (
          <div className="mb-4">
            <h2 className="text-xl font-bold mb-2 font-heading text-text-default">관련 종목</h2>
            <ul className="list-disc pl-5">
              {stockData.relatedStocks.map((related, index) => (
                <li key={index} className="text-sm text-text-muted">
                  {related.name}: {related.opinion} ({Math.round(related.confidence * 100)}%)
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* 투자 의견 추가 (선택 사항) */}
        {stockData.investmentOpinion && (
          <div className="mb-4">
            <h2 className="text-xl font-bold mb-2 font-heading text-text-default">투자 의견</h2>
            <p className="text-sm font-body text-text-muted">
              의견: {stockData.investmentOpinion.opinion} (확신도: {Math.round(stockData.investmentOpinion.confidence * 100)}%)
            </p>
          </div>
        )}

        {/* 법적 고지 추가 (선택 사항) */}
        {stockResponse.disclaimer && (
            <div className="text-xs text-gray-500 mt-4 p-2 border-t border-surface-subtle pt-2">
                <p>{stockResponse.disclaimer}</p>
            </div>
        )}

        <button
          onClick={() => router.push('/dashboard')}
          className="mt-6 w-full bg-brand-primary text-white py-2 px-4 rounded-md hover:bg-brand-primary/90 transition duration-300 font-body"
        >
          대시보드로 돌아가기
        </button>
      </div>
    </div>
  );
}