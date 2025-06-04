// stockweather-frontend/src/pages/stock-result.tsx

import React, { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Image from 'next/image'; // ⭐ Image 컴포넌트 다시 임포트 (뉴스 썸네일 때문에 필요) ⭐
import { FaArrowLeft } from 'react-icons/fa';

// react-icons에서 사용할 날씨 관련 아이콘 임포트
import {
  FiSun,           // sunny
  FiCloud,         // partly-cloudy, cloudy
  FiCloudDrizzle,  // rainy
  FiCloudLightning, // stormy
  FiCloudOff,      // unknown (대체 아이콘)
} from 'react-icons/fi';

import { useSocket } from '../contexts/SocketContext';

// DTO 인터페이스 임포트 (stock.ts에서)
import {
  StockWeatherResponseDto,
  AnalysisProgressData,
  NewsArticleSummary, // 이 인터페이스는 컴포넌트 내부에서 사용되지 않지만, 타입 정의 파일에서 가져오는 것이 일관적입니다.
  StockData // 이 인터페이스도 컴포넌트 내부에서 직접 사용되지 않지만, 타입 정의 파일에서 가져오는 것이 일관적입니다.
} from '../types/stock';

function StockResultPage() {
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [stockName, setStockName] = useState<string | null>(null);
  const [newsCount, setNewsCount] = useState<number | null>(null);
  const [displayResult, setDisplayResult] = useState<StockWeatherResponseDto | null>(null);

  const router = useRouter();
  // `socket`은 이 컴포넌트에서 직접 사용되지 않으므로 제거하거나 그대로 둘 수 있습니다.
  const { analysisStatus, processingResult, requestingSocketId, clearProcessingResult, setRequestingSocketId } = useSocket();

  const queryFromUrl = router.query.query as string;
  const socketIdFromUrl = router.query.socketId as string;

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const token = localStorage.getItem('jwtToken');
    if (!token) {
      router.replace('/login');
      return;
    }

    if (!queryFromUrl || !socketIdFromUrl) {
      setError('유효하지 않은 접근입니다. 검색어를 입력해주세요.');
      setLoading(false);
      return;
    }

    setStockName(queryFromUrl);
    setLoading(true);
    setError(null);
    setDisplayResult(null);
    setNewsCount(null);

    // ⭐ 중요: 이 페이지가 마운트될 때만 requestingSocketId를 설정합니다. ⭐
    // `dashboard.tsx`에서 설정하고 왔지만, 페이지 새로고침 시에는 `socketIdFromUrl`로 재설정해야 합니다.
    // 기존에 `requestingSocketId`가 `null`이 되는 문제는 `dashboard.tsx`의 클린업에서 `clearProcessingResult`를 제거함으로써 해결되었습니다.
    // 따라서, 이 `setRequestingSocketId` 호출은 페이지가 새로 로드되었을 때의 안정성을 높입니다.
    setRequestingSocketId(socketIdFromUrl);
    console.log(`StockResultPage: Setting requestingSocketId to ${socketIdFromUrl} from URL.`);

    // 컴포넌트 언마운트 시 전역 상태 초기화
    return () => {
      console.log('StockResultPage unmounted, clearing global state and requestingSocketId.');
      clearProcessingResult(); // analysisStatus, processingResult, requestingSocketId 모두 초기화
    };
  }, [router, queryFromUrl, socketIdFromUrl, clearProcessingResult, setRequestingSocketId]);

  useEffect(() => {
    // `requestingSocketId`는 `SocketContext` 내부의 `requestingSocketIdRef.current`와 동일합니다.
    // 여기서는 `useSocket` 훅을 통해 가져온 `requestingSocketId` 상태를 직접 사용합니다.
    const isCurrentRequestActive = requestingSocketId === socketIdFromUrl;

    if (!isCurrentRequestActive) {
        // 이 로그는 `SocketProvider`의 로그와 중복되거나,
        // `requestingSocketId`가 아직 설정되지 않았을 때 (초기 렌더링 시) 발생할 수 있습니다.
        // 불필요하게 많이 찍히는 것을 방지하기 위해 주석 처리하거나, 필요 시 활성화합니다.
        // console.log('StockResultPage: Skipping update, not the active request for this page.');
        return;
    }

    if (processingResult && processingResult.query === queryFromUrl && processingResult.socketId === socketIdFromUrl) {
      console.log('StockResultPage: processingComplete received for current query.', processingResult);
      setDisplayResult(processingResult);
      setLoading(false);
      setError(processingResult.error || null);
      setNewsCount(processingResult.newsCount || null);
    } else if (analysisStatus && analysisStatus.query === queryFromUrl && analysisStatus.socketId === socketIdFromUrl) {
      console.log('StockResultPage: analysisProgress received for current query.', analysisStatus);
      setLoading(true);
      setError(null);
    } else {
      // 이미 `displayResult`나 `analysisStatus`가 설정되었다면 추가 로딩 상태는 필요 없음
      if (!displayResult && !analysisStatus) {
         console.log('StockResultPage: Waiting for initial socket message for current query.');
         setLoading(true);
         setError(null);
      }
    }
  }, [processingResult, analysisStatus, queryFromUrl, socketIdFromUrl, requestingSocketId, displayResult]);


  // weatherIcon 문자열을 React Icon 컴포넌트로 매핑하는 함수
  const getWeatherIconComponent = useCallback((iconName: string) => {
    const iconSize = 64;
    switch (iconName) {
      case 'sunny':
        return <FiSun size={iconSize} className="text-yellow-500" />;
      case 'partly-cloudy':
        return <FiCloud size={iconSize} className="text-gray-500" />;
      case 'cloudy':
        return <FiCloud size={iconSize} className="text-gray-600" />;
      case 'rainy':
        return <FiCloudDrizzle size={iconSize} className="text-blue-500" />;
      case 'stormy':
        return <FiCloudLightning size={iconSize} className="text-indigo-600" />;
      case 'unknown':
      default:
        return <FiCloudOff size={iconSize} className="text-gray-400" />;
    }
  }, []);

  // --- UI 렌더링 부분 ---

  if (loading || (stockName && !displayResult && !analysisStatus)) {
    const currentMessage = analysisStatus?.message || `AI가 '${stockName || '종목'}'의 주식 전망을 분석하고 있어요.`;
    return (
      <div className="min-h-screen bg-brand-light flex justify-center items-center font-body text-text-default">
        <div className="w-[393px] flex flex-col items-center justify-center text-center p-6">
          <p className="mb-4 text-sm text-text-muted font-body">
            {currentMessage}
          </p>
          <div className="spinner">
            {[...Array(8)].map((_, i) => (
              <span key={i}></span>
            ))}
          </div>
          <button
            onClick={() => router.push('/dashboard')}
            className="mt-8 bg-surface-subtle text-text-default px-6 py-2 rounded-md text-sm font-semibold shadow-sm hover:bg-surface-subtle/70 transition-colors duration-200 font-body"
          >
            대시보드로 돌아가기
          </button>
        </div>
      </div>
    );
  }

  if (error || !displayResult || !stockName) {
    return (
      <div className="min-h-screen bg-brand-light flex justify-center items-center font-body text-text-default">
        <div className="w-[393px] flex flex-col items-center justify-center text-center p-6">
          <p className="mb-4 text-sm text-red-500 font-body">
            오류: {error || '분석 결과를 불러오는 데 실패했습니다.'}
          </p>
          <button
            onClick={() => router.push('/dashboard')}
            className="mt-4 bg-surface-subtle text-text-default px-6 py-2 rounded-md text-sm font-semibold shadow-sm hover:bg-surface-subtle/70 transition-colors duration-200 font-body"
          >
            대시보드로 돌아가기
          </button>
        </div>
      </div>
    );
  }

  const { stock, weatherIcon, timestamp, disclaimer } = displayResult;
  // weatherSummary는 이제 stock 객체 안에 있습니다.
  const { name, weatherSummary, keywords, investmentOpinion, detailedAnalysis, relatedStocks, articles, overallNewsSummary } = stock;

  return (
    <div className="min-h-screen bg-brand-light flex flex-col items-center py-12 px-4 font-body text-text-default">
      <Head>
        <title>{name} - 주식 날씨</title>
      </Head>

      <div className="w-full max-w-md bg-surface-base flex flex-col px-6 py-8 shadow-lg rounded-xl">
        {/* 상단 액션 바 */}
        <div className="flex justify-between items-center mb-8">
          {/* 대시보드 돌아가기 버튼 */}
          <button
            onClick={() => router.push('/dashboard')}
            className="flex items-center justify-center w-10 h-10 rounded-full text-brand-primary bg-surface-subtle shadow-md hover:bg-brand-primary/10 transition-colors duration-200"
            aria-label="대시보드로 돌아가기"
          >
            <FaArrowLeft size={18} />
          </button>
        </div>

        {/* 주식 날씨 요약 */}
        <div className="text-center mb-6">
          <h1 className="text-3xl font-heading text-brand-dark mb-2">{name}</h1>
          <div className="flex items-center justify-center mb-4">
            {getWeatherIconComponent(weatherIcon)}
            {/* ⭐ weatherSummary는 stock 객체 안에 있습니다. ⭐ */}
            <p className="text-4xl font-bold text-brand-primary">{weatherSummary}</p>
          </div>
          <p className="text-sm text-text-muted mb-4">{timestamp}</p>
          <div className="bg-surface-subtle rounded-lg p-4 text-text-default text-base leading-relaxed">
            <p>{overallNewsSummary || "뉴스 요약이 없습니다."}</p>
          </div>
        </div>

        {/* 핵심 키워드 */}
        <div className="mb-6">
          <h2 className="text-lg font-heading text-brand-dark mb-3 border-b border-surface-subtle pb-2">핵심 키워드</h2>
          <div className="flex flex-wrap gap-2">
            {keywords.length > 0 ? (
              keywords.map((keyword, index) => (
                <span
                  key={index}
                  className={`px-3 py-1 rounded-full text-sm font-semibold
                  ${keyword.sentiment === 'POSITIVE' ? 'bg-sentiment-positive text-white' : ''}
                  ${keyword.sentiment === 'NEGATIVE' ? 'bg-sentiment-negative text-white' : ''}
                  ${keyword.sentiment === 'NEUTRAL' ? 'bg-sentiment-neutral text-white' : ''}
                  `}
                >
                  {keyword.text}
                </span>
              ))
            ) : (
              <p className="text-text-muted text-sm">관련 키워드가 없습니다.</p>
            )}
          </div>
        </div>

        {/* 투자 의견 */}
        <div className="mb-6">
          <h2 className="text-lg font-heading text-brand-dark mb-3 border-b border-surface-subtle pb-2">투자 의견</h2>
          <div className="text-center bg-brand-primary text-white rounded-lg p-4 shadow-md">
            <p className="text-2xl font-bold mb-1">{investmentOpinion.opinion}</p>
            <p className="text-sm">확신도: {(investmentOpinion.confidence * 100).toFixed(0)}%</p>
            {investmentOpinion.reason && (
              <p className="mt-2 text-sm italic">{investmentOpinion.reason}</p>
            )}
          </div>
        </div>

        {/* 상세 분석 */}
        <div className="mb-6">
          <h2 className="text-lg font-heading text-brand-dark mb-3 border-b border-surface-subtle pb-2">상세 분석</h2>
          <div className="space-y-3 bg-surface-subtle p-4 rounded-lg">
            <p><strong>긍정적 요인:</strong> {detailedAnalysis.positiveFactors || '없음'}</p>
            <p><strong>부정적 요인:</strong> {detailedAnalysis.negativeFactors || '없음'}</p>
            <p><strong>중립적 요인:</strong> {detailedAnalysis.neutralFactors || '없음'}</p>
            <p><strong>전반적인 의견:</strong> {detailedAnalysis.overallOpinion || '없음'}</p>
          </div>
        </div>

        {/* 관련 종목 */}
        <div className="mb-6">
          <h2 className="text-lg font-heading text-brand-dark mb-3 border-b border-surface-subtle pb-2">관련 종목</h2>
          <ul className="space-y-2">
            {relatedStocks.length > 0 ? (
              relatedStocks.map((related, index) => (
                <li key={index} className="bg-surface-subtle p-3 rounded-md flex justify-between items-center shadow-sm text-sm">
                  <span>{related.name}</span>
                  <span className={`font-semibold
                    ${related.opinion === '매수' || related.opinion === '추가 매수' || related.opinion === '적정 매수' ? 'text-sentiment-positive' : ''}
                    ${related.opinion === '매도' ? 'text-sentiment-negative' : ''}
                    ${related.opinion === '유지' || related.opinion === '관망' ? 'text-sentiment-neutral' : ''}
                  `}>
                    {related.opinion} ({(related.confidence * 100).toFixed(0)}%)
                  </span>
                </li>
              ))
            ) : (
              <p className="text-text-muted text-sm">관련 종목이 없습니다.</p>
            )}
          </ul>
        </div>

        {/* 주요 뉴스 기사 */}
        <div className="mb-6">
          <h2 className="text-lg font-heading text-brand-dark mb-3 border-b border-surface-subtle pb-2">주요 뉴스 기사 ({newsCount !== null ? newsCount : '불러오는 중'})</h2>
          <ul className="space-y-4">
            {articles.length > 0 ? (
              articles.map((article, index) => (
                <li key={index} className="bg-surface-subtle p-4 rounded-lg shadow-sm">
                  <a href={article.url} target="_blank" rel="noopener noreferrer" className="block">
                    <h3 className="text-md font-semibold text-brand-dark hover:underline mb-2">{article.title}</h3>
                    {/* Thumbnail Image는 Next/Image를 사용 */}
                    {article.thumbnailUrl && (
                      <Image
                        src={article.thumbnailUrl}
                        alt={article.title}
                        width={200}
                        height={120}
                        style={{ objectFit: 'cover' }}
                        className="rounded-md mb-2 w-full h-auto max-h-[120px]"
                        // 이미지 로드 실패 시 숨김
                        onError={(e) => { e.currentTarget.style.display = 'none'; }}
                      />
                    )}
                    <p className="text-sm text-text-default mb-2">{article.summary}</p>
                    <span className={`text-xs font-medium px-2 py-1 rounded
                      ${article.sentiment === 'POSITIVE' ? 'bg-sentiment-positive text-white' : ''}
                      ${article.sentiment === 'NEGATIVE' ? 'bg-sentiment-negative text-white' : ''}
                      ${article.sentiment === 'NEUTRAL' ? 'bg-sentiment-neutral text-white' : ''}
                      ${article.sentiment === 'UNKNOWN' ? 'bg-gray-400 text-white' : ''}
                    `}>
                      {article.sentiment || 'UNKNOWN'}
                    </span>
                  </a>
                </li>
              ))
            ) : (
              <p className="text-text-muted text-sm">관련 뉴스 기사가 없습니다.</p>
            )}
          </ul>
        </div>

        {/* 면책 조항 */}
        <div className="mt-8 pt-4 border-t border-surface-subtle text-xs text-text-muted text-center">
          <p>{disclaimer}</p>
        </div>
      </div>
    </div>
  );
}

export default StockResultPage;