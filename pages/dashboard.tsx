// stockweather-frontend/src/pages/dashboard.tsx
import React, { useEffect, useState } from 'react';
import axiosInstance from '../api/axiosInstance';
import axios from 'axios';
import { useRouter } from 'next/router';
import Head from 'next/head';

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
  const router = useRouter();

  useEffect(() => {
    console.log('Dashboard: useEffect 시작'); // ★ 추가

    if (typeof window === 'undefined') {
      console.log('Dashboard: 서버 측 렌더링 (SSR) 환경, API 호출 건너뜜.'); // ★ 추가
      setLoading(false);
      return;
    }

    const token = localStorage.getItem('jwtToken');
    console.log('Dashboard: localStorage에서 토큰 확인:', token ? '존재함' : '없음'); // ★ 추가

    if (!token) {
      console.log('Dashboard: JWT 토큰이 없어 /users/me 호출을 건너뛰고 로그인 페이지로 리다이렉트합니다.');
      setLoading(false);
      router.replace('/login');
      return;
    }

    const fetchUserProfile = async () => {
      console.log('Dashboard: fetchUserProfile 함수 실행 시작.'); // ★ 추가
      try {
        setLoading(true);
        setError(null);
        console.log('Dashboard: /users/me API 호출 시작...'); // ★ 추가
        const response = await axiosInstance.get<User>('/users/me');
        console.log('Dashboard: /users/me API 응답 성공:', response.data); // ★ 추가
        setUser(response.data);
      } catch (err) {
        console.error('Dashboard: fetchUserProfile 에러 발생:', err); // ★ 추가
        if (axios.isAxiosError(err)) {
          console.error("fetchUserProfile 에러 상세:", err.response?.status, err.message, err.response?.data); // ★ 추가
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
        console.log('Dashboard: fetchUserProfile 함수 실행 완료. 로딩 상태:', false); // ★ 추가
      }
    };

    fetchUserProfile();
    console.log('Dashboard: useEffect 끝'); // ★ 추가
  }, [router]); // router 객체의 변화에 반응

  const handleLogout = () => {
    if (typeof window !== 'undefined') {
      console.log('handleLogout: 로그아웃 시작');
      // 1. 로컬 스토리지에서 JWT 토큰 삭제
      localStorage.removeItem('jwtToken'); // <-- 이 줄을 추가해야 합니다!
      console.log('handleLogout: JWT 토큰이 localStorage에서 삭제되었습니다.');
  
      // 2. 카카오 로그아웃 API 호출 (브라우저 리다이렉트)
      // process.env.NEXT_PUBLIC_KAKAO_REST_API_KEY가 올바르게 설정되어 있다고 가정합니다.
      const KAKAO_AUTH_LOGOUT_URL = `https://kauth.kakao.com/oauth/logout?client_id=${process.env.NEXT_PUBLIC_KAKAO_REST_API_KEY}&logout_redirect_uri=http://localhost:3001/login`;
  
      console.log('handleLogout: 카카오 로그아웃 URL로 리다이렉트:', KAKAO_AUTH_LOGOUT_URL);
      window.location.href = KAKAO_AUTH_LOGOUT_URL;
    }
  };

  // 렌더링 로직 (여기에는 변화 없음)
  if (loading) {
    console.log('Dashboard: 렌더링 - 로딩 중...'); // ★ 추가
    return <div style={{ padding: '20px', textAlign: 'center' }}>사용자 정보 로딩 중...</div>;
  }
  if (error) {
    console.log('Dashboard: 렌더링 - 에러 발생:', error); // ★ 추가
    return <div style={{ padding: '20px', color: 'red', textAlign: 'center' }}>에러: {error}</div>;
  }
  if (!user) {
    console.log('Dashboard: 렌더링 - 사용자 정보 없음. (리다이렉트 예정 또는 초기 상태)'); // ★ 추가
    return <div style={{ padding: '20px', textAlign: 'center' }}>로그인된 사용자 정보가 없습니다.</div>;
  }

  console.log('Dashboard: 렌더링 - 사용자 정보 표시:', user); // ★ 추가
  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif', maxWidth: '800px', margin: '0 auto', border: '1px solid #eee', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
      <Head>
        <title>대시보드 - StockWeather</title>
      </Head>
      <h1 style={{ color: '#333' }}>환영합니다, {user?.nickname || '이름 없음'}님!</h1>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px' }}>
        {user?.profileImage && (
          <img
            src={user.profileImage}
            alt="프로필 이미지"
            style={{ width: '80px', height: '80px', borderRadius: '50%', marginRight: '15px', border: '2px solid #ddd' }}
          />
        )}
      </div>
      <p style={{ fontSize: '16px', color: '#666' }}>이곳은 로그인된 사용자만 접근할 수 있는 대시보드 페이지입니다.</p>
      <p style={{ fontSize: '14px', color: '#888' }}>
        가입일: {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
      </p>
      <button
        onClick={handleLogout}
        style={{
          padding: '10px 20px',
          fontSize: '16px',
          cursor: 'pointer',
          backgroundColor: '#dc3545',
          color: 'white',
          border: 'none',
          borderRadius: '5px',
          marginTop: '30px',
          boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
          transition: 'background-color 0.3s ease',
        }}
        onMouseOver={(e) => (e.currentTarget.style.backgroundColor = '#c82333')}
        onMouseOut={(e) => (e.currentTarget.style.backgroundColor = '#dc3545')}
      >
        로그아웃
      </button>
    </div>
  );
}

export default DashboardPage;