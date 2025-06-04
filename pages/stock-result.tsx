// stockweather-frontend/src/pages/stock-result.tsx

import React, { useEffect, useState, useContext } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Image from 'next/image';
import axios from 'axios';
import { SocketContext } from '../pages/_app'; // _app.tsx에서 정의한 Context를 임포트

// --- 백엔드의 types/stock.ts와 동기화된 DTO 인터페이스 정의 ---
// 중요: 이 부분은 백엔드 `stockweather-backend/src/types/stock.ts`와 동일하게 유지해야 합니다.
// 가능하면 하나의 공유된 타입 파일을 사용하는 것이 가장 좋습니다.

export interface KeywordSentiment {
    text: string;
    sentiment: 'POSITIVE' | 'NEGATIVE' | 'NEUTRAL';
}

export interface InvestmentOpinion {
    // 백엔드의 InvestmentOpinion과 일치
    opinion: '매수' | '적정 매수' | '관망' | '적정 매도' | '매도';
    confidence: number; // 0.0 ~ 1.0
    reason?: string; // 백엔드에서 추가된 reason 필드 반영 (사용하지 않더라도 타입 정의에 포함)
}

export interface RelatedStock {
    name: string;
    // 백엔드의 RelatedStock과 일치 (여기서 opinion 필드는 백엔드와 다를 수 있으니 확인 필요)
    // 백엔드 RelatedStock 인터페이스에 opinion 필드가 없으면 여기서 제거하거나,
    // 백엔드에서 opinion과 confidence를 추가해야 합니다.
    // 현재 백엔드 RelatedStock은 name과 relationship만 있습니다.
    // 일단 백엔드에 맞춰 수정하겠습니다.
    relationship?: string; // 백엔드의 relatedStocks에 있는 relationship 필드 반영 (사용하지 않더라도 타입 정의에 포함)
}

export interface NewsArticleSummary {
    title: string;
    summary: string;
    url: string;
    thumbnailUrl?: string;
    // 백엔드의 NewsArticleSummary의 sentiment와 일치
    sentiment?: 'POSITIVE' | 'NEGATIVE' | 'NEUTRAL' | 'UNKNOWN';
}

// 백엔드의 StockData 인터페이스에 해당하는 프론트엔드용 인터페이스
export interface StockData {
    name: string;
    weatherSummary: string;
    overallSentiment: 'VERY_POSITIVE' | 'POSITIVE' | 'NEUTRAL' | 'NEGATIVE' | 'VERY_NEGATIVE' | 'UNKNOWN';
    sentimentScore: number; // 백엔드에 존재
    keywords: string[]; // 🚨 수정: AIAnalysisResult에서 keywords는 string[] 입니다. KeywordSentiment[]가 아님.
    reportSummary: string;
    articles: NewsArticleSummary[]; // 요약된 기사 목록 (5개)
    // 🚨 중요 수정: detailedAnalysis 필드를 백엔드와 동일한 객체 타입으로 변경
    detailedAnalysis: {
        positiveFactors: string;
        negativeFactors: string;
        neutralFactors: string;
        overallOpinion: string;
    };
    investmentOpinion: InvestmentOpinion;
    relatedStocks: RelatedStock[];
    overallNewsSummary?: string; // 전체 뉴스 요약 (백엔드에 존재)
}

// 최종적으로 클라이언트에 전송될 DTO (WebSocket 응답 형식)
export interface StockWeatherResponseDto {
    stock: StockData; // StockData 인터페이스 사용
    weatherIcon: 'sunny' | 'partly-cloudy' | 'cloudy' | 'rainy' | 'stormy' | 'unknown';
    timestamp: string; // 백엔드에 존재
    disclaimer: string;
    error?: string; // 에러 메시지
    query?: string; // 검색 쿼리
    newsCount?: number; // 백엔드에 존재
    socketId?: string; // 백엔드에 존재
}
// --- DTO 인터페이스 정의 끝 ---


