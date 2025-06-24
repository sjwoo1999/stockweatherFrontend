// stockweather-frontend/src/types/stock.ts

// DART 공시 정보 아이템 (프론트엔드에서도 사용)
export interface DisclosureItem {
    rcept_no: string; // 접수 번호 (DART 고유 식별자)
    corp_name: string; // 회사명
    report_nm: string; // 보고서명
    flr_nm: string; // 제출인 (보고서 제출 회사 이름)
    rcept_dt: string; // 접수 일자 (YYYYMMDD)
    rmk?: string; // 비고 (옵션)
    summary?: string; // AI가 요약한 공시 내용 (옵션)
    url?: string; // 공시 원본 URL (백엔드에서 제공할 경우를 대비)
    reprt_code?: string;
    bsns_year?: string;
  }
  
  export interface KeywordSentiment {
    text: string;
    sentiment: 'POSITIVE' | 'NEGATIVE' | 'NEUTRAL';
  }
  
  export interface InvestmentOpinion {
    opinion: '매수' | '적정 매수' | '관망' | '적정 매도' | '매도';
    confidence: number; // 0.0 ~ 1.0
    reason?: string; // 백엔드에서 추가된 reason 필드 반영
  }
  
  export interface RelatedStock {
    name: string;
    opinion: '매수' | '매도' | '유지' | '관망' | '추가 매수' | '적정 매수';
    confidence: number; // 0.0 ~ 1.0
    relationship?: string; // 백엔드의 relatedStocks에 있는 relationship 필드 반영
  }
  
  // 백엔드의 StockData 인터페이스에 해당하는 프론트엔드용 인터페이스
  export interface StockData {
    name: string;
    code: string; // DART corp_code (필수)
    stockCode?: string; // 주식 시장 종목 코드 (선택적)
    weatherSummary: string;
    overallSentiment: 'VERY_POSITIVE' | 'POSITIVE' | 'NEUTRAL' | 'NEGATIVE' | 'VERY_NEGATIVE' | 'UNKNOWN';
    sentimentScore: number;
    keywords: KeywordSentiment[];
    reportSummary: string; // 전체 공시 요약
    articles: DisclosureItem[]; // DART 공시 정보 목록
    detailedAnalysis: {
      positiveFactors: string;
      negativeFactors: string;
      neutralFactors: string;
      overallOpinion: string;
    };
    investmentOpinion: InvestmentOpinion;
    relatedStocks: RelatedStock[];
    overallNewsSummary?: string; // 백엔드 DTO에 맞게 옵션으로 유지
  }
  
  // 최종적으로 클라이언트에 전송될 DTO (WebSocket 응답 형식)
  export interface StockWeatherResponseDto {
    stock?: StockData; // stock 속성은 오류 시 없을 수 있으므로 옵셔널로 변경
    weatherIcon?: 'sunny' | 'partly-cloudy' | 'cloudy' | 'rainy' | 'stormy' | 'unknown'; // 옵셔널
    timestamp?: string; // 옵셔널
    disclaimer?: string; // 옵셔널
    error?: string; // <-- 이 부분이 핵심 추가: 에러 메시지를 받을 수 있도록 함
    query: string; // 검색 쿼리 (클라이언트 요청 쿼리)
    newsCount?: number | null; // DART 공시 개수
    socketId?: string; // 백엔드에서 해당 분석에 대한 소켓 ID (옵셔널로 변경: 오류 시 없을 수 있음)
  }
  
  // Socket.IO 이벤트에서 사용되는 DTO와 인터페이스를 여기에 정의합니다.
  export interface AnalysisProgressData {
    status?: string; // 백엔드에서 status 필드를 보내지 않는다면 제거해도 무방
    message: string;
    query: string;
    socketId: string;
    corpCode: string;
    progress?: number; // 진행률 (0-100)
  }
  
  // 서버 -> 클라이언트 이벤트 정의 (필요한 이벤트만 유지)
  // processingComplete 이벤트의 data 타입을 StockWeatherResponseDto로 단일화하고,
  // StockWeatherResponseDto 안에 error 속성을 추가하여 처리
  export interface ServerToClientEvents {
    analysisProgress: (data: AnalysisProgressData) => void;
    processingComplete: (data: StockWeatherResponseDto) => void; // 이제 error 속성이 StockWeatherResponseDto 안에 포함됨
    'error': (error: Error) => void; // 일반적인 소켓 에러
    connectionConfirmed: (data: { message: string; socketId: string }) => void; // 🔥 연결 확인 이벤트
    auth_error: (error: { message: string }) => void; // 🔥 인증 에러 이벤트
  }
  
  // 클라이언트 -> 서버 이벤트 정의 (현재 필요 없는 이벤트 제거)
  export interface ClientToServerEvents {
    // 클라이언트에서 서버로 보내는 이벤트가 있다면 여기에 정의
    // 예: 'requestAnalysis': (query: string, corpCode: string, socketId: string) => void;
    // 현재는 HTTP 요청으로 분석 시작하므로 여기에는 필요 없음
  }
  
  // 백엔드에서 공시 정보 검색 제안 응답
  export interface SuggestedStock {
    name: string; // 종목명 (예: "삼성전자")
    code: string; // DART corp_code (고유 식별자, 공시 조회용)
    stock_code?: string; // 주식 시장 종목 코드 (선택 사항, 표시용)
  }
  
  // 백엔드 searchStock API 응답 (HTTP POST)
  export interface SearchResponse {
    message: string;
    query: string;
    socketId: string; // 이 socketId를 통해 소켓 이벤트가 전송됨
    corpCode: string; // 분석 요청된 종목의 DART corp_code
  }
  
  // 사용자 프로필 정보 인터페이스 (Dashboard에서 사용)
  export interface User {
    id: number;
    kakaoId: string;
    email?: string;
    nickname: string;
    profileImage?: string;
    createdAt: string;
    updatedAt: string;
  }

  // my-detail.tsx에서 사용되는 종목 세부 정보 인터페이스 추가
  export interface StockDetail {
    name: string;
    emoji: string;
    signal: string;
    percent: string; // "10%"와 같은 문자열일 경우
    color: string; // TailwindCSS 클래스 문자열 (예: "text-red-500", "text-green-500")
    // 백엔드 응답에 따라 필요한 다른 속성 추가
  }

  // my-summary.tsx에서 사용되는 종목 요약 정보 인터페이스 추가 <-- 이 부분 추가
  export interface StockSummary {
    date: string; // 예: "2023년 10월 26일"
    overallSentiment: string; // 예: "매우 긍정적" 또는 StockData의 overallSentiment와 유사한 타입
    stocks: {
      name: string;
      summary: string; // 종목별 요약 내용
      // 필요한 경우 다른 속성 추가 (예: emoji, signal 등)
    }[];
    // 백엔드 응답에 따라 필요한 다른 속성 추가
  }