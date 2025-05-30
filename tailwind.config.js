// stockweather-frontend/tailwind.config.js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{ts,tsx,js,jsx}', // './pages' 경로 내 모든 파일
    './components/**/*.{ts,tsx,js,jsx}', // './components' 경로 내 모든 파일
    // 만약 'src' 폴더를 사용한다면 아래 경로도 추가해야 합니다.
    './src/**/*.{ts,tsx,js,jsx}', // src 폴더 전체를 스캔
    // 혹은 더 구체적으로:
    // './src/pages/**/*.{ts,tsx,js,jsx}',
    // './src/components/**/*.{ts,tsx,js,jsx}',
    // './src/app/**/*.{ts,tsx,js,jsx}', // Next.js 13+ app directory 사용하는 경우
  ],
  theme: {
    extend: {
      colors: {
        // 이전에 정의된 커스텀 색상들을 유지
        brand: {
          light: '#FFF9F8',
          primary: '#E30547', // 주요 브랜드 색상
          dark: '#1A1A1A',
        },
        surface: {
          base: '#FFFFFF',
          subtle: '#F4F4F4', // 프론트 코드에서 사용된 'bg-surface-subtle'이 이 색상을 참조합니다.
          overlay: 'rgba(255,255,255,0.4)',
        },
        text: {
          default: '#111',
          muted: '#666',
        },
        // 만약 필요한 경우, 기존 tailwind.config.ts의 변수 기반 색상도 여기에 통합
        // (선택 사항: CSS 변수를 계속 사용할지 여부에 따라)
        // background: "var(--background)",
        // foreground: "var(--foreground)",
      },
      fontFamily: {
        heading: ['"Plus Jakarta Sans"', 'sans-serif'],
        body: ['"Pretendard"', 'sans-serif'],
        accent: ['"Gmarket Sans"', 'sans-serif'],
      },
      borderRadius: {
        sm: '8px',
        md: '12px',
        lg: '18px',
        full: '9999px',
        xl: '16px', // dashboard.tsx에서 사용된 rounded-xl을 위해 추가
      },
      boxShadow: {
        sm: '0 2px 6px rgba(0,0,0,0.06)',
        card: '0 6px 16px rgba(0,0,0,0.08)',
        inner: 'inset 0 1px 2px rgba(0,0,0,0.08)',
        md: '0 4px 10px rgba(0,0,0,0.1)', // dashboard.tsx에서 사용된 shadow-md를 위해 추가
        lg: '0 8px 20px rgba(0,0,0,0.15)', // dashboard.tsx에서 사용된 shadow-lg를 위해 추가
      },
    },
  },
  plugins: [],
};