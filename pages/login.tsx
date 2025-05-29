// stockweather-frontend/src/pages/login.tsx (수정 제안)
import React from 'react';
import Head from 'next/head';
import Image from 'next/image'; // Next.js Image 컴포넌트 임포트

function LoginPage() {
  const handleKakaoLogin = () => {
    // 백엔드의 카카오 인증 시작 엔드포인트로 사용자를 리다이렉트
    // NEXT_PUBLIC_API_BASE_URL 환경 변수가 올바르게 설정되어 있다고 가정합니다.
    window.location.href = `${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/kakao`;
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      backgroundColor: '#f8fbfc', // 로고 색상과 어울리는 밝은 배경색
      padding: '20px',
      fontFamily: 'Pretendard, sans-serif' // 좀 더 현대적인 폰트 가이드 (예시)
    }}>
      <Head>
        <title>로그인 - StockWeather</title>
        {/* 파비콘도 스톡웨더 로고와 어울리게 설정 (선택 사항) */}
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div style={{
        backgroundColor: '#ffffff',
        padding: '40px',
        borderRadius: '12px',
        boxShadow: '0 8px 24px rgba(0, 0, 0, 0.08)',
        maxWidth: '420px', // 카카오 버튼 크기 고려하여 최대 너비 조정
        width: '100%',
        textAlign: 'center'
      }}>
        <h1 style={{
          fontSize: '2.0rem', // 서비스명 강조
          color: '#2c3e50', // 진한 글씨색
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
          aria-label="카카오로 로그인" // 접근성 향상
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: 0,
            display: 'block',
            margin: '0 auto',
            maxWidth: '300px', // 카카오 버튼의 표준 너비
            transition: 'transform 0.2s ease-in-out',
          }}
          onMouseOver={(e) => (e.currentTarget.style.transform = 'scale(1.02)')} // 호버 효과
          onMouseOut={(e) => (e.currentTarget.style.transform = 'scale(1)')}
        >
          {/* Next.js Image 컴포넌트로 카카오 로그인 이미지 사용 */}
          <Image
            src="/images/kakao_login_300x45.png" // 기본 src
            alt="카카오 로그인"
            // srcSet을 Image 컴포넌트의 props로 사용 (직접 srcSet 문자열 제공)
            srcSet={`
              /images/kakao_login_183x45.png 183w,
              /images/kakao_login_300x45.png 300w,
              /images/kakao_login_366x90.png 366w,
              /images/kakao_login_600x90.png 600w
            `}
            sizes="(max-width: 320px) 183px, (max-width: 480px) 300px, 300px"
            width={300} // 기본 너비 (가장 일반적인 300x45 기준)
            height={45}  // 기본 높이
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