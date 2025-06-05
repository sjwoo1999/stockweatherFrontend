// stockweather-frontend/src/services/stockService.ts

import { StockSearchResult, StockSummary, StockDetail, SuggestedStock } from '../types/stock'; // SuggestedStock 타입 추가 임포트
import axiosInstance from '../api/axiosInstance'; // axiosInstance 임포트

/**
 * 특정 종목 분석을 요청하는 API 호출 함수 (Socket.IO 결과 수신)
 * @param query 검색할 종목명
 * @param socketId 클라이언트 소켓 ID
 * @param selectedCorpCode (선택 사항) 사용자가 직접 선택한 corpCode
 * @returns 요청 접수 성공 메시지 (실제 분석 결과는 소켓을 통해 수신)
 */
export async function searchStock(query: string, socketId: string, selectedCorpCode?: string): Promise<{ message: string; query: string; socketId: string }> {
  try {
    const response = await axiosInstance.post<{ message: string; query: string; socketId: string }>(`/api/search`, {
      query,
      socketId,
      selectedCorpCode,
    });
    return response.data;
  } catch (error) {
    console.error('searchStock API 호출 실패:', error);
    if (axiosInstance.isAxiosError(error) && error.response) {
      throw new Error(error.response.data.message || '알 수 없는 검색 요청 오류');
    }
    throw error;
  }
}

/**
 * 종목 검색 제안을 불러오는 API 호출 함수
 * @param query 사용자가 입력한 검색어
 * @returns SuggestedStock[] 배열
 */
export const fetchStockSuggestions = async (query: string): Promise<SuggestedStock[]> => { // <--- 이 함수를 추가해야 합니다!
  try {
    // ⭐️⭐️⭐️ 백엔드의 @Controller('api') 및 @Get('suggest-stocks')에 정의된 경로와 일치합니다! ⭐️⭐️⭐️
    const response = await axiosInstance.get<SuggestedStock[]>(`/api/suggest-stocks?query=${encodeURIComponent(query)}`);
    return response.data;
  } catch (error) {
    console.error("Failed to fetch stock suggestions:", error);
    // 에러 발생 시 빈 배열 반환 또는 에러 throw 선택
    return [];
    // throw error; // 에러를 상위 컴포넌트로 전달하려면 이 줄을 사용
  }
};

/**
 * 사용자 관심 종목 요약 정보를 가져오는 API 호출 함수
 * @returns StockSummary 배열 (실제로는 하나의 요약 객체를 포함할 수 있음)
 */
export async function fetchUserSummary(): Promise<StockSummary[]> {
  try {
    const response = await axiosInstance.get<StockSummary[]>(`/users/summary`);
    return response.data;
  } catch (error) {
    console.error('fetchUserSummary API 호출 실패:', error);
    throw error;
  }
}

/**
 * 사용자 관심 종목 세부 정보를 가져오는 API 호출 함수
 * @returns StockDetail 배열
 */
export async function fetchUserDetail(): Promise<StockDetail[]> {
  try {
    const response = await axiosInstance.get<StockDetail[]>(`/users/detail`);
    return response.data;
  } catch (error) {
    console.error('fetchUserDetail API 호출 실패:', error);
    throw error;
  }
}