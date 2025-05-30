// stockweather-frontend/src/services/stockService.ts
import { StockSearchResult, StockSummary, StockDetail } from '@/types/stock';
import axiosInstance from '@/api/axiosInstance'; // axiosInstance 임포트

/**
 * 특정 종목을 검색하는 API 호출 함수
 * @param query 검색할 종목명
 * @returns StockSearchResult 타입의 검색 결과
 */
export async function searchStock(query: string): Promise<StockSearchResult> {
  try {
    // ⭐️⭐️⭐️ 이 부분이 백엔드 컨트롤러 (@Controller('stock') 및 @Get('search'))에 정의된 경로와 일치합니다! ⭐️⭐️⭐️
    const response = await axiosInstance.get<StockSearchResult>(`/stock/search`, {
      params: { query }, // 쿼리 파라미터로 전달
    });
    return response.data;
  } catch (error) {
    console.error('searchStock API 호출 실패:', error);
    throw error;
  }
}

/**
 * 사용자 관심 종목 요약 정보를 가져오는 API 호출 함수
 * @returns StockSummary 배열 (실제로는 하나의 요약 객체를 포함할 수 있음)
 */
export async function fetchUserSummary(): Promise<StockSummary[]> {
  try {
    // 백엔드 API 경로가 /users/summary로 변경되었으므로 수정
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
    // 백엔드 API 경로가 /users/detail로 변경되었으므로 수정
    const response = await axiosInstance.get<StockDetail[]>(`/users/detail`);
    return response.data;
  } catch (error) {
    console.error('fetchUserDetail API 호출 실패:', error);
    throw error;
  }
}