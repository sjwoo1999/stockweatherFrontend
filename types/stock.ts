// stockweather-frontend/src/types/stock.ts (새 파일 또는 dashboard.tsx에 추가)

export interface KeywordSentiment {
    text: string;
    sentiment: 'POSITIVE' | 'NEGATIVE' | 'NEUTRAL';
  }
  
  export interface InvestmentOpinion {
    opinion: '매수' | '매도' | '유지' | '관망';
    confidence: number; // 0.0 ~ 1.0
  }
  
  export interface RelatedStock {
    name: string;
    opinion: '매수' | '매도' | '유지' | '관망';
    confidence: number; // 0.0 ~ 1.0
  }
  
  export interface NewsArticleSummary {
    title: string;
    summary: string;
    url: string;
    thumbnailUrl?: string;
    sentiment?: string;
  }
  
  export interface StockWeatherResponseDto {
    stock: {
      name: string;
      weatherSummary: string;
      overallSentiment: 'VERY_POSITIVE' | 'POSITIVE' | 'NEUTRAL' | 'NEGATIVE' | 'VERY_NEGATIVE' | 'UNKNOWN';
      sentimentScore: number;
      keywords: KeywordSentiment[];
      reportSummary: string;
      articles: NewsArticleSummary[]; // 요약된 기사 목록 (5개)
      detailedAnalysis: string;
      investmentOpinion: InvestmentOpinion;
      relatedStocks: RelatedStock[];
      overallNewsSummary?: string; // 전체 뉴스 요약
    };
    weatherIcon: 'sunny' | 'partly-cloudy' | 'cloudy' | 'rainy' | 'stormy' | 'unknown';
    timestamp: string;
    disclaimer: string;
    articles?: NewsArticleSummary[]; // 최상위 레벨에도 articles 필드 추가 (프론트엔드 편리성)
    error?: string; // 에러 메시지
    query?: string; // 검색 쿼리
  }