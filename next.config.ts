// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    // legacy 'domains' (Next.js 13 이하) 또는 간단한 설정
    domains: [
      'k.kakaocdn.net', // 카카오 이미지 도메인 추가
      // 'another-image-domain.com', // 다른 외부 이미지 도메인이 있다면 추가
    ],
    // Next.js 14+부터 권장되는 방식 (보다 세분화된 설정 가능)
    // remotePatterns: [
    //   {
    //     protocol: 'http', // 또는 'https'
    //     hostname: 'k.kakaocdn.net',
    //     port: '',
    //     pathname: '/**',
    //   },
    // ],
  },
};

module.exports = nextConfig;