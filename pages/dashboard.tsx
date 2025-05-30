// stockweather-frontend/src/pages/dashboard.tsx
import React, { useEffect, useState } from 'react';
import axiosInstance from '../api/axiosInstance';
import axios from 'axios';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { FaSearch, FaArrowRight } from 'react-icons/fa'; // 검색 아이콘 추가
// import Spinner from '../components/Spinner'; // Spinner 컴포넌트 임포트 제거

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
  const [searchTerm, setSearchTerm] = useState(''); // 검색어 상태 추가
  const router = useRouter();

  useEffect(() => {
    console.log('Dashboard: useEffect 시작');

    if (typeof window === 'undefined') {
      console.log('Dashboard: 서버 측 렌더링 (SSR) 환경, API 호출 건너뜜.');
      setLoading(false);
      return;
    }

    const token = localStorage.getItem('jwtToken');
    console.log('Dashboard: localStorage에서 토큰 확인:', token ? '존재함' : '없음');

    if (!token) {
      console.log('Dashboard: JWT 토큰이 없어 /users/me 호출을 건너뛰고 로그인 페이지로 리다이렉트합니다.');
      setLoading(false);
      router.replace('/login');
      return;
    }

    const fetchUserProfile = async () => {
      console.log('Dashboard: fetchUserProfile 함수 실행 시작.');
      try {
        setLoading(true);
        setError(null);
        console.log('Dashboard: /users/me API 호출 시작...');
        const response = await axiosInstance.get<User>('/users/me'); // axiosInstance 사용
        console.log('Dashboard: /users/me API 응답 성공:', response.data);
        setUser(response.data);
      } catch (err) {
        console.error('Dashboard: fetchUserProfile 에러 발생:', err);
        if (axios.isAxiosError(err)) {
          console.error("fetchUserProfile 에러 상세:", err.response?.status, err.message, err.response?.data);
          if (err.response?.status === 401) {
            console.log("401 에러 발생: 토큰 만료 또는 유효하지 않음. 강제 로그아웃 처리.");
            handleLogout(); // 401 에러 시 로그아웃 처리
          } else {
            setError(err.message);
          }
        } else {
          setError('사용자 정보를 불러오는 중 알 수 없는 오류가 발생했습니다.');
        }
      } finally {
        setLoading(false);
        console.log('Dashboard: fetchUserProfile 함수 실행 완료. 로딩 상태:', false);
      }
    };

    fetchUserProfile();
    console.log('Dashboard: useEffect 끝');
  }, [router]); // router 객체의 변화에 반응

  const handleLogout = () => {
    if (typeof window !== 'undefined') {
      console.log('handleLogout: 로그아웃 시작');
      localStorage.removeItem('jwtToken');
      console.log('handleLogout: JWT 토큰이 localStorage에서 삭제되었습니다.');
  
      // 환경 변수 사용을 권장합니다. (NEXT_PUBLIC_KAKAO_LOGOUT_REDIRECT_URI)
      const KAKAO_LOGOUT_REDIRECT_URI = process.env.NEXT_PUBLIC_KAKAO_LOGOUT_REDIRECT_URI || 'http://localhost:3001/login';
      const KAKAO_AUTH_LOGOUT_URL = `https://kauth.kakao.com/oauth/logout?client_id=${process.env.NEXT_PUBLIC_KAKAO_REST_API_KEY}&logout_redirect_uri=${encodeURIComponent(KAKAO_LOGOUT_REDIRECT_URI)}`;
  
      console.log('handleLogout: 카카오 로그아웃 URL로 리다이렉트:', KAKAO_AUTH_LOGOUT_URL);
      window.location.href = KAKAO_AUTH_LOGOUT_URL;
    }
  };

  const handleSearch = () => {
    if (searchTerm.trim()) {
      // 검색어를 URL 쿼리 파라미터로 인코딩하여 search-loading 페이지로 이동
      router.push(`/search-loading?query=${encodeURIComponent(searchTerm.trim())}`);
    } else {
      alert('검색어를 입력해주세요.'); // 사용자에게 검색어 입력 요청
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FFF5F5] flex justify-center items-center">
        <div className="w-[393px] flex flex-col items-center justify-center text-center p-6">
          <p className="mb-4 text-sm text-gray-600 font-medium">
            사용자 정보를 불러오는 중입니다...
          </p>
          {/* globals.css에 정의된 스피너 HTML 구조 직접 사용 */}
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
      <div className="min-h-screen bg-[#FFF5F5] flex justify-center items-center">
        <div className="w-[393px] flex flex-col items-center justify-center text-center p-6">
          <p className="mb-4 text-sm text-red-500 font-medium">
            오류: {error}
          </p>
          <button
            onClick={() => router.replace('/login')} // 에러 발생 시 로그인 페이지로 이동
            className="mt-4 bg-gray-200 text-gray-800 px-6 py-2 rounded-full text-sm font-semibold shadow-sm"
          >
            로그인 페이지로
          </button>
        </div>
      </div>
    );
  }
  if (!user) {
    // 토큰은 있지만 user 정보 로딩 실패 시 (예: 404 Not Found)
    return (
      <div className="min-h-screen bg-[#FFF5F5] flex justify-center items-center">
        <div className="w-[393px] flex flex-col items-center justify-center text-center p-6">
          <p className="mb-4 text-sm text-gray-600 font-medium">
            사용자 정보를 가져올 수 없습니다.
          </p>
          <button
            onClick={() => router.replace('/login')}
            className="mt-4 bg-gray-200 text-gray-800 px-6 py-2 rounded-full text-sm font-semibold shadow-sm"
          >
            로그인 페이지로
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FFF5F5] flex justify-center items-stretch">
      <Head>
        <title>대시보드 - StockWeather</title>
      </Head>
      {/* max-w-md, mx-auto, my-8, rounded-xl, shadow-lg를 적용하여 컨테이너 디자인 개선 */}
      <div className="w-full max-w-md bg-white flex flex-col justify-start px-6 py-10 min-h-screen shadow-lg rounded-xl my-8">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold mb-4 text-gray-800">
            환영합니다, <span className="text-[#E30547]">{user?.nickname || '이름 없음'}</span>님!
          </h1>
          {user?.profileImage && (
            <img
              src={user.profileImage}
              alt="프로필 이미지"
              className="w-28 h-28 rounded-full mx-auto mb-4 border-2 border-gray-200 shadow-md object-cover"
            />
          )}
          <p className="text-base text-gray-600">이곳은 주식 날씨 대시보드입니다.</p>
        </div>

        <h2 className="text-center font-bold text-xl mb-6 text-gray-800">
          어떤 종목에 대한 정보를 원하시나요?
        </h2>
        {/* 검색 입력창 디자인 개선 */}
        <div className="flex items-center bg-gray-100 px-4 py-3 rounded-full shadow-md w-full">
          <FaSearch className="text-gray-400 mr-3 text-xl" />
          <input
            type="text"
            placeholder="예: 삼성전자"
            className="text-gray-800 flex-1 text-base bg-transparent outline-none placeholder-gray-400"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyPress={handleKeyPress}
          />
          <button
            onClick={handleSearch}
            className="ml-3 bg-[#E30547] text-white rounded-full w-10 h-10 flex items-center justify-center shadow-md hover:bg-red-600 transition-colors duration-200"
            aria-label="검색"
          >
            <FaArrowRight size={18} />
          </button>
        </div>
        {/* 대시보드에 추가될 다른 요소들 (예: 최근 검색어, 관심 종목 목록 등) */}
        <div className="mt-8">
          <h3 className="text-lg font-bold text-gray-800 mb-4 border-b border-gray-200 pb-2">최근 검색 종목</h3>
          <ul className="text-gray-700 space-y-2">
            {/* 실제 데이터로 대체될 수 있는 임시 목록 */}
            {['카카오', '네이버', 'LG전자'].map((item, index) => (
              <li
                key={index}
                className="py-2 px-4 bg-white rounded-lg shadow-sm border border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors duration-200 flex justify-between items-center"
                onClick={() => router.push(`/search-loading?query=${encodeURIComponent(item)}`)}
              >
                <span>{item}</span>
                <FaArrowRight className="text-gray-400 text-sm" />
              </li>
            ))}
          </ul>
        </div>
        <button
          onClick={handleLogout}
          className="w-full mt-auto py-3 rounded-full text-base font-medium bg-[#E30547] text-white hover:opacity-90 transition shadow-md"
        >
          로그아웃
        </button>
      </div>
    </div>
  );
}

export default DashboardPage;