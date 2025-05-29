// stockweather-frontend/src/pages/login.tsx (수정 제안)
import React from 'react';
import Head from 'next/head';

function LoginPage() {
  const handleKakaoLogin = () => {
    // 백엔드의 카카오 인증 시작 엔드포인트로 사용자를 리다이렉트
    window.location.href = `${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/kakao`;
  };

  return (
    <div style={{ padding: '20px', textAlign: 'center', fontFamily: 'Arial, sans-serif' }}>
      <Head>
        <title>로그인 - StockWeather</title>
      </Head>
      <h1>StockWeather 서비스</h1>
      <p>주식 정보와 날씨 정보를 한눈에!</p>
      <button
        onClick={handleKakaoLogin}
        style={{
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          padding: 0,
          display: 'block',
          margin: '0 auto',
          maxWidth: '300px',
        }}
      >
        <img
          src="/images/kakao_login_300x45.png" // 기본 src
          alt="카카오 로그인"
          // --- 여기를 수정합니다: srcset -> srcSet ---
          srcSet={`
            /images/kakao_login_183x45.png 183w,
            /images/kakao_login_300x45.png 300w,
            /images/kakao_login_366x90.png 366w,
            /images/kakao_login_600x90.png 600w
          `}
          sizes="(max-width: 320px) 183px, (max-width: 480px) 300px, 300px"
          style={{
            display: 'block',
            maxWidth: '100%',
            height: 'auto',
          }}
        />
      </button>
      <p style={{ marginTop: '20px', fontSize: '14px', color: '#555' }}>
        로그인하여 개인화된 주식 및 날씨 정보를 받아보세요.
      </p>
    </div>
  );
}

export default LoginPage;