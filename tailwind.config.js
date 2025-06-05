/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./pages/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          light: '#FFF9F8',
          primary: '#E30547',
          dark: '#1A1A1A',
        },
        surface: {
          base: '#FFFFFF',
          subtle: '#F4F4F4',
          overlay: 'rgba(255,255,255,0.4)',
        },
        text: {
          default: '#111',
          muted: '#666',
        },
        sentiment: {
          positive: '#1D976C',
          negative: '#D7263D',
          neutral: '#FFA500',
        },
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
      },
      boxShadow: {
        sm: '0 2px 6px rgba(0,0,0,0.06)',
        card: '0 6px 16px rgba(0,0,0,0.08)',
        inner: 'inset 0 1px 2px rgba(0,0,0,0.08)',
      },
    },
  },
  plugins: [],
};