// Socket.IO 이벤트 타입 정의 (이제 _app.tsx에서 정의된 타입을 사용)
interface AnalysisProgressData {
    status: string;
    message: string;
    query: string;
    socketId: string;
}

// 로딩 스피너 컴포넌트
const LoadingSpinner: React.FC<{ message: string }> = ({ message }) => (
    <div className="min-h-screen bg-brand-light flex justify-center items-center font-body text-text-default">
        <div className="w-[393px] flex flex-col items-center justify-center text-center p-6 bg-surface-base rounded-lg shadow-md">
            <p className="mb-4 text-lg font-bold text-brand-dark">
                {message}
            </p>
            <div className="spinner">
                {[...Array(8)].map((_, i) => (
                    <span key={i}></span>
                ))}
            </div>
            <p className="mt-4 text-xs text-text-muted">
                (이 작업은 5-10초 정도 소요될 수 있습니다.)
            </p>
            <style jsx>{`
                .spinner {
                    width: 40px;
                    height: 40px;
                    position: relative;
                }
                .spinner span {
                    display: block;
                    width: 10px;
                    height: 10px;
                    background-color: #6a67eb; /* brand-primary */
                    border-radius: 50%;
                    position: absolute;
                    animation: bounce 1.2s infinite ease-in-out;
                }
                .spinner span:nth-child(1) { top: 0; left: 15px; animation-delay: -1.0s; }
                .spinner span:nth-child(2) { top: 5px; right: 0; animation-delay: -0.9s; }
                .spinner span:nth-child(3) { top: 15px; right: 0; animation-delay: -0.8s; }
                .spinner span:nth-child(4) { bottom: 5px; right: 5px; animation-delay: -0.7s; }
                .spinner span:nth-child(5) { bottom: 0; left: 15px; animation-delay: -0.6s; }
                .spinner span:nth-child(6) { bottom: 5px; left: 5px; animation-delay: -0.5s; }
                .spinner span:nth-child(7) { top: 15px; left: 0; animation-delay: -0.4s; }
                .spinner span:nth-child(8) { top: 5px; left: 5px; animation-delay: -0.3s; }

                @keyframes bounce {
                    0%, 100% { transform: scale(0); opacity: 0; }
                    50% { transform: scale(1); opacity: 1; }
                }
            `}</style>
        </div>
    </div>
);

function StockResultPage() {
    const router = useRouter();
    // dashboard에서 전달된 쿼리 파라미터: 검색어와 해당 요청의 소켓 ID
    const { query: stockQuery, socketId: requestSocketId } = router.query;

    const [stockAnalysisResult, setStockAnalysisResult] = useState<StockWeatherResponseDto | null>(null);
    const [loading, setLoading] = useState<boolean>(true); // 분석 결과 로딩 상태
    const [error, setError] = useState<string | null>(null);
    // 초기 로딩 메시지 설정 (첫 번째 로딩 메시지)
    const [loadingMessage, setLoadingMessage] = useState('주식 날씨 정보 분석을 시작합니다...');

    // _app.tsx의 SocketContext에서 전역 소켓 인스턴스 정보 가져오기
    const { socket, socketId: currentConnectedSocketId, socketConnected } = useContext(SocketContext);

    useEffect(() => {
        // 클라이언트 측에서만 실행되도록 보장
        if (typeof window === 'undefined') return;

        // 라우터가 아직 준비되지 않았거나, 필수 쿼리 파라미터가 없으면 기다림
        if (!router.isReady || !stockQuery || typeof stockQuery !== 'string' || !requestSocketId || typeof requestSocketId !== 'string') {
            // 이 상태에서 이미 로딩이 끝났거나 결과/에러가 있다면 추가 메시지를 표시하지 않음
            if (!loading && !stockAnalysisResult && !error) {
                setError('분석에 필요한 정보가 부족합니다. 대시보드로 돌아가 다시 시도해주세요.');
                setLoading(false);
            }
            return;
        }

        const token = localStorage.getItem('jwtToken');
        if (!token) {
            setError('인증 토큰이 없습니다. 로그인 페이지로 돌아갑니다.');
            setLoading(false);
            setTimeout(() => router.replace('/login'), 3000);
            return;
        }

        // SocketContext에서 소켓이 유효하고 연결된 상태인지 확인
        // 소켓이 연결되지 않았거나, Context에서 소켓을 받지 못했다면 기다림
        if (!socket || !socketConnected || !currentConnectedSocketId) {
            setLoadingMessage('서버와 실시간 연결을 기다리는 중입니다...');
            // 이 경우, useEffect는 socket/socketConnected 값이 변경될 때까지 다시 실행됩니다.
            return;
        }

        // --- Socket.IO 이벤트 리스너 등록 ---
        // analysisProgress 이벤트: 중간 진행 상황 메시지 업데이트 (두 번째 로딩 메시지)
        const handleAnalysisProgress = (data: AnalysisProgressData) => {
            console.log('analysisProgress 수신:', data);
            // 백엔드에서 받은 socketId가 이 페이지를 연 요청의 socketId와 일치하는지 확인
            if (data.socketId === requestSocketId) {
                setLoadingMessage(data.message);
            } else {
                console.warn('다른 요청에 대한 analysisProgress 수신:', data);
            }
        };
        // processingComplete 이벤트: 최종 결과 수신 및 로딩 해제
        const handleProcessingComplete = (data: StockWeatherResponseDto | { error: string, query?: string, socketId?: string }) => {
            console.log('processingComplete 수신:', data);
            setLoading(false); // 로딩 종료

            // 🚨 디버깅을 위한 로그 추가: 수신된 기사 데이터 확인
            if ('stock' in data && data.stock && data.stock.articles) {
                console.log(`[stock-result.tsx] Received articles count: ${data.stock.articles.length}`);
                if (data.stock.articles.length > 0) {
                    console.log(`[stock-result.tsx] First received article:`, data.stock.articles[0]);
                }
            } else {
                console.log(`[stock-result.tsx] No stock or articles data in received response:`, data);
            }

            // 백엔드에서 받은 socketId가 이 페이지를 연 요청의 socketId와 일치하는지 확인
            if ('socketId' in data && data.socketId === requestSocketId) {
                if ('error' in data && data.error) {
                    // 백엔드에서 명시적으로 에러를 보낸 경우 (예: 서버 내부 오류)
                    setError(data.error);
                    setLoadingMessage(`오류 발생: ${data.error}`);
                } else if ('stock' in data && data.stock && data.stock.newsCount === 0) {
                    // 🚨 수정된 로직: 뉴스가 없는 경우 (백엔드에서 error 필드 없이 보냄)
                    // 이 경우 StockService에서 설정한 메시지를 사용하거나, 별도의 메시지를 표시
                    const noNewsMessage = data.stock.reportSummary || '관련 뉴스 기사를 찾을 수 없습니다.';
                    setError(noNewsMessage); // 에러 상태로 처리하여 별도의 UI를 띄움
                    setLoadingMessage(`분석 불가: ${noNewsMessage}`);
                } else {
                    // 정상적인 분석 결과가 있는 경우
                    setStockAnalysisResult(data as StockWeatherResponseDto);
                    setLoadingMessage('분석 완료!');
                    setError(null);
                }
            } else {
                console.warn('다른 요청에 대한 processingComplete 수신:', data);
            }
        };

        // 이펙트 실행 시마다 리스너 중복 등록 방지를 위해 기존 리스너 제거 후 다시 등록
        socket.off('analysisProgress', handleAnalysisProgress);
        socket.on('analysisProgress', handleAnalysisProgress);

        socket.off('processingComplete', handleProcessingComplete);
        socket.on('processingComplete', handleProcessingComplete);

        // 클린업 함수: 컴포넌트 언마운트 또는 이펙트 재실행 시 리스너만 해제
        return () => {
            console.log(`Cleaning up StockResultPage listeners for query: ${stockQuery}`);
            if (socket) {
                socket.off('analysisProgress', handleAnalysisProgress);
                socket.off('processingComplete', handleProcessingComplete);
            }
        };
    }, [
        router.isReady,
        stockQuery,
        requestSocketId, // 이 페이지가 어떤 요청에 대한 응답을 기다리는지 식별하는 ID
        socket,          // _app.tsx에서 제공하는 소켓 인스턴스
        socketConnected, // 소켓 연결 상태 (Context에서 가져옴)
        currentConnectedSocketId, // 현재 앱에 연결된 소켓 ID (Context에서 가져옴)
        stockAnalysisResult, // 상태 변화에 따라 이펙트 재실행 필요 시 (클린업 로직에 영향)
        error              // 상태 변화에 따라 이펙트 재실행 필요 시 (클린업 로직에 영향)
    ]);


    // 쿼리 파라미터가 없거나 유효하지 않으면 초기 렌더링 시 오류 메시지 표시
    // 이 부분은 useEffect 내부의 로직과 함께 초기 사용자 경험을 빠르게 피드백하는 역할을 합니다.
    if (!router.isReady || !stockQuery || typeof stockQuery !== 'string' || !requestSocketId || typeof requestSocketId !== 'string') {
        return (
            <div className="min-h-screen bg-brand-light flex justify-center items-center font-body text-text-default">
                <div className="w-[393px] flex flex-col items-center justify-center text-center p-6 bg-surface-base rounded-lg shadow-md">
                    <p className="mb-4 text-sm text-red-500 font-body">
                        잘못된 접근입니다. 대시보드에서 검색을 시작해주세요.
                    </p>
                    <button
                        onClick={() => router.replace('/dashboard')}
                        className="mt-4 bg-brand-primary text-white px-6 py-2 rounded-md text-sm font-semibold shadow-sm hover:bg-brand-primary/90 transition-colors duration-200 font-body"
                    >
                        대시보드로 돌아가기
                    </button>
                </div>
            </div>
        );
    }

    // 로딩 중이거나 에러 발생 시 UI
    if (loading) {
        return <LoadingSpinner message={loadingMessage} />;
    }

    // 🚨 수정된 부분: 에러 발생 시의 UI (뉴스 부족 상황 포함)
    if (error) {
        return (
            <div className="min-h-screen bg-brand-light flex justify-center items-center font-body text-text-default">
                <div className="w-full max-w-md bg-surface-base flex flex-col items-center justify-center text-center p-6 shadow-lg rounded-xl">
                    <p className="mb-4 text-sm text-red-500 font-body">
                        오류: {error}
                    </p>
                    <button
                        onClick={() => router.replace('/dashboard')}
                        className="mt-4 bg-brand-primary text-white px-6 py-2 rounded-md text-sm font-semibold shadow-sm hover:bg-brand-primary/90 transition-colors duration-200 font-body"
                    >
                        대시보드로 돌아가기
                    </button>
                </div>
            </div>
        );
    }

    // 분석 결과가 없으면 (데이터 수신 실패 등 - 사실상 위 error 처리로 대부분 커버됨)
    if (!stockAnalysisResult) {
        return (
            <div className="min-h-screen bg-brand-light flex justify-center items-center font-body text-text-default">
                <div className="w-full max-w-md bg-surface-base flex flex-col items-center justify-center text-center p-6 shadow-lg rounded-xl">
                    <p className="mb-4 text-sm text-text-muted font-body">
                        주식 분석 결과를 불러올 수 없습니다. 다시 검색해주세요.
                    </p>
                    <button
                        onClick={() => router.replace('/dashboard')}
                        className="w-full mt-8 py-3 rounded-md text-base font-body bg-brand-primary text-white hover:bg-brand-primary/90 transition-colors duration-200 shadow-md"
                    >
                        새로운 종목 검색하기
                    </button>
                </div>
            </div>
        );
    }

    // 성공적으로 결과 수신 시 UI
    return (
        <div className="min-h-screen bg-brand-light flex flex-col items-center py-12 px-4">
            <Head>
                <title>{stockAnalysisResult.stock.name} 주식 날씨 - StockWeather</title>
            </Head>

            <div className="w-full max-w-md bg-surface-base flex flex-col justify-start px-8 py-10 shadow-lg rounded-xl">

                <h3 className="text-2xl font-heading text-brand-dark text-center mb-4">
                    {stockAnalysisResult.stock.name} 주식 날씨
                    <span className="ml-2 text-3xl">
                        {stockAnalysisResult.weatherIcon === 'sunny' && '☀️'}
                        {stockAnalysisResult.weatherIcon === 'partly-cloudy' && '🌤️'}
                        {stockAnalysisResult.weatherIcon === 'cloudy' && '☁️'}
                        {stockAnalysisResult.weatherIcon === 'rainy' && '🌧️'}
                        {stockAnalysisResult.weatherIcon === 'stormy' && '⛈️'}
                        {stockAnalysisResult.weatherIcon === 'unknown' && '❓'}
                    </span>
                </h3>
                <p className="text-center text-lg text-text-default mb-4">
                    {stockAnalysisResult.stock.weatherSummary}
                </p>

                <div className="mb-6">
                    <h4 className="text-lg font-heading text-brand-dark mb-2 border-b border-surface-subtle pb-1">AI 요약 리포트</h4>
                    <p className="text-text-default text-sm leading-relaxed whitespace-pre-wrap">
                        {stockAnalysisResult.stock.reportSummary}
                    </p>
                </div>

                <div className="mb-6">
                    <h4 className="text-lg font-heading text-brand-dark mb-2 border-b border-surface-subtle pb-1">AI 투자 조언</h4>
                    {/* 🚨 수정된 부분: detailedAnalysis는 이제 객체이므로 내부 필드에 접근합니다. */}
                    <p className="text-text-default text-sm leading-relaxed whitespace-pre-wrap">
                        <strong>긍정 요인:</strong> {stockAnalysisResult.stock.detailedAnalysis.positiveFactors}<br />
                        <strong>부정 요인:</strong> {stockAnalysisResult.stock.detailedAnalysis.negativeFactors}<br />
                        <strong>중립 요인:</strong> {stockAnalysisResult.stock.detailedAnalysis.neutralFactors}<br />
                        <br />
                        <strong>종합 의견:</strong> {stockAnalysisResult.stock.detailedAnalysis.overallOpinion}
                    </p>
                    <div className="mt-3 text-sm text-text-muted">
                        <p><strong>의견:</strong> {stockAnalysisResult.stock.investmentOpinion.opinion}</p>
                        <p><strong>신뢰도:</strong> {(stockAnalysisResult.stock.investmentOpinion.confidence * 100).toFixed(0)}%</p>
                        {stockAnalysisResult.stock.investmentOpinion.reason && (
                            <p><strong>이유:</strong> {stockAnalysisResult.stock.investmentOpinion.reason}</p>
                        )}
                    </div>
                </div>

                {/* 🚨 수정된 부분: keywords는 string[] 이므로, sentiment 관련 코드는 제거 */}
                {stockAnalysisResult.stock.keywords && stockAnalysisResult.stock.keywords.length > 0 && (
                    <div className="mb-6">
                        <h4 className="text-lg font-heading text-brand-dark mb-2 border-b border-surface-subtle pb-1">핵심 키워드</h4>
                        <div className="flex flex-wrap gap-2">
                            {stockAnalysisResult.stock.keywords.map((keyword, index) => (
                                <span
                                    key={index}
                                    className={`px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-700`} // 키워드에 색상 없음
                                >
                                    {keyword}
                                </span>
                            ))}
                        </div>
                    </div>
                )}

                {stockAnalysisResult.stock.articles && stockAnalysisResult.stock.articles.length > 0 ? ( // stock.articles로 접근
                    <div className="mb-6">
                        <h4 className="text-lg font-heading text-brand-dark mb-2 border-b border-surface-subtle pb-1">관련 뉴스 요약 (TOP 5)</h4>
                        <div className="space-y-4">
                            {stockAnalysisResult.stock.articles.map((article, index) => ( // stock.articles로 접근
                                <a
                                    key={index}
                                    href={article.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="block p-4 bg-surface-subtle rounded-md shadow-sm hover:shadow-md transition-shadow duration-200"
                                >
                                    <div className="flex items-center">
                                        {article.thumbnailUrl && (
                                            <div className="flex-shrink-0 w-20 h-20 rounded-md overflow-hidden mr-4">
                                                <Image
                                                    src={article.thumbnailUrl}
                                                    alt={article.title}
                                                    width={80}
                                                    height={80}
                                                    style={{ objectFit: 'cover' }}
                                                />
                                            </div>
                                        )}
                                        <div>
                                            <h5 className="font-semibold text-text-default text-base mb-1">{article.title}</h5>
                                            <p className="text-text-muted text-sm line-clamp-2">{article.summary}</p>
                                        </div>
                                    </div>
                                </a>
                            ))}
                        </div>
                    </div>
                ) : ( // 기사 없을 때 표시되는 메시지 (이 부분은 위 에러 처리로 대부분 대체됨)
                    <div className="mb-6">
                        <h4 className="text-lg font-heading text-brand-dark mb-2 border-b border-surface-subtle pb-1">관련 뉴스 요약</h4>
                        <p className="text-text-muted text-sm leading-relaxed">
                            분석에 필요한 뉴스 기사가 부족합니다.
                        </p>
                    </div>
                )}


                {/* 🚨 수정된 부분: RelatedStock 인터페이스 변경에 따라 relStock.opinion/confidence 제거 */}
                {stockAnalysisResult.stock.relatedStocks && stockAnalysisResult.stock.relatedStocks.length > 0 && (
                    <div className="mb-6">
                        <h4 className="text-lg font-heading text-brand-dark mb-2 border-b border-surface-subtle pb-1">관련 종목</h4>
                        <ul className="list-disc list-inside text-text-default text-sm">
                            {stockAnalysisResult.stock.relatedStocks.map((relStock, index) => (
                                <li key={index}>
                                    <strong>{relStock.name}:</strong>
                                    {relStock.relationship && ( // relationship 필드 표시 (백엔드에 존재한다면)
                                        <span className="ml-1 text-xs text-text-muted">({relStock.relationship})</span>
                                    )}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
                {stockAnalysisResult.stock.overallNewsSummary && (
                    <div className="mb-6">
                        <h4 className="text-lg font-heading text-brand-dark mb-2 border-b border-surface-subtle pb-1">종합 뉴스 요약</h4>
                        <p className="text-text-default text-sm leading-relaxed whitespace-pre-wrap">
                            {stockAnalysisResult.stock.overallNewsSummary}
                        </p>
                    </div>
                )}


                <p className="text-xs text-text-muted text-center mt-4">
                    {stockAnalysisResult.disclaimer}
                </p>

                <button
                    onClick={() => router.replace('/dashboard')}
                    className="w-full mt-8 py-3 rounded-md text-base font-body bg-brand-primary text-white hover:bg-brand-primary/90 transition-colors duration-200 shadow-md"
                >
                    새로운 종목 검색하기
                </button>
            </div>
        </div>
    );
}

export default StockResultPage;