// stockweather-frontend/src/types/stock.ts (새 파일 또는 dashboard.tsx에 추가)

export interface KeywordSentiment {
    text: string;
    sentiment: 'POSITIVE' | 'NEGATIVE' | 'NEUTRAL';
  }
  
  export interface InvestmentOpinion {
    // 🚨 수정: 백엔드의 InvestmentOpinion과 일치시키기 위해 '유지'를 '관망'으로 변경
    // 백엔드의 InvestmentOpinion은 '매수' | '적정 매수' | '관망' | '적정 매도' | '매도' 로 정의되어 있으므로
    // 프론트엔드에서도 이에 맞춰 수정하는 것이 좋습니다.
    // 여기서는 백엔드 StockData와 StockWeatherResponseDto의 InvestmentOpinion에 맞게 수정합니다.
    opinion: '매수' | '적정 매수' | '관망' | '적정 매도' | '매도'; // 백엔드와 동일하게 변경
    confidence: number; // 0.0 ~ 1.0
    reason?: string; // 백엔드에서 추가된 reason 필드 반영
  }
  
  export interface RelatedStock {
    name: string;
    // 🚨 수정: 백엔드의 RelatedStock과 일치시키기 위해 opinion 필드 수정
    opinion: '매수' | '매도' | '유지' | '관망' | '추가 매수' | '적정 매수'; // 백엔드와 동일하게 변경
    confidence: number; // 0.0 ~ 1.0
    relationship?: string; // 백엔드의 relatedStocks에 있는 relationship 필드 반영
  }
  
  export interface NewsArticleSummary {
    title: string;
    summary: string;
    url: string;
    thumbnailUrl?: string;
    // 🚨 수정: 백엔드의 NewsArticleSummary의 sentiment는 특정 문자열 리터럴 유니온 타입
    sentiment?: 'POSITIVE' | 'NEGATIVE' | 'NEUTRAL' | 'UNKNOWN'; // 백엔드와 동일하게 변경
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
    // 🚨 중요 수정: detailedAnalysis 필드를 객체 타입으로 변경
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
    // articles?: NewsArticleSummary[]; // 🚨 삭제: stock.articles에 이미 포함되어 있으므로 중복
    error?: string; // 에러 메시지
    query?: string; // 검색 쿼리
    newsCount?: number; // 백엔드에서 추가된 필드 반영
    socketId?: string; // 백엔드에서 추가된 필드 반영
  }