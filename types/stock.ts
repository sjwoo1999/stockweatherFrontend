// stockweather-frontend/src/types/stock.ts

export interface KeywordSentiment {
    text: string;
    sentiment: 'POSITIVE' | 'NEGATIVE' | 'NEUTRAL';
  }
  
  export interface InvestmentOpinion {
    // 백엔드의 InvestmentOpinion과 일치
    opinion: '매수' | '적정 매수' | '관망' | '적정 매도' | '매도';
    confidence: number; // 0.0 ~ 1.0
    reason?: string; // 백엔드에서 추가된 reason 필드 반영
  }
  
  export interface RelatedStock {
    name: string;
    // 백엔드의 RelatedStock과 일치
    opinion: '매수' | '매도' | '유지' | '관망' | '추가 매수' | '적정 매수';
    confidence: number; // 0.0 ~ 1.0
    relationship?: string; // 백엔드의 relatedStocks에 있는 relationship 필드 반영
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
    sentimentScore: number;
    keywords: KeywordSentiment[];
    reportSummary: string;
    articles: NewsArticleSummary[]; // 요약된 기사 목록 (5개)
    // detailedAnalysis 필드를 객체 타입으로 변경
    detailedAnalysis: {
      positiveFactors: string;
      negativeFactors: string;
      neutralFactors: string;
      overallOpinion: string;
    };
    investmentOpinion: InvestmentOpinion;
    relatedStocks: RelatedStock[];
    overallNewsSummary?: string; // 전체 뉴스 요약
  }
  
  // 최종적으로 클라이언트에 전송될 DTO (WebSocket 응답 형식)
  export interface StockWeatherResponseDto {
    stock: StockData; // StockData 인터페이스 사용
    weatherIcon: 'sunny' | 'partly-cloudy' | 'cloudy' | 'rainy' | 'stormy' | 'unknown';
    timestamp: string;
    disclaimer: string;
    error?: string; // 에러 메시지
    query?: string; // 검색 쿼리
    newsCount?: number; // 백엔드에서 추가된 필드 반영
    socketId?: string; // 백엔드에서 추가된 필드 반영
  }
  
  // Socket.IO 이벤트에서 사용되는 DTO와 인터페이스를 여기에 정의합니다.
  export interface AnalysisProgressData {
    status: string;
    message: string;
    query: string;
    socketId: string;
  }
  
  // 서버 -> 클라이언트 이벤트 정의
  export interface ServerToClientEvents {
    analysisProgress: (data: AnalysisProgressData) => void;
    processingComplete: (data: StockWeatherResponseDto | { error: string, query?: string, socketId?: string }) => void;
  }
  
  // 클라이언트 -> 서버 이벤트 정의 (현재 사용되지 않지만 정의)
  export interface ClientToServerEvents {
    // noop: () => void; // 예시: 클라이언트에서 백엔드로 보내는 이벤트가 있다면 여기에 정의
  }