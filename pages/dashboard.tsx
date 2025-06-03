// stockweather-frontend/src/pages/dashboard.tsx

import React, { useEffect, useState } from 'react';
import axiosInstance from '../api/axiosInstance';
import axios from 'axios';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Image from 'next/image';
import { FaSearch, FaArrowRight } from 'react-icons/fa';

// User 인터페이스는 기존 그대로 사용
interface User {
  id: number;
  kakaoId: string;
  email?: string;
  nickname: string;
  profileImage?: string;
  createdAt: string;
  updatedAt: string;
}

function DashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [recentSearches, /*setRecentSearches*/] = useState(['카카오', '네이버', 'LG전자']);
  const router = useRouter();

  useEffect(() => {
    // console.log('Dashboard: useEffect 시작');

    if (typeof window === 'undefined') {
      // console.log('Dashboard: 서버 측 렌더링 (SSR) 환경, API 호출 건너뜜.');
      setLoading(false);
      return;
    }

    const token = localStorage.getItem('jwtToken');
    // console.log('Dashboard: localStorage에서 토큰 확인:', token ? '존재함' : '없음');

    if (!token) {
      // console.log('Dashboard: JWT 토큰이 없어 /users/me 호출을 건너뛰고 로그인 페이지로 리다이렉트합니다.');
      setLoading(false);
      router.replace('/login');
      return;
    }

    const fetchUserProfile = async () => {
      // console.log('Dashboard: fetchUserProfile 함수 실행 시작.');
      try {
        setLoading(true);
        setError(null);
        // console.log('Dashboard: /users/me API 호출 시작...');
        const response = await axiosInstance.get<User>('/users/me');
        // console.log('Dashboard: /users/me API 응답 성공:', response.data);
        setUser(response.data);
        // ✨ 여기서 실제 최근 검색 종목 API가 있다면 대체 ✨
        // 예시: const recentResponse = await axiosInstance.get('/api/recent-searches');
        // setRecentSearches(recentResponse.data);
      } catch (err) {
        // console.error('Dashboard: fetchUserProfile 에러 발생:', err);
        if (axios.isAxiosError(err)) {
          // console.error("fetchUserProfile 에러 상세:", err.response?.status, err.response?.data);
          if (err.response?.status === 401) {
            console.log("401 에러 발생: 토큰 만료 또는 유효하지 않음. 강제 로그아웃 처리.");
            handleLogout();
          } else {
            setError(err.message);
          }
        } else {
          setError('사용자 정보를 불러오는 중 알 수 없는 오류가 발생했습니다.');
        }
      } finally {
        setLoading(false);
        // console.log('Dashboard: fetchUserProfile 함수 실행 완료. 로딩 상태:', false);
      }
    };

    fetchUserProfile();
    // console.log('Dashboard: useEffect 끝');
  }, [router]);

  const handleLogout = () => {
    if (typeof window !== 'undefined') {
      // console.log('handleLogout: 로그아웃 시작');
      localStorage.removeItem('jwtToken');
      // console.log('handleLogout: JWT 토큰이 localStorage에서 삭제되었습니다.');

      const KAKAO_LOGOUT_REDIRECT_URI = process.env.NEXT_PUBLIC_KAKAO_LOGOUT_REDIRECT_URI || 'http://localhost:3001/login';
      const KAKAO_AUTH_LOGOUT_URL = `https://kauth.kakao.com/oauth/logout?client_id=${process.env.NEXT_PUBLIC_KAKAO_CLIENT_ID}&logout_redirect_uri=${encodeURIComponent(KAKAO_LOGOUT_REDIRECT_URI)}`;

      // console.log('handleLogout: 카카오 로그아웃 URL로 리다이렉트:', KAKAO_AUTH_LOGOUT_URL);
      window.location.href = KAKAO_AUTH_LOGOUT_URL;
    }
  };

  // ✨ 이 부분을 수정합니다. search-loading 페이지를 거치지 않습니다. ✨
  const handleSearch = () => { // async 키워드 제거 (API 호출은 stock-result에서 할 것이므로)
    if (!searchTerm.trim()) {
      alert('검색어를 입력해주세요.');
      return;
    }
    router.push(`/loading?query=${encodeURIComponent(searchTerm.trim())}`);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  // ✨ 이 부분을 수정합니다. search-loading 페이지를 거치지 않습니다. ✨
  const handleRecentSearchClick = (stockName: string) => {
    router.push(`/loading?query=${encodeURIComponent(stockName)}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-brand-light flex justify-center items-center font-body text-text-default">
        <div className="w-[393px] flex flex-col items-center justify-center text-center p-6">
          <p className="mb-4 text-sm text-text-muted font-body">
            사용자 정보를 불러오는 중입니다...
          </p>
          <div className="spinner">
            {[...Array(8)].map((_, i) => (
              <span key={i}></span>
            ))}
          </div>
        </div>
      </div>
    );
  }
  if (error) {
    return (
      <div className="min-h-screen bg-brand-light flex justify-center items-center font-body text-text-default">
        <div className="w-[393px] flex flex-col items-center justify-center text-center p-6">
          {/* 에러 메시지 색상: brand.accent (붉은색) */}
          <p className="mb-4 text-sm text-brand-accent font-body">
            오류: {error}
          </p>
          <button
            onClick={() => router.replace('/login')}
            className="mt-4 bg-surface-subtle text-text-default px-6 py-2 rounded-md text-sm font-semibold shadow-sm hover:bg-surface-subtle/70 transition-colors duration-200 font-body"
          >
            로그인 페이지로
          </button>
        </div>
      </div>
    );
  }
  if (!user) {
    return (
      <div className="min-h-screen bg-brand-light flex justify-center items-center font-body text-text-default">
        <div className="w-[393px] flex flex-col items-center justify-center text-center p-6">
          <p className="mb-4 text-sm text-text-muted font-body">
            사용자 정보를 가져올 수 없습니다.
          </p>
          <button
            onClick={() => router.replace('/login')}
            className="mt-4 bg-surface-subtle text-text-default px-6 py-2 rounded-md text-sm font-semibold shadow-sm hover:bg-surface-subtle/70 transition-colors duration-200 font-body"
          >
            로그인 페이지로
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-light flex flex-col items-center py-12">
      <Head>
        <title>대시보드 - StockWeather</title>
      </Head>

      {/* 메인 컨테이너 (카드): 이미지와 동일한 깔끔한 흰색 카드 디자인 유지 */}
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
                    objectFit="cover"
                    unoptimized
                />
            </div>
          )}
          {/* 닉네임 색상: brand.accent (붉은색)으로 변경 */}
          <h1 className="text-2xl font-heading mb-2 text-brand-dark">
            환영합니다, <span className="text-brand-accent">{user?.nickname || '이름 없음'}</span>님!
          </h1>
        </div>

        {/* 섹션 제목 */}
        <h2 className="text-center font-heading text-xl mb-6 text-brand-dark">
          어떤 종목에 대한 정보를 원하시나요?
        </h2>

        {/* 검색 입력창 디자인 (primary 색상 적용) */}
        <div className="flex items-center bg-surface-subtle px-4 py-2 rounded-full shadow-sm w-full mb-8">
          {/* 검색 아이콘 색상: brand.primary (파란색) */}
          <FaSearch className="text-brand-primary mr-3 text-xl" />
          <input
            type="text"
            placeholder="예: 삼성전자"
            className="text-text-default flex-1 text-base bg-transparent outline-none placeholder-text-muted font-body"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyPress={handleKeyPress}
          />
          <button
            onClick={handleSearch}
            className="ml-3 bg-brand-primary text-white rounded-full w-10 h-10 flex items-center justify-center shadow-md hover:bg-brand-primary/90 transition-colors duration-200" // 배경: brand.primary (파란색), 텍스트: 흰색
            aria-label="검색"
          >
            <FaArrowRight size={18} />
          </button>
        </div>

        {/* 최근 검색 종목 섹션 */}
        <div className="mt-4 flex-grow">
          <h3 className="text-lg font-heading text-brand-dark mb-4 border-b border-surface-subtle pb-2">최근 검색 종목</h3>
          <ul className="space-y-3">
            {recentSearches.map((item, index) => (
              <li
                key={index}
                className="py-3 px-4 bg-surface-base rounded-md shadow-sm border border-surface-subtle hover:bg-brand-light cursor-pointer transition-colors duration-200 flex justify-between items-center font-body text-text-default"
                onClick={() => handleRecentSearchClick(item)}
              >
                <span>{item}</span>
                {/* 화살표 색상: brand.primary (파란색) */}
                <FaArrowRight className="text-brand-primary text-sm" />
              </li>
            ))}
          </ul>
        </div>

        {/* 로그아웃 버튼 (이미지 참조하여 변경) */}
        <button
          onClick={handleLogout}
          className="w-full mt-8 py-3 rounded-md text-base font-body bg-surface-subtle text-brand-accent hover:bg-brand-accent/10 transition-colors duration-200 shadow-md" // 배경: surface-subtle, 텍스트: brand.accent (붉은색), 호버: brand.accent 10% 불투명
        >
          로그아웃
        </button>
      </div>
    </div>
  );
}

export default DashboardPage;