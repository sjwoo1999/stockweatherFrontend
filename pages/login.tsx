// stockweather-frontend/src/pages/login.tsx
import React from 'react';
import Head from 'next/head';
import Image, { ImageLoaderProps } from 'next/image'; // ImageLoaderProps도 임포트

// 커스텀 이미지 로더 함수 정의
const kakaoImageLoader = ({ src, width, quality }: ImageLoaderProps) => {
  // src는 Image 컴포넌트의 src prop에서 온 "/images/kakao_login_..."
  // width는 Next.js가 이미지 최적화를 위해 요청하는 너비
  // quality는 Next.js가 요청하는 이미지 품질 (기본값 75)

  // Next.js는 Image 컴포넌트의 width prop을 기반으로 srcSet을 자동으로 생성하므로,
  // 여기서는 각 이미지 파일의 실제 크기를 고려하여 적절한 URL을 반환해야 합니다.

  // 실제 파일 이름을 기준으로 조건 분기
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

  // 기본값 또는 에러 처리
  return src; // Fallback to original src if no specific match
};

function LoginPage() {
  const handleKakaoLogin = () => {
    // 백엔드의 카카오 인증 시작 엔드포인트로 사용자를 리다이렉트
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
            // loader prop을 사용하여 커스텀 로더 함수 적용
            loader={kakaoImageLoader}
            src="/images/kakao_login_300x45.png" // 기본 src (loader 함수에서 처리)
            alt="카카오 로그인"
            // srcSet과 sizes는 Image 컴포넌트의 props가 아니므로 제거하거나,
            // sizes prop을 통해 Next.js가 srcSet을 생성하도록 합니다.
            // 여기서는 loader를 사용했으므로 sizes도 제거해도 됩니다.
            // 하지만 반응형 동작을 위해 sizes를 남겨두는 것도 좋습니다.
            sizes="(max-width: 320px) 183px, (max-width: 480px) 300px, 300px" // Next.js가 srcSet을 만들 때 참고
            width={300} // 기본 너비
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