// next.config.ts
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      // 🚨 주의: hostname: '**'는 보안상 좋지 않으므로, 가능한 한 구체적인 도메인을 나열하는 것이 좋습니다.
      // 모든 HTTPS 호스트를 허용하는 포괄적인 패턴 (필요하다면 유지, 아니라면 제거)
      {
        protocol: 'https',
        hostname: '**',
      },
      // 핵심 뉴스 이미지 도메인
      {
        protocol: 'https', // 🚨 https만 허용
        hostname: 'k.kakaocdn.net',
      },
      {
        protocol: 'http', // 🚨 http도 추가하여 에러 메시지에 나온 URL을 처리
        hostname: 'k.kakaocdn.net',
      },
      {
        protocol: 'https',
        hostname: 'img4.yna.co.kr',
      },
      {
        protocol: 'https',
        hostname: 'pimg.mk.co.kr',
      },
      {
        protocol: 'https',
        hostname: 'img9.yna.co.kr',
      },
      {
        protocol: 'https',
        hostname: 'ssl.pstatic.net', // 네이버 관련 이미지
      },
      {
        protocol: 'https',
        hostname: 'search.pstatic.net', // 네이버 검색 이미지
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com', // 구글 사용자 콘텐츠 (종종 이미지에 사용됨)
      },
      {
        protocol: 'https',
        hostname: 'www.google.com', // 구글 검색 결과 이미지
      },
      // 언론사/뉴스 사이트 이미지 도메인 (주요 도메인만 포함)
      {
        protocol: 'https',
        hostname: 'finance.daum.net',
      },
      {
        protocol: 'https',
        hostname: 'kr.investing.com',
      },
      {
        protocol: 'https',
        hostname: 'news.google.com',
      },
      {
        protocol: 'https',
        hostname: 'finance.naver.com',
      },
      {
        protocol: 'https',
        hostname: 'www.khan.co.kr',
      },
      {
        protocol: 'https',
        hostname: 'www.hani.co.kr',
      },
      {
        protocol: 'https',
        hostname: 'www.donga.com',
      },
      {
        protocol: 'https',
        hostname: 'www.joongang.co.kr',
      },
      {
        protocol: 'https',
        hostname: 'www.chosun.com',
      },
      {
        protocol: 'https',
        hostname: 'www.news1.kr',
      },
      {
        protocol: 'https',
        hostname: 'www.asiae.co.kr',
      },
      {
        protocol: 'https',
        hostname: 'biz.chosun.com',
      },
      {
        protocol: 'https',
        hostname: 'www.fnnews.com',
      },
      {
        protocol: 'https',
        hostname: 'www.sedaily.com',
      },
      {
        protocol: 'https',
        hostname: 'www.edaily.co.kr',
      },
      {
        protocol: 'https',
        hostname: 'www.mt.co.kr',
      },
      {
        protocol: 'https',
        hostname: 'www.mk.co.kr',
      },
      {
        protocol: 'https',
        hostname: 'www.hankyung.com',
      },
      // 이미지 호스팅 서브도메인 (언론사 내부 이미지 서버)
      {
        protocol: 'https',
        hostname: 'img.khan.co.kr',
      },
      {
        protocol: 'https',
        hostname: 'image.hani.co.kr',
      },
      {
        protocol: 'https',
        hostname: 'img.donga.com',
      },
      {
        protocol: 'https',
        hostname: 'cdn.joongang.co.kr',
      },
      {
        protocol: 'https',
        hostname: 'image.chosun.com',
      },
      {
        protocol: 'https',
        hostname: 'cdn.news1.kr',
      },
      {
        protocol: 'https',
        hostname: 'image.asiae.co.kr',
      },
      {
        protocol: 'https',
        hostname: 'img.fnnews.com',
      },
      {
        protocol: 'https',
        hostname: 'img.sedaily.com',
      },
      {
        protocol: 'https',
        hostname: 'img.edaily.co.kr',
      },
      {
        protocol: 'https',
        hostname: 'image.mt.co.kr',
      },
      {
        protocol: 'https',
        hostname: 'image.hankyung.com',
      },
      // YNA(연합뉴스)의 다양한 이미지 호스트를 처리하기 위한 와일드카드 추가
      {
        protocol: 'https',
        hostname: '*.yna.co.kr',
        pathname: '/photo/**',
      },
      {
        protocol: 'http', // YNA도 http 이미지 URL이 올 수 있으므로 추가
        hostname: '*.yna.co.kr',
        pathname: '/photo/**',
      },
    ],
  },
};

module.exports = nextConfig;