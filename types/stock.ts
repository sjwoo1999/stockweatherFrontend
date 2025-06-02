// stockweather-frontend/src/types/stock.ts

// 백엔드 src/types/stock.ts 내용을 기반으로 프론트엔드에 필요한 타입들을 정의합니다.

// 뉴스 기사 요약 정보 (백엔드의 NewsArticleSummary와 동일하게)
export interface NewsArticleSummary {
    title: string;
    summary: string;
    url: string;
    pubDate?: string; // 백엔드에 추가된 필드 반영
}

// 백엔드의 NewsArticle (필요하다면 추가)
// 프론트엔드에서 실제로 이 타입이 사용될 때만 추가하면 됩니다.
// 만약 StockData.articles가 NewsArticleSummary[]라면 이 타입은 필요 없을 수도 있습니다.
export interface NewsArticle {
    title: string;
    link: string;
    summary?: string;
    pubDate?: string;
    source?: string;
}

// 키워드 감성 정보 (백엔드의 KeywordSentiment와 동일하게)
export interface KeywordSentiment {
    text: string;
    sentiment: 'POSITIVE' | 'NEGATIVE' | 'NEUTRAL';
}

// 투자 의견 (백엔드의 InvestmentOpinion와 동일하게)
export interface InvestmentOpinion {
    opinion: '추가 매수' | '적정 매수' | '유지' | '적정 매도' | '추가 매도';
    confidence: number;
}

// 관련 종목 (백엔드의 RelatedStock와 동일하게)
export interface RelatedStock {
    name: string;
    opinion: '추가 매수' | '적정 매수' | '유지' | '적정 매도' | '추가 매도';
    confidence: number;
}

// AI 분석 결과 타입 (백엔드의 AIAnalysisResult와 동일하게, StockData에 통합될 수 있음)
// 만약 AIAnalysisResult가 직접적으로 API 응답에 포함되지 않고 StockData 내부에서만 쓰인다면
// 이 인터페이스 자체는 직접적으로 export해서 쓸 일은 없을 수 있습니다.
// 하지만 백엔드에서 사용하므로 일단 정의는 유지합니다.
export interface AIAnalysisResult {
    weatherSummary: string;
    overallSentiment: 'POSITIVE' | 'NEGATIVE' | 'NEUTRAL' | 'MIXED';
    sentimentScore: number;
    keywords: KeywordSentiment[];
    reportSummary: string;
    detailedAnalysis: string;
    investmentOpinion: InvestmentOpinion;
    relatedStocks: RelatedStock[];
    weatherIcon: string; // StockWeatherResponseDto에도 있어서 중복될 수 있음
}

// StockData 인터페이스 (백엔드의 StockData와 동일하게)
export interface StockData {
    name: string;
    weatherSummary: string;
    overallSentiment: 'POSITIVE' | 'NEGATIVE' | 'NEUTRAL' | 'MIXED';
    sentimentScore: number;
    keywords: KeywordSentiment[];
    reportSummary: string;
    // 백엔드의 articles는 NewsArticleSummary[] 타입입니다.
    articles: NewsArticleSummary[];
    detailedAnalysis: string;
    investmentOpinion: InvestmentOpinion;
    relatedStocks: RelatedStock[];
}

// ✨ 가장 중요한 부분: 백엔드의 최종 응답 DTO를 프론트엔드에도 정의 ✨
// 이전에 NewsArticleSummary와 함께 에러가 났던 StockWeatherResponseDto입니다.
export interface StockWeatherResponseDto {
    stock: StockData;
    weatherIcon: string;
    timestamp: string;
    disclaimer: string;
}


// 사용자 관심 종목 요약/상세 정보를 위한 타입 (기존 프론트엔드에 있던 것과 유사하게 유지)
export interface StockSummaryItem {
    name: string;
    summary: string;
}

export interface StockSummary {
    date: string;
    overallSentiment: string;
    stocks: StockSummaryItem[];
}

// StockDetail (프론트엔드에서 사용하는 추가적인 UI용 타입은 유지)
export interface StockDetail {
    name: string;
    emoji: string;
    signal: string;
    percent: string;
    color: string;
}