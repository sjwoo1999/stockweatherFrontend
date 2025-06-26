// src/pages/dashboard.tsx

import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Image from 'next/image';
import { FaSearch, FaArrowRight, FaTimesCircle } from 'react-icons/fa';
import axios from 'axios';
import { useSocket } from '../contexts/SocketContext';
import axiosInstance from '../api/axiosInstance';
import { getJwtToken, deleteCookie } from '../utils/cookieUtils';
import {
  SuggestedStock,
  User,
  AnalysisProgressData,
  StockWeatherResponseDto // 수정된 StockWeatherResponseDto 사용
} from '../types/stock';
import { searchStock, fetchStockSuggestions } from '../services/stockService';
import LoadingSpinner from '../components/LoadingSpinner';
import { waitForSocketConnection, isSocketHealthy } from '../libs/socketUtils'; // 🔥 새로운 유틸리티 import
import SocketStatusMonitor from '../components/SocketStatusMonitor'; // 🔥 소켓 상태 모니터 추가

const MIN_LOADING_DURATION = 1500;

function DashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const [_appLoading, setAppLoading] = useState<boolean>(true);
  const [_error, setError] = useState<string | null>(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [recentSearches, setRecentSearches] = useState<SuggestedStock[]>([]);
  const [suggestedStocks, setSuggestedStocks] = useState<SuggestedStock[]>([]);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [selectedCorpCode, setSelectedCorpCode] = useState<string | null>(null); // 종목 코드
  const [selectedStockName, setSelectedStockName] = useState<string | null>(null); // 종목명
  const [loadingSuggestions, setLoadingSuggestions] = useState<boolean>(false);

  const [isAnalysisLoading, setIsAnalysisLoading] = useState(false);
  const [analysisMessage, setAnalysisMessage] = useState('분석 준비 중...');
  const analysisStartTime = useRef<number | null>(null);
  const currentAnalysisSocketId = useRef<string | null>(null);

  const router = useRouter();
  const { socket, /*socketId,*/ socketConnected, setRequestingSocketId, isSocketReady } = useSocket();

  const fetchUserProfileAndRecentSearches = useCallback(async () => {
    try {
      setAppLoading(true);
      setError(null);

      const userResponse = await axiosInstance.get<User>('/users/me');
      setUser(userResponse.data);

      const storedSearches = localStorage.getItem('recentSearches');
      if (storedSearches) {
        const parsedSearches: SuggestedStock[] = JSON.parse(storedSearches);
        // 저장된 최근 검색어가 유효한지 확인하고 필터링
        setRecentSearches(parsedSearches.filter(item => item.code && item.name));
      }
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.status === 401) {
        handleLogout();
      } else {
        setError('사용자 정보를 불러오는 중 오류 발생');
      }
    } finally {
      setAppLoading(false);
    }
  }, []);

  useEffect(() => {
    const token = getJwtToken();
    if (!token) {
      router.replace('/login');
      return;
    }
    fetchUserProfileAndRecentSearches();
  }, [router, fetchUserProfileAndRecentSearches]);

  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (searchTerm.trim().length > 0) {
        setLoadingSuggestions(true);
        try {
          const mappedSuggestions = await fetchStockSuggestions(searchTerm);
          setSuggestedStocks(mappedSuggestions);
          // 검색창의 텍스트가 정확히 제안된 종목명과 일치하지 않으면 선택된 종목 초기화
          const exactMatch = mappedSuggestions.find(s => s.name.toLowerCase() === searchTerm.toLowerCase());
          if (exactMatch) {
            setSelectedCorpCode(exactMatch.code);
            setSelectedStockName(exactMatch.name);
          } else {
            setSelectedCorpCode(null);
            setSelectedStockName(null);
          }
        } /*catch (err) {
          setSuggestedStocks([]);
          setSelectedCorpCode(null);
          setSelectedStockName(null);
        }*/ finally {
          setLoadingSuggestions(false);
        }
      } else {
        setSuggestedStocks([]);
        setSelectedCorpCode(null);
        setSelectedStockName(null);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);

  const navigateToStockResult = useCallback((processingResult: StockWeatherResponseDto) => {
    sessionStorage.setItem('latestProcessingResult', JSON.stringify(processingResult));
  
    // 오류 응답인 경우 stock-result 페이지로 이동하지 않음
    if (processingResult.error) {
      // 오류 메시지를 alert 등으로 사용자에게 표시
      alert(`분석 중 오류 발생: ${processingResult.error}`);
      return;
    }

    const url = {
      pathname: '/stock-result',
      query: {
        query: processingResult.query,
        corpCode: processingResult.stock?.code || '',
        socketId: processingResult.socketId || '',
      },
    };
    router.push(url);
  }, [router]);

  // stopAnalysisProcess 함수는 이제 항상 StockWeatherResponseDto를 받도록 변경
  const stopAnalysisProcess = useCallback((processingResultData: StockWeatherResponseDto) => {
    const elapsedTime = Date.now() - (analysisStartTime.current || 0);
    const remainingTime = MIN_LOADING_DURATION - elapsedTime;

    const navigateOrDisplay = () => {
      setIsAnalysisLoading(false);
      setAnalysisMessage('분석 준비 중...'); // 메시지 초기화
      analysisStartTime.current = null;
      currentAnalysisSocketId.current = null;
      setRequestingSocketId(null);

      // StockWeatherResponseDto에 error 속성이 있으면 오류 처리, 없으면 결과 페이지로 이동
      if (processingResultData.error) {
        // 이미 navigateToStockResult에서 alert를 처리하므로 여기서는 추가 alert 생략
        // 혹은 여기서 특정 에러 UI를 표시할 수 있습니다.
        setError(processingResultData.error); // 에러 상태 업데이트
      } else {
        navigateToStockResult(processingResultData);
      }
    };

    if (remainingTime > 0) {
      setTimeout(navigateOrDisplay, remainingTime);
    } else {
      navigateOrDisplay();
    }
  }, [navigateToStockResult, setRequestingSocketId]);

  const waitForSocketReady = useCallback(() => {
    return waitForSocketConnection(socket, 15000); // 🔥 유틸리티 함수 사용
  }, [socket]);

  const startAnalysisProcess = useCallback(async (query: string, corpCode: string) => {
    try {
      await waitForSocketReady(); // socket 안정화 기다리기
  
      const latestSocketId = socket?.id;
      if (!latestSocketId || !isSocketHealthy(socket)) { // 🔥 유틸리티 함수로 검증 강화
        setError('서버와 실시간 연결이 불안정합니다. 페이지를 새로고침 후 다시 시도해주세요.');
        return;
      }
  
      if (isAnalysisLoading) return; // 이미 분석 중이면 중복 실행 방지
  
      setError(null); // 새로운 분석 시작 시 기존 에러 초기화
      setIsAnalysisLoading(true);
      setAnalysisMessage(`'${query}' 분석을 시작합니다...`);
      analysisStartTime.current = Date.now();
      currentAnalysisSocketId.current = latestSocketId;
      setRequestingSocketId(latestSocketId); // ✅ requestingSocketId 업데이트
  
      // 🔥 소켓 상태 재확인
      await new Promise(resolve => setTimeout(resolve, 200)); // 🔥 200ms로 증가
  
      // 🔥 소켓 ID가 여전히 유효한지 재확인
      if (!isSocketHealthy(socket) || socket?.id !== latestSocketId) { // 🔥 유틸리티 함수 사용
        throw new Error('소켓 연결이 변경되었습니다. 다시 시도해주세요.');
      }
  
      console.log(`[startAnalysisProcess] searchStock 호출! socketId=${latestSocketId}`);
      await searchStock(query, latestSocketId, corpCode);
  
      setAnalysisMessage(`'${query}' 공시 데이터를 분석 중...`);
    } catch (err) {
      const errorMessage = axios.isAxiosError(err)
        ? err.response?.data?.message || '분석 요청에 실패했습니다.'
        : err instanceof Error
          ? err.message
          : '알 수 없는 오류가 발생했습니다.';
  
      stopAnalysisProcess({
        query,
        socketId: socket?.id || '',
        error: errorMessage,
      });
  
      setError(errorMessage);
    }
  }, [socket, isAnalysisLoading, setRequestingSocketId, stopAnalysisProcess, waitForSocketReady]);

  // handleProcessingComplete도 StockWeatherResponseDto를 받도록 수정
  const handleProcessingComplete = useCallback((data: StockWeatherResponseDto) => {
    // 무조건 처리 (일시적 socketId mismatch 대응)
    stopAnalysisProcess(data);
  
    // 최근 검색어 업데이트 로직 유지
    if (!data.error && data.stock?.code) {
      const currentSelectedStock: SuggestedStock = {
        name: data.query,
        code: data.stock.code,
        stock_code: data.stock.stockCode,
      };
      const updatedRecentSearches = [
        currentSelectedStock,
        ...recentSearches.filter(item => item.code !== currentSelectedStock.code)
      ].slice(0, 5);
      setRecentSearches(updatedRecentSearches);
      localStorage.setItem('recentSearches', JSON.stringify(updatedRecentSearches));
    }
  }, [stopAnalysisProcess, recentSearches]);

  useEffect(() => {
    if (!socket) return;

    socket.on('analysisProgress', (data: AnalysisProgressData) => {
      if (currentAnalysisSocketId.current === data.socketId) {
        setAnalysisMessage(data.message);
      }
    });

    socket.on('processingComplete', handleProcessingComplete);

    return () => {
      socket.off('analysisProgress');
      socket.off('processingComplete', handleProcessingComplete);
    };
  }, [socket, handleProcessingComplete]);

  const handleLogout = () => {
    deleteCookie('jwtToken');
    const KAKAO_LOGOUT_REDIRECT_URI = process.env.NEXT_PUBLIC_KAKAO_LOGOUT_REDIRECT_URI || 'http://localhost:3001/login';
    const KAKAO_AUTH_LOGOUT_URL = `https://kauth.kakao.com/oauth/logout?client_id=${process.env.NEXT_PUBLIC_KAKAO_CLIENT_ID}&logout_redirect_uri=${encodeURIComponent(KAKAO_LOGOUT_REDIRECT_URI)}`;
    window.location.href = KAKAO_AUTH_LOGOUT_URL;
  };

  // 새로운 함수: 종목 클릭 (제안 or 최근 검색) 시 공통 처리
  const handleStockSelectionAndAnalysis = useCallback((stock: SuggestedStock) => {
    setSearchTerm(stock.name); // 검색창에 종목명 설정
    setSelectedCorpCode(stock.code); // 선택된 종목 코드 설정
    setSelectedStockName(stock.name); // 선택된 종목명 설정
    setSuggestedStocks([]); // 제안 목록 닫기
    setIsSearchFocused(false); // 검색창 포커스 해제
    startAnalysisProcess(stock.name, stock.code); // 분석 시작
  }, [startAnalysisProcess]);

  // 제안된 종목 클릭 핸들러
  const handleSuggestedStockClick = (stock: SuggestedStock) => {
    handleStockSelectionAndAnalysis(stock);
  };

  // 최근 검색 종목 클릭 핸들러
  const handleRecentSearchClick = (item: SuggestedStock) => {
    handleStockSelectionAndAnalysis(item);
  };

  const handleSearchButtonClick = () => {
    const query = searchTerm.trim();
    if (!query) {
      alert('검색어를 입력해주세요.');
      return;
    }

    if (selectedCorpCode && selectedStockName) { // 이미 정확히 선택된 종목이 있다면 바로 분석 시작
      startAnalysisProcess(selectedStockName, selectedCorpCode);
    } else if (suggestedStocks.length > 0) {
      // 제안 목록이 있고, 검색어와 일치하는 것이 있다면 첫 번째 제안 사용
      const exactMatch = suggestedStocks.find(s => s.name.toLowerCase() === query.toLowerCase());
      if (exactMatch) {
        startAnalysisProcess(exactMatch.name, exactMatch.code);
      } else {
        alert('정확한 종목명을 선택하거나 목록에서 선택해주세요.');
      }
    } else {
      alert('정확한 종목명을 선택하거나 목록에서 선택해주세요.');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearchButtonClick();
    }
  };  

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    // 입력 중에는 선택된 종목 정보를 초기화하여, 새로운 검색/제안이 되도록 유도
    setSelectedCorpCode(null);
    setSelectedStockName(null);
  };  

  const clearSearchTerm = () => {
    setSearchTerm('');
    setSuggestedStocks([]);
    setSelectedCorpCode(null);
    setSelectedStockName(null);
  };  

  // --- 메인 대시보드 UI 렌더링 ---
  return (
    <div className="min-h-screen bg-brand-light flex flex-col items-center py-12 relative">
      <Head>
        <title>대시보드 - StockWeather</title>
      </Head>

      <div className="w-full max-w-md bg-surface-base flex flex-col justify-start px-8 py-10 shadow-lg rounded-xl">

        {/* 프로필 이미지 및 환영 메시지 */}
        <div className="mb-8 text-center">
          {user?.profileImage && (
            <div className="w-28 h-28 rounded-full overflow-hidden mx-auto mb-4 border-2 border-surface-subtle shadow-md">
              <Image
                src={user.profileImage}
                alt="프로필 이미지"
                width={112}
                height={112}
                style={{ objectFit: 'cover' }}
                onError={(e) => {
                  e.currentTarget.src = '/default-profile.png';
                }}
                priority
              />
            </div>
          )}
          <h1 className="text-2xl font-heading mb-2 text-brand-dark">
            환영합니다, <span className="text-brand-primary">{user?.nickname || '이름 없음'}</span>님!
          </h1>
        </div>

        {/* 섹션 제목 */}
        <h2 className="text-center font-heading text-xl mb-6 text-brand-dark">
          어떤 종목에 대한 정보를 원하시나요?
        </h2>

        {/* 검색 입력창 디자인 */}
        <div className="relative flex items-center bg-surface-subtle px-4 py-2 rounded-full shadow-sm w-full mb-2">
          <FaSearch className="text-brand-primary mr-3 text-xl" />
          <input
            type="text"
            placeholder="예: 삼성전자"
            className="text-text-default flex-1 text-base bg-transparent outline-none placeholder-text-muted font-body"
            value={searchTerm}
            onChange={handleInputChange}
            onKeyPress={handleKeyPress}
            onFocus={() => setIsSearchFocused(true)}
            // onBlur를 setTimeout으로 감싸는 이유: 클릭 이벤트가 발생하기 전에 포커스가 해제되어 목록이 사라지는 것을 방지
            onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}
            disabled={isAnalysisLoading} // 분석 중에는 입력 비활성화
          />
          {searchTerm && (
            <button
              onClick={clearSearchTerm}
              className="ml-2 text-text-muted hover:text-brand-dark transition-colors duration-200"
              aria-label="검색어 지우기"
            >
              <FaTimesCircle size={18} />
            </button>
          )}
          <button
            onClick={handleSearchButtonClick}
            className="ml-3 bg-brand-primary text-white rounded-full w-10 h-10 flex items-center justify-center shadow-md hover:bg-brand-primary/90 transition-colors duration-200"
            aria-label="검색"
            disabled={isAnalysisLoading} // 분석 중에는 버튼 비활성화
          >
            <FaArrowRight size={18} />
          </button>

          {/* 종목 제안 목록 */}
          {isSearchFocused && searchTerm.length > 0 && suggestedStocks.length > 0 && (
            <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-lg mt-2 z-10 max-h-60 overflow-y-auto">
              {loadingSuggestions && <p className="p-2 text-center text-sm text-text-muted">검색 중...</p>}
              <ul className="divide-y divide-gray-100">
                {suggestedStocks.map((stock) => (
                  <li
                    key={stock.code}
                    className="px-4 py-2 hover:bg-gray-50 cursor-pointer text-text-default text-sm"
                    onClick={() => handleSuggestedStockClick(stock)}
                  >
                    {stock.name}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {/* 검색 결과가 없을 때 메시지 */}
          {isSearchFocused && searchTerm.length > 0 && !loadingSuggestions && suggestedStocks.length === 0 && (
            <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-lg mt-2 z-10 p-4 text-center text-sm text-text-muted">
              검색 결과가 없습니다.
            </div>
          )}
        </div>

        {/* 선택된 종목 표시 (옵션) */}
        {selectedStockName && !isAnalysisLoading && ( // 분석 중에는 이 메시지 대신 로딩 스피너
          <p className="text-sm text-text-muted text-center mb-6">
            선택된 종목: <span className="font-semibold text-brand-dark">{selectedStockName}</span>
          </p>
        )}

        {/* 최근 검색 종목 섹션 */}
        <div className="mt-8 flex-grow">
          <h3 className="text-lg font-heading text-brand-dark mb-4 border-b border-surface-subtle pb-2">최근 검색 종목</h3>
          <ul className="space-y-3">
            {recentSearches.length > 0 ? (
              recentSearches.map((item) => (
                <li
                  key={item.code}
                  className="py-3 px-4 bg-surface-base rounded-md shadow-sm border border-surface-subtle hover:bg-brand-light cursor-pointer transition-colors duration-200 flex justify-between items-center font-body text-text-default"
                  onClick={() => handleRecentSearchClick(item)}
                >
                  <span>{item.name}</span>
                  <FaArrowRight className="text-brand-primary text-sm" />
                </li>
              ))
            ) : (
              <li className="text-center text-text-muted font-body py-4">최근 검색 기록이 없습니다.</li>
            )}
          </ul>
        </div>

        {/* 로그아웃 버튼 */}
        <button
          onClick={handleLogout}
          className="w-full mt-8 py-3 rounded-md text-base font-body bg-surface-subtle text-red-500 hover:bg-red-500/10 transition-colors duration-200 shadow-md"
        >
          로그아웃
        </button>
      </div>

      {/* AI 분석 로딩 스피너 (최상위로 렌더링) */}
      {isAnalysisLoading && (
        <LoadingSpinner message={analysisMessage} />
      )}

      {/* 소켓 상태 모니터 */}
      <SocketStatusMonitor />
    </div>
  );
}

export default DashboardPage;