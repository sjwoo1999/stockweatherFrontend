import React, { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { FaArrowLeft } from 'react-icons/fa';
import {
  StockWeatherResponseDto,
  AnalysisProgressData,
  KeywordSentiment,
  RelatedStock,
  DisclosureItem,
} from '../types/stock';
import { useSocket } from '../contexts/SocketContext';
import {
  FiSun,
  FiCloud,
  FiCloudDrizzle,
  FiCloudLightning,
  FiCloudOff,
} from 'react-icons/fi';
import LoadingSpinner from '../components/LoadingSpinner';

function StockResultPage() {
  const router = useRouter();
  const isReady = router.isReady; // ✅ Next.js router.isReady 사용

  const {
    socket,
    requestingSocketId,
    setRequestingSocketId,
    processingResult,
    setProcessingResult,
  } = useSocket();

  const queryFromUrl = router.query.query as string;
  const socketIdFromUrl = router.query.socketId as string;
  const corpCodeFromUrl = router.query.corpCode as string;

  const [stockName, setStockName] = useState<string | null>(null);
  const [corpCode, setCorpCode] = useState<string | null>(null);
  const [displayResult, setDisplayResult] = useState<StockWeatherResponseDto | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [analysisStatus, setAnalysisStatus] = useState<AnalysisProgressData | null>(null);

  useEffect(() => {
    if (!isReady) return; // ✅ router.query 완전히 준비될 때까지 대기

    const token = localStorage.getItem('jwtToken');
    if (!token) {
      router.replace('/login');
      return;
    }

    if (!queryFromUrl || !socketIdFromUrl || !corpCodeFromUrl) {
      setError('유효하지 않은 접근입니다. 필요한 정보가 누락되었습니다.');
      setLoading(false);
      return;
    }

    setRequestingSocketId(socketIdFromUrl);
    setStockName(queryFromUrl ? decodeURIComponent(queryFromUrl) : null);
    setCorpCode(corpCodeFromUrl ? decodeURIComponent(corpCodeFromUrl) : null);

    const stored = sessionStorage.getItem('latestProcessingResult');
    if (stored) {
      const parsed = JSON.parse(stored);
      if (parsed.stock && parsed.query === queryFromUrl && parsed.stock.code === corpCodeFromUrl) {
        setDisplayResult(parsed);
        setError(parsed.error || null);
      } else {
        setDisplayResult(null);
        setError(null);
      }
      setLoading(false);
    }

    return () => {
      setRequestingSocketId(null);
      setAnalysisStatus(null);
      setProcessingResult(null);
    };
  }, [
    isReady, // ✅ 추가됨
    router,
    queryFromUrl,
    socketIdFromUrl,
    corpCodeFromUrl,
    setRequestingSocketId,
    setProcessingResult,
  ]);

  useEffect(() => {
    if (!socket) return;

    const handleAnalysisProgress = (data: AnalysisProgressData) => {
      if (data.socketId === requestingSocketId) {
        setAnalysisStatus(data);
      }
    };

    socket.on('analysisProgress', handleAnalysisProgress);

    return () => {
      socket.off('analysisProgress', handleAnalysisProgress);
    };
  }, [socket, requestingSocketId]);

  useEffect(() => {
    const isCurrentRequestProcessingResult =
      processingResult &&
      processingResult.query === queryFromUrl &&
      processingResult.stock?.code === corpCodeFromUrl &&
      processingResult.socketId === requestingSocketId;

    if (isCurrentRequestProcessingResult) {
      setDisplayResult(processingResult);
      setLoading(false);
      setError(processingResult.error || null);
      if (!processingResult.error) {
        sessionStorage.setItem('latestProcessingResult', JSON.stringify(processingResult));
      }
    }
  }, [processingResult, queryFromUrl, corpCodeFromUrl, requestingSocketId]);

  const getWeatherIconComponent = useCallback((iconName: string | undefined) => {
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

  // --- UI 렌더링 ---

  // 로딩 상태: queryFromUrl, corpCodeFromUrl가 있고 displayResult가 없거나,
  // analysisStatus가 현재 요청과 일치하지 않을 때
  if (loading || (stockName && corpCode && !displayResult && (!analysisStatus || analysisStatus.query !== queryFromUrl || analysisStatus.corpCode !== corpCodeFromUrl))) {
    const currentMessage = analysisStatus?.message || `AI가 '${stockName || '종목'}'의 주식 전망을 분석하고 있어요.`;
    return (
      <LoadingSpinner message={currentMessage} currentStep={analysisStatus?.message} />
    );
  }

  // 오류 또는 필수 데이터 누락 상태:
  // displayResult가 없거나, stockName/corpCode가 없거나,
  // 또는 displayResult.stock 자체가 없을 때 오류 화면을 보여줍니다.
  if (error || !displayResult || !stockName || !corpCode || !displayResult.stock) { // <-- 이 부분에 !displayResult.stock 추가
    return (
      <div className="min-h-screen bg-brand-light flex justify-center items-center font-body text-text-default">
        <div className="w-[393px] flex flex-col items-center justify-center text-center p-6">
          <p className="mb-4 text-sm text-red-500 font-body">
            오류: {error || '분석 결과를 불러오는 데 실패했습니다.'}
            {/* displayResult.stock이 없을 때의 추가 메시지 */}
            {!displayResult?.stock && displayResult && !error && ' (종목 데이터가 불완전합니다.)'}
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

  // --- displayResult 및 stock 데이터 해체 ---
  // 이 시점에서는 displayResult와 displayResult.stock이 null/undefined가 아님이 TypeScript에 의해 보장됩니다.
  const { stock, weatherIcon, timestamp, disclaimer, newsCount } = displayResult;
  const { name, weatherSummary, keywords, investmentOpinion, detailedAnalysis, relatedStocks, articles: disclosures, overallNewsSummary } = stock; // <-- 안전하게 비구조화

  return (
    <div className="min-h-screen bg-brand-light flex flex-col items-center py-12 px-4 font-body text-text-default">
      <Head>
        <title>{name} - 주식 날씨</title>
      </Head>

      <div className="w-full max-w-md bg-surface-base flex flex-col px-6 py-8 shadow-lg rounded-xl">

        {/* 상단 */}
        <div className="flex justify-between items-center mb-8">
          <button
            onClick={() => router.push('/dashboard')}
            className="flex items-center justify-center w-10 h-10 rounded-full text-brand-primary bg-surface-subtle shadow-md hover:bg-brand-primary/10 transition-colors duration-200"
            aria-label="대시보드로 돌아가기"
          >
            <FaArrowLeft size={18} />
          </button>
        </div>

        {/* 주식 요약 */}
        <div className="text-center mb-section">
          <h1 className="text-3xl font-heading text-brand-dark mb-2">{name}</h1>
          <div className="flex items-center justify-center mb-2">
            {getWeatherIconComponent(weatherIcon)}
            <p className="text-4xl font-bold text-brand-primary ml-2">{weatherSummary}</p>
          </div>
          <p className="text-sm text-text-muted mb-1">{timestamp}</p>
          <p className="text-sm text-text-muted">공시 보고서 수: {newsCount}</p>
          <div className="section-card mt-4">
            <p className="text-sm text-text-muted mb-2">
              <span className="font-semibold text-brand-dark">데이터 출처: DART(금융감독원 전자공시시스템)</span>
            </p>
            <p>{overallNewsSummary || "공시 요약이 없습니다."}</p>
          </div>
        </div>

        {/* 핵심 키워드 */}
        <div className="mb-section">
          <h2 className="section-title">핵심 키워드</h2>
          <div className="flex flex-wrap gap-2">
            {keywords && keywords.length > 0 ? (
              keywords.map((keyword: KeywordSentiment, index: number) => (
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
        <div className="mb-section">
          <h2 className="section-title">투자 의견</h2>
          {investmentOpinion ? (
            <div className="text-center bg-brand-primary text-white rounded-lg p-4 shadow-md">
              <p className="text-2xl font-bold mb-1">{investmentOpinion.opinion}</p>
              <p className="text-sm">확신도: {(investmentOpinion.confidence * 100).toFixed(0)}%</p>
              {investmentOpinion.reason && (
                <p className="mt-2 text-sm italic">{investmentOpinion.reason}</p>
              )}
            </div>
          ) : (
            <p className="text-text-muted text-sm text-center">투자 의견을 불러올 수 없습니다.</p>
          )}
        </div>

        {/* 상세 분석 */}
        <div className="mb-section">
          <h2 className="section-title">상세 분석</h2>
          {detailedAnalysis ? (
            <div className="space-y-3 section-card">
              <p><strong>긍정적 요인:</strong> {detailedAnalysis.positiveFactors || '없음'}</p>
              <p><strong>부정적 요인:</strong> {detailedAnalysis.negativeFactors || '없음'}</p>
              <p><strong>중립적 요인:</strong> {detailedAnalysis.neutralFactors || '없음'}</p>
              <p><strong>전반적인 의견:</strong> {detailedAnalysis.overallOpinion || '없음'}</p>
            </div>
          ) : (
            <p className="text-text-muted text-sm text-center">상세 분석 내용을 불러올 수 없습니다.</p>
          )}
        </div>

        {/* 관련 종목 */}
        <div className="mb-section">
          <h2 className="section-title">관련 종목</h2>
          <ul className="space-y-2">
            {relatedStocks && relatedStocks.length > 0 ? (
              relatedStocks.map((related: RelatedStock, index: number) => (
                <li key={index} className="section-card flex justify-between items-center text-sm">
                  <span>{related.name}</span>
                  <span className={`font-semibold
                    ${related.opinion === '매수' ? 'text-sentiment-positive' : ''}
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

        {/* 주요 공시 보고서 */}
        <div className="mb-section">
          <h2 className="section-title">주요 공시 보고서 ({newsCount})</h2>
          <ul className="space-y-4">
            {disclosures && disclosures.length > 0 ? (
              disclosures.map((disclosure: DisclosureItem, index: number) => (
                <li key={index} className="section-card">
                  <a
                    href={disclosure.url || `https://dart.fss.or.kr/dsaf001/main.do?rcpNo=${disclosure.rcept_no}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block"
                  >
                    <h3 className="text-md font-semibold text-brand-dark hover:underline mb-2">
                      {disclosure.report_nm} ({disclosure.rcept_dt})
                    </h3>
                    {disclosure.summary && (
                      <p className="text-sm text-text-default mb-2">{disclosure.summary}</p>
                    )}
                    <p className="text-xs text-text-muted">
                      제출인: {disclosure.flr_nm || disclosure.corp_name} | 접수번호: {disclosure.rcept_no}
                    </p>
                  </a>
                </li>
              ))
            ) : (
              <p className="text-text-muted text-sm">관련 공시 보고서가 없습니다.</p>
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