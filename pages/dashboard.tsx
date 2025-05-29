// stockweather-frontend/src/pages/dashboard.tsx
import React, { useEffect, useState } from 'react';
import axiosInstance from '../api/axiosInstance'; // 설정된 Axios 인스턴스 임포트
import axios from 'axios'; // Axios 에러 타입 체크를 위해 기본 axios 임포트
import { useRouter } from 'next/router'; // Next.js useRouter 훅
import Head from 'next/head'; // Next.js Head 컴포넌트

// 사용자 정보의 타입 정의 (백엔드 User 엔티티와 일치해야 합니다)
interface User {
  id: number;
  kakaoId: number;
  email: string;
  nickname: string;
  profileImage?: string; // 프로필 이미지는 선택 사항
  createdAt: string;
  updatedAt: string;
  // 필요한 다른 필드들을 여기에 추가
}

function DashboardPage() {
  const [user, setUser] = useState<User | null>(null); // 사용자 정보 상태
  const [loading, setLoading] = useState<boolean>(true); // 로딩 상태
  const [error, setError] = useState<string | null>(null); // 에러 메시지 상태
  const router = useRouter();

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        setLoading(true); // 로딩 시작
        setError(null); // 이전 에러 초기화
        // 백엔드의 보호된 '/users/me' 엔드포인트 호출
        // 이 요청에는 axiosInstance 인터셉터에 의해 자동으로 JWT 토큰이 포함됩니다.
        const response = await axiosInstance.get<User>('/users/me');
        setUser(response.data); // 응답으로 받은 사용자 정보 저장
      } catch (err) {
        // Axios 인터셉터가 401 에러를 처리하므로, 여기서는 다른 종류의 에러만 다룹니다.
        if (axios.isAxiosError(err)) { // Axios 에러인지 확인
          if (err.response?.status !== 401) { // 401이 아닌 다른 HTTP 에러인 경우
            setError(err.message); // 에러 메시지 설정
          }
        } else {
          setError('사용자 정보를 불러오는 중 알 수 없는 오류가 발생했습니다.');
        }
      } finally {
        setLoading(false); // 로딩 종료
      }
    };

    // 이 페이지가 클라이언트 측에서 렌더링될 때만 API 호출 (SSR이 아닌 경우)
    // 브라우저 환경에서만 실행되도록 조건부 로직 추가
    if (typeof window !== 'undefined') {
      fetchUserProfile();
    }
  }, []); // 빈 의존성 배열로 컴포넌트 마운트 시 한 번만 실행

  // 로그아웃 핸들러
  const handleLogout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('jwtToken'); // 로컬 스토리지에서 토큰 삭제
      router.replace('/login'); // 로그인 페이지로 리다이렉트하여 로그아웃 처리 완료
    }
  };

  if (loading) return <div style={{ padding: '20px', textAlign: 'center' }}>사용자 정보 로딩 중...</div>;
  if (error) return <div style={{ padding: '20px', color: 'red', textAlign: 'center' }}>에러: {error}</div>;
  // 사용자 정보가 아직 없거나 로딩 중이 아닐 때 메시지 표시
  // `user`가 null인 상태에서 `loading`도 false면 (예: API 호출 실패 후 에러가 없으면)
  if (!user && !loading) return <div style={{ padding: '20px', textAlign: 'center' }}>로그인된 사용자 정보가 없습니다.</div>;

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif', maxWidth: '800px', margin: '0 auto', border: '1px solid #eee', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
      <Head>
        <title>대시보드 - StockWeather</title>
      </Head>
      <h1 style={{ color: '#333' }}>환영합니다, {user?.nickname}님!</h1> {/* user가 null일 수 있으므로 옵셔널 체이닝 */}
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px' }}>
        {user?.profileImage && ( // user가 null일 수 있으므로 옵셔널 체이닝
          <img
            src={user.profileImage}
            alt="프로필 이미지"
            style={{ width: '80px', height: '80px', borderRadius: '50%', marginRight: '15px', border: '2px solid #ddd' }}
          />
        )}
        <div>
          <p style={{ margin: '0 0 5px 0', fontSize: '16px', color: '#555' }}>이메일: {user?.email}</p>
          <p style={{ margin: '0', fontSize: '14px', color: '#777' }}>카카오 ID: {user?.kakaoId}</p>
        </div>
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