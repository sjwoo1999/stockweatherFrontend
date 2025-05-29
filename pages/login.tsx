// stockweather-frontend/src/pages/login.tsx
import React, { useEffect } from 'react'; // <--- useEffect를 임포트
import Head from 'next/head';
import Image, { ImageLoaderProps } from 'next/image';
import { useRouter } from 'next/router'; // <--- useRouter를 임포트

// 커스텀 이미지 로더 함수 정의 (기존 코드와 동일)
const kakaoImageLoader = ({ src, width, quality }: ImageLoaderProps) => {
  if (src.includes('kakao_login_183x45.png')) {
    return `/images/kakao_login_183x45.png`;
  }
  if (src.includes('kakao_login_300x45.png')) {
    return `/images/kakao_login_300x45.png`;
  }
  if (src.includes('kakao_login_366x90.png')) {
    return `/images/kakao_login_366x90.png`;
  }
  if (src.includes('kakao_login_600x90.png')) {
    return `/images/kakao_login_600x90.png`;
  }
  return src;
};

function LoginPage() {
    const router = useRouter();

    useEffect(() => {
      if (typeof window !== 'undefined') {
        console.group('LoginPage useEffect 시작'); // 로그를 그룹화하여 가독성 높임
        console.log('1. LoginPage: 페이지 로드 시점');
        const token = localStorage.getItem('jwtToken');
        console.log('2. LoginPage: localStorage 토큰 확인 결과:', token ? '존재함 (값: ' + token.substring(0, 30) + '...)' : '없음'); // ★ 로그아웃 후에는 이곳에 '없음' 또는 'null'이 출력되어야 합니다!

        if (token) {
          console.log('3. LoginPage: 토큰이 존재하여 대시보드로 리다이렉트합니다.');
          router.replace('/dashboard');
        } else {
          console.log('3. LoginPage: 토큰이 없어 로그인 페이지에 머무릅니다.');
        }
        console.groupEnd(); // 로그 그룹 종료
      }
    }, [router]);

  const handleKakaoLogin = () => {
    window.location.href = `${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/kakao`;
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      backgroundColor: '#f8fbfc',
      padding: '20px',
      fontFamily: 'Pretendard, sans-serif'
    }}>
      <Head>
        <title>로그인 - StockWeather</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div style={{
        backgroundColor: '#ffffff',
        padding: '40px',
        borderRadius: '12px',
        boxShadow: '0 8px 24px rgba(0, 0, 0, 0.08)',
        maxWidth: '420px',
        width: '100%',
        textAlign: 'center'
      }}>
        <h1 style={{
          fontSize: '2.0rem',
          color: '#2c3e50',
          marginBottom: '10px',
          fontWeight: 'bold'
        }}>
          StockWeather
        </h1>
        <p style={{
          fontSize: '1.1rem',
          color: '#5e728e',
          marginBottom: '25px',
          fontWeight: '500',
          lineHeight: '1.6'
        }}>
          주식 시장을 날씨처럼 예보해주는 AI 투자 리포트
          <br />
          <span style={{ color: '#3498db', fontWeight: 'bold' }}>주식의 흐름, 날씨처럼 쉽게!</span>
        </p>

        <p style={{
          fontSize: '0.95rem',
          color: '#7f8c8d',
          marginBottom: '35px',
          lineHeight: '1.5'
        }}>
          간편한 카카오 로그인으로
          <br />
          오늘의 주식 날씨를 확인하고, 현명한 투자 결정을 내려보세요.
        </p>

        {/* 카카오 로그인 버튼 */}
        <button
          onClick={handleKakaoLogin}
          aria-label="카카오로 로그인"
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: 0,
            display: 'block',
            margin: '0 auto',
            maxWidth: '300px',
            transition: 'transform 0.2s ease-in-out',
          }}
          onMouseOver={(e) => (e.currentTarget.style.transform = 'scale(1.02)')}
          onMouseOut={(e) => (e.currentTarget.style.transform = 'scale(1)')}
        >
          <Image
            loader={kakaoImageLoader}
            src="/images/kakao_login_300x45.png"
            alt="카카오 로그인"
            sizes="(max-width: 320px) 183px, (max-width: 480px) 300px, 300px"
            width={300}
            height={45}
            style={{
              display: 'block',
              maxWidth: '100%',
              height: 'auto',
            }}
          />
        </button>

        <p style={{ fontSize: '0.85rem', color: '#95a5a6', marginTop: '35px' }}>
          소셜 로그인으로 더욱 빠르고 안전하게 StockWeather를 이용하세요.
        </p>
        <p style={{ fontSize: '0.8rem', color: '#bdc3c7', marginTop: '5px' }}>
          *개인정보는 서비스 제공을 위해서만 활용됩니다.
        </p>
      </div>
    </div>
  );
}

export default LoginPage;