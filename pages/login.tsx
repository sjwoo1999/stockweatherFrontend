// stockweather-frontend/src/pages/login.tsx
import React, { useEffect } from 'react';
import Head from 'next/head';
import Image, { ImageLoaderProps } from 'next/image';
import { useRouter } from 'next/router';

// 커스텀 이미지 로더 함수 정의
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
    window.location.href = `${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/kakao`;
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-brand-light p-5 font-sans">
      <Head>
        <title>로그인 - StockWeather</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="bg-surface-base p-10 rounded-xl shadow-lg max-w-md w-full text-center">
        {/* 로고 이미지 추가 */}
        <div className="mb-4">
            <Image
                src="/images/Logo.png" // public/images 폴더에 Logo.png 파일이 있다고 가정
                alt="StockWeather Logo"
                width={150} // 적절한 크기로 조절
                height={40} // 적절한 크기로 조절
                objectFit="contain"
                className="mx-auto" // 중앙 정렬
            />
        </div>

        <h1 className="text-3xl text-brand-dark mb-2 font-bold">
          StockWeather
        </h1>
        <p className="text-lg text-text-default mb-6 font-medium leading-relaxed">
          주식 시장을 날씨처럼 예보해주는 AI 투자 리포트
          <br /> {/* 이 줄바꿈은 유지 (이미지 참고) */}
          <span className="text-brand-primary font-bold">주식의 흐름, 날씨처럼 쉽게!</span>
        </p>

        {/* ✨ 변경: 폰트 크기를 text-sm으로 조정하여 줄바꿈 개선 시도 ✨ */}
        <p className="text-sm text-text-muted mb-8 leading-normal">
          간편한 카카오 로그인으로
          <br /> {/* 이 줄바꿈은 유지 (이미지 참고) */}
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