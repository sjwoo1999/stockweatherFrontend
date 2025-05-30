// tailwind.config.js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{ts,tsx,js,jsx}',
    './components/**/*.{ts,tsx,js,jsx}',
    './src/**/*.{ts,tsx,js,jsx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          light: '#F8F8F8',  // 전체 배경색 (아주 연한 회색/흰색)
          primary: '#3498db', // 주 색상 (파란색 계열)
          // accent: '#E30547', // 강조 색상 (강렬한 붉은색, 에러/경고 등에 사용) - 제거됨
          dark: '#2c3e50',  // 짙은 텍스트/요소 색상 (로그인 페이지 StockWeather 로고 색상)
        },
        surface: {
          base: '#FFFFFF', // 카드, 컨테이너 배경 (순수 흰색)
          subtle: '#F4F4F4', // 은은한 배경 (옅은 회색)
          overlay: 'rgba(255,255,255,0.4)', // 모달 등 오버레이
        },
        text: {
          default: '#5e728e',  // 기본 텍스트 색상 (로그인 페이지 첫 p 태그 색상)
          muted: '#7f8c8d',    // 보조 텍스트 색상 (로그인 페이지 두 번째 p 태그 색상)
          light: '#95a5a6', // 로그인 페이지 하단 첫 번째 footer 텍스트
          lighter: '#bdc3c7', // 로그인 페이지 하단 두 번째 footer 텍스트
        },
      },
      fontFamily: {
        heading: ['var(--font-heading)', 'sans-serif'], // Plus Jakarta Sans
        body: ['var(--font-body)', 'sans-serif'],     // Noto Sans KR
        accent: ['var(--font-accent)', 'sans-serif'],   // Black Han Sans
        sans: ['Pretendard', 'sans-serif'], // 기본 sans-serif도 Pretendard로 지정
      },
      borderRadius: {
        sm: '8px',
        md: '12px',
        lg: '18px',
        xl: '24px', 
        full: '9999px',
      },
      boxShadow: {
        sm: '0 2px 6px rgba(0,0,0,0.06)',
        md: '0 4px 10px rgba(0,0,0,0.1)',
        lg: '0 8px 24px rgba(0,0,0,0.08)', // 로그인 페이지 카드 box-shadow와 일치
        card: '0 6px 16px rgba(0,0,0,0.08)', 
        inner: 'inset 0 1px 2px rgba(0,0,0,0.08)',
      },
    },
  },
  plugins: [],
};