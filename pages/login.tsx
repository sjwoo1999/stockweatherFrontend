// stockweather-frontend/src/pages/login.tsx
import React, { useEffect } from 'react';
import Head from 'next/head';
import Image, { ImageLoaderProps } from 'next/image';
import { useRouter } from 'next/router';

// 커스텀 이미지 로더 함수 정의 (변경 없음)
const kakaoImageLoader = ({ src }: ImageLoaderProps) => {
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
        console.group('LoginPage useEffect 시작');
        console.log('1. LoginPage: 페이지 로드 시점');
        const token = localStorage.getItem('jwtToken');
        console.log('2. LoginPage: localStorage 토큰 확인 결과:', token ? '존재함 (값: ' + token.substring(0, 30) + '...)' : '없음');

        if (token) {
          console.log('3. LoginPage: 토큰이 존재하여 대시보드로 리다이렉트합니다.');
          router.replace('/dashboard');
        } else {
          console.log('3. LoginPage: 토큰이 없어 로그인 페이지에 머무릅니다.');
        }
        console.groupEnd();
      }
    }, [router]);

  const handleKakaoLogin = () => {
    // 1. 카카오 개발자 콘솔에서 확인한 여러분의 카카오 REST API 키
    // 이 값은 Vercel 환경 변수에 NEXT_PUBLIC_KAKAO_CLIENT_ID로 설정되어 있어야 합니다.
    const KAKAO_CLIENT_ID = process.env.NEXT_PUBLIC_KAKAO_CLIENT_ID;

    // 2. 카카오 개발자 콘솔에 등록한 백엔드의 카카오 콜백 Redirect URI
    // 이 값은 Vercel 환경 변수에 NEXT_PUBLIC_KAKAO_REDIRECT_URI로 설정되어 있어야 합니다.
    // 이 값은 백엔드 NestJS의 'KAKAO_CALLBACK_URL' 환경 변수와 정확히 일치해야 합니다.
    const KAKAO_REDIRECT_URI = process.env.NEXT_PUBLIC_KAKAO_REDIRECT_URI;

    // 필수 환경 변수 누락 확인 및 알림
    if (!KAKAO_CLIENT_ID) {
      alert("카카오 클라이언트 ID가 설정되지 않았습니다.");
      console.error("환경 변수 NEXT_PUBLIC_KAKAO_CLIENT_ID가 누락되었습니다.");
      return;
    }
    if (!KAKAO_REDIRECT_URI) {
      alert("카카오 리다이렉트 URI가 설정되지 않았습니다.");
      console.error("환경 변수 NEXT_PUBLIC_KAKAO_REDIRECT_URI가 누락되었습니다.");
      return;
    }

    // 디버깅을 위해 환경 변수 값 출력 (배포 후에는 제거하거나 개발 환경에서만 활성화)
    console.log("NEXT_PUBLIC_KAKAO_CLIENT_ID (from frontend):", KAKAO_CLIENT_ID);
    console.log("NEXT_PUBLIC_KAKAO_REDIRECT_URI (from frontend):", KAKAO_REDIRECT_URI);

    // ⭐⭐⭐ 핵심 수정: 카카오 인증 서버로 직접 리다이렉트 ⭐⭐⭐
    const kakaoAuthUrl = `https://kauth.kakao.com/oauth/authorize?response_type=code&client_id=${KAKAO_CLIENT_ID}&redirect_uri=${KAKAO_REDIRECT_URI}&scope=profile_nickname,profile_image,account_email`;

    window.location.href = kakaoAuthUrl;
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-brand-light p-5 font-sans">
      <Head>
        <title>로그인 - StockWeather</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="bg-surface-base p-10 rounded-xl shadow-lg max-w-md w-full text-center">
        {/* 로고 이미지 */}
        <div className="mb-4">
            <Image
                src="/images/Logo.png"
                alt="StockWeather Logo"
                width={150}
                height={40}
                objectFit="contain"
                className="mx-auto"
            />
        </div>

        <h1 className="text-3xl text-brand-dark mb-2 font-bold">
          StockWeather
        </h1>
        <p className="text-lg text-text-default mb-6 font-medium leading-relaxed">
          주식 시장을 날씨처럼 예보해주는 AI 투자 리포트
          <br />
          <span className="text-brand-primary font-bold">주식의 흐름, 날씨처럼 쉽게!</span>
        </p>

        <p className="text-sm text-text-muted mb-8 leading-normal">
          간편한 카카오 로그인으로
          <br />
          오늘의 주식 날씨를 확인하고, 현명한 투자 결정을 내려보세요.
        </p>

        {/* 카카오 로그인 버튼 */}
        <button
          onClick={handleKakaoLogin}
          aria-label="카카오로 로그인"
          className="block mx-auto max-w-[300px] transition-transform duration-200 ease-in-out hover:scale-102"
          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
        >
          <Image
            loader={kakaoImageLoader}
            src="/images/kakao_login_300x45.png"
            alt="카카오 로그인"
            sizes="(max-width: 320px) 183px, (max-width: 480px) 300px, 300px"
            width={300}
            height={45}
            className="block max-w-full h-auto"
          />
        </button>

        <p className="text-sm text-text-light mt-9">
          소셜 로그인으로 빠르고 안전하게 StockWeather를 이용하세요.
        </p>
        <p className="text-xs text-text-lighter mt-1">
          *개인정보는 서비스 제공을 위해서만 활용됩니다.
        </p>
      </div>
    </div>
  );
}

export default LoginPage;