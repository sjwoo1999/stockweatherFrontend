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
    noArg: () => void;
    basicEmit: (a: number, b: string) => void;
    withAck: (d: string, callback: (e: number) => void) => void;
  
    // 서버 -> 클라이언트 진행 상황 업데이트
    analysisProgress: (data: AnalysisProgressData) => void;
    // 서버 -> 클라이언트 최종 결과
    processingComplete: (data: StockWeatherResponseDto) => void;
  
    // 'error' 이벤트를 명시적으로 추가
    'error': (error: Error) => void;
  }
  
  // 클라이언트 -> 서버 이벤트 정의
  export interface ClientToServerEvents {
    // noop: () => void; // 예시: 클라이언트에서 백엔드로 보내는 이벤트가 있다면 여기에 정의
  }
  
  // my-detail.tsx에서 사용될 StockDetail 인터페이스
  export interface StockDetail {
    name: string;
    emoji: string;
    color: string; // Tailwind CSS class name (e.g., 'text-red-500')
    signal: string; // (e.g., '매수', '매도', '유지')
    percent: string; // (e.g., '+5.2%', '-1.3%')
  }
  
  // my-summary.tsx에서 사용될 StockSummary 인터페이스
  export interface StockSummary {
    date: string; // 예: "2023-10-27"
    overallSentiment: string; // 예: "전반적으로 긍정적입니다."
    stocks: { // 각 종목의 요약을 담는 배열
      name: string;
      summary: string; // 종목별 요약 텍스트
    }[];
  }
  
  // ⭐ 새로 추가될 StockSearchResult 인터페이스 ⭐
  // searchStock 함수가 단일 객체를 반환하므로, 해당 객체의 구조를 가정합니다.
  // 이는 검색 성공 시 반환될 수 있는 단일 종목의 기본 정보일 가능성이 높습니다.
  // 만약 검색 API가 여러 결과를 배열로 반환한다면, Promise<StockSearchResult[]>로 수정해야 합니다.
  export interface StockSearchResult {
    name: string; // 검색된 종목의 이름
    symbol?: string; // 종목 코드/심볼 (예: "005930", "AAPL")
    // 여기에 백엔드 검색 API의 응답에 따라 필요한 다른 필드를 추가할 수 있습니다.
    // 예를 들어, isFound: boolean; message?: string; 등.
  }