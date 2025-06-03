// stockweather-frontend/src/pages/stock-result.tsx

import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Debug from 'debug';

const log = Debug('stockweather:stock-result');

import { StockWeatherResponseDto, KeywordSentiment } from '../types/stock';

interface StockAnalysisResult extends StockWeatherResponseDto {}

export default function StockResultPage() {
  const router = useRouter();
  const [analysisResult, setAnalysisResult] = useState<StockAnalysisResult | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    log('useEffect 실행됨. localStorage에서 데이터 로드 시도.');
    const storedData = localStorage.getItem('stockWeatherData');
    debugger; // ✨ 이 라인에 debugger 추가 ✨

    log('localStorage.getItem("stockWeatherData") 결과:', storedData);

    if (storedData) {
      try {
        const data: StockAnalysisResult = JSON.parse(storedData);
        log('localStorage 데이터 파싱 성공:', data);

        if (data && data.stock && data.stock.name && data.timestamp) {
          setAnalysisResult(data);
          localStorage.removeItem('stockWeatherData');
          log('데이터 유효성 검사 통과 및 상태 업데이트 완료.');
          setLoading(false);
        } else {
          log('파싱된 데이터의 형식이 유효하지 않습니다. 리다이렉트:', data);
          router.replace('/dashboard?error=invalid_result_data_format');
        }
      } catch (e) {
        log('localStorage 데이터 파싱 오류 발생:', e);
        router.replace('/dashboard?error=parse_failed');
      }
    } else {
      log('localStorage에 "stockWeatherData" 데이터가 없습니다. 대시보드로 리다이렉트.');
      router.replace('/dashboard?error=no_data');
    }
  }, [router]);

  if (loading || !analysisResult) {
    return (
      <div className="min-h-screen bg-[#FFF5F5] flex flex-col justify-center items-center">
        <Head>
          <title>로딩 중 - StockWeather</title>
        </Head>
        <div className="spinner">
          {[...Array(8)].map((_, i) => (
            <span key={i}></span>
          ))}
        </div>
        <p className="mt-4 text-base text-gray-600 font-medium">분석 결과 로딩 중...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FFF5F5] p-4 text-gray-800">
      <Head>
        <title>{analysisResult.stock.name} 분석 - StockWeather</title>
      </Head>

      <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6 mt-8">
        <h1 className="text-3xl font-extrabold text-center mb-6 text-indigo-700">
          {analysisResult.stock.name} 날씨 분석
        </h1>

        <div className="mb-4 text-center">
          <p className="text-xl font-semibold mb-2">{analysisResult.stock.weatherSummary}</p>
          <img src={`/icons/${analysisResult.weatherIcon}.svg`} alt={analysisResult.weatherIcon} className="w-24 h-24 mx-auto" />
        </div>

        <div className="mb-4">
          <h2 className="text-lg font-bold mb-1 text-indigo-600">종합 감정:</h2>
          <p className={`text-md font-medium ${
            analysisResult.stock.overallSentiment === 'POSITIVE' ? 'text-green-600' :
            analysisResult.stock.overallSentiment === 'NEGATIVE' ? 'text-red-600' : 'text-gray-600'
          }`}>
            {analysisResult.stock.overallSentiment} (점수: {analysisResult.stock.sentimentScore.toFixed(2)})
          </p>
        </div>

        <div className="mb-4">
          <h2 className="text-lg font-bold mb-1 text-indigo-600">리포트 요약:</h2>
          <p className="text-gray-700 leading-relaxed">{analysisResult.stock.reportSummary}</p>
        </div>

        {analysisResult.stock.keywords && analysisResult.stock.keywords.length > 0 && (
          <div className="mb-4">
            <h2 className="text-lg font-bold mb-1 text-indigo-600">주요 키워드:</h2>
            <div className="flex flex-wrap gap-2">
              {analysisResult.stock.keywords.map((keyword: KeywordSentiment, index: number) => (
                <span key={index} className="bg-indigo-100 text-indigo-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                  {keyword.text}
                </span>
              ))}
            </div>
          </div>
        )}

        {analysisResult.stock.investmentOpinion && (
          <div className="mb-4">
            <h2 className="text-lg font-bold mb-1 text-indigo-600">투자 의견:</h2>
            <p className="text-gray-700">
              {analysisResult.stock.investmentOpinion.opinion} (신뢰도: {analysisResult.stock.investmentOpinion.confidence.toFixed(2)})
            </p>
          </div>
        )}

        {analysisResult.stock.detailedAnalysis && (
          <div className="mb-4">
            <h2 className="text-lg font-bold mb-1 text-indigo-600">상세 분석:</h2>
            <p className="text-gray-700 leading-relaxed">{analysisResult.stock.detailedAnalysis}</p>
          </div>
        )}

        {analysisResult.stock.relatedStocks && analysisResult.stock.relatedStocks.length > 0 && (
          <div className="mb-4">
            <h2 className="text-lg font-bold mb-1 text-indigo-600">관련 종목:</h2>
            <p className="text-gray-700">{analysisResult.stock.relatedStocks.join(', ')}</p>
          </div>
        )}

        <h2 className="text-xl font-bold mt-6 mb-3 text-indigo-700">관련 뉴스 기사</h2>
        {analysisResult.stock.articles && analysisResult.stock.articles.length > 0 ? (
          <ul className="space-y-4">
            {analysisResult.stock.articles.map((article, index) => (
              <li key={index} className="bg-gray-50 p-4 rounded-md shadow-sm">
                <a href={article.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline text-base font-semibold block mb-1">
                  {article.title}
                </a>
                <p className="text-sm text-gray-700 leading-snug">{article.summary}</p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-600">관련 기사가 없습니다.</p>
        )}

        <p className="mt-8 text-xs text-gray-500 text-center">
          {analysisResult.disclaimer}
        </p>

        <p className="text-xs text-gray-500 text-center mt-2">
          분석 시각: {new Date(analysisResult.timestamp).toLocaleString()}
        </p>

        <button
          onClick={() => router.replace('/dashboard')}
          className="mt-8 w-full px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition duration-300 ease-in-out"
        >
          메인으로 돌아가기
        </button>
      </div>
    </div>
  );
}