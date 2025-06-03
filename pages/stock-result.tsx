// stockweather-frontend/src/pages/stock-result.tsx

import React, { useEffect, useState, useContext } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Image from 'next/image';
import axios from 'axios';
import { SocketContext } from '../pages/_app'; // _app.tsx에서 정의한 Context를 임포트

// Socket.IO 이벤트 타입 정의 (이제 _app.tsx에서 정의된 타입을 사용)
interface AnalysisProgressData {
    status: string;
    message: string;
    query: string;
    socketId: string;
}

interface StockWeatherResponseDto {
    // 실제 DTO 구조에 맞춰 정의
    stock: {
        name: string;
        weatherSummary: string;
        reportSummary: string;
        detailedAnalysis: string;
        investmentOpinion: { opinion: string; confidence: number };
        keywords: { text: string; sentiment: 'POSITIVE' | 'NEGATIVE' | 'NEUTRAL' }[];
        relatedStocks: { name: string; opinion: string; confidence: number }[];
    };
    articles: { title: string; url: string; summary: string; thumbnailUrl?: string }[];
    weatherIcon: 'sunny' | 'partly-cloudy' | 'cloudy' | 'rainy' | 'stormy' | 'unknown';
    disclaimer: string;
    socketId?: string; // 백엔드에서 socketId를 포함하여 보내는 경우를 대비
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

            // 백엔드에서 받은 socketId가 이 페이지를 연 요청의 socketId와 일치하는지 확인
            if ('socketId' in data && data.socketId === requestSocketId) {
                if ('error' in data && data.error) {
                    setError(data.error);
                    setLoadingMessage(`오류 발생: ${data.error}`);
                } else {
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

    // 분석 결과가 없으면 (데이터 수신 실패 등)
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
                    <p className="text-text-default text-sm leading-relaxed whitespace-pre-wrap">
                        {stockAnalysisResult.stock.detailedAnalysis}
                    </p>
                    <div className="mt-3 text-sm text-text-muted">
                        <p><strong>의견:</strong> {stockAnalysisResult.stock.investmentOpinion.opinion}</p>
                        <p><strong>신뢰도:</strong> {(stockAnalysisResult.stock.investmentOpinion.confidence * 100).toFixed(0)}%</p>
                    </div>
                </div>

                {stockAnalysisResult.stock.keywords && stockAnalysisResult.stock.keywords.length > 0 && (
                    <div className="mb-6">
                        <h4 className="text-lg font-heading text-brand-dark mb-2 border-b border-surface-subtle pb-1">핵심 키워드</h4>
                        <div className="flex flex-wrap gap-2">
                            {stockAnalysisResult.stock.keywords.map((keyword, index) => (
                                <span
                                    key={index}
                                    className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                        keyword.sentiment === 'POSITIVE' ? 'bg-green-100 text-green-700' :
                                        keyword.sentiment === 'NEGATIVE' ? 'bg-red-100 text-red-700' :
                                        'bg-gray-100 text-gray-700'
                                    }`}
                                >
                                    {keyword.text}
                                </span>
                            ))}
                        </div>
                    </div>
                )}

                {stockAnalysisResult.articles && stockAnalysisResult.articles.length > 0 && (
                    <div className="mb-6">
                        <h4 className="text-lg font-heading text-brand-dark mb-2 border-b border-surface-subtle pb-1">관련 뉴스 요약 (TOP 5)</h4>
                        <div className="space-y-4">
                            {stockAnalysisResult.articles.map((article, index) => (
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
                )}

                {stockAnalysisResult.stock.relatedStocks && stockAnalysisResult.stock.relatedStocks.length > 0 && (
                    <div className="mb-6">
                        <h4 className="text-lg font-heading text-brand-dark mb-2 border-b border-surface-subtle pb-1">관련 종목</h4>
                        <ul className="list-disc list-inside text-text-default text-sm">
                            {stockAnalysisResult.stock.relatedStocks.map((relStock, index) => (
                                <li key={index}>
                                    <strong>{relStock.name}:</strong> {relStock.opinion} (신뢰도: {(relStock.confidence * 100).toFixed(0)}%)
                                </li>
                            ))}
                        </ul>
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