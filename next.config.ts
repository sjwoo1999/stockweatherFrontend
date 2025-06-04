// next.config.ts
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    domains: [
      'k.kakaocdn.net',
      'img4.yna.co.kr',
      'pimg.mk.co.kr',
      'img9.yna.co.kr', // 🚨 새로 추가된 도메인
      // 필요한 다른 이미지 호스트들을 계속 추가하세요.
      // 예: 'ssl.pstatic.net',
      // ... (이전 답변에서 추가된 나머지 도메인들)
      'finance.daum.net',
      'kr.investing.com',
      'news.google.com',
      'finance.naver.com',
      'www.khan.co.kr',
      'www.hani.co.kr',
      'www.donga.com',
      'www.joongang.co.kr',
      'www.chosun.com',
      'www.news1.kr',
      // 'www.yna.co.kr', // 이 도메인 자체도 필요할 수 있습니다.
      'www.asiae.co.kr',
      'biz.chosun.com',
      'www.fnnews.com',
      'www.sedaily.com',
      'www.edaily.co.kr',
      'www.mt.co.kr',
      'www.mk.co.kr',
      'www.hankyung.com',
      'ssl.pstatic.net',
      'search.pstatic.net',
      'lh3.googleusercontent.com',
      'www.google.com',
      'img.khan.co.kr',
      'image.hani.co.kr',
      'img.donga.com',
      'cdn.joongang.co.kr',
      'image.chosun.com',
      'cdn.news1.kr',
      'image.asiae.co.kr',
      'img.fnnews.com',
      'img.sedaily.com',
      'img.edaily.co.kr',
      'image.mt.co.kr',
      'image.hankyung.com',
    ],
  },
};

export default nextConfig;