// stockweather-frontend/src/api/axiosInstance.ts
import axios from 'axios';

// 환경 변수에서 백엔드 API 기본 URL 가져오기
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000';

const instance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000, // 요청 타임아웃 10초
  headers: {
    'Content-Type': 'application/json',
  },
});

// 요청 인터셉터: 모든 API 요청 시 로컬 스토리지의 JWT 토큰을 'Authorization' 헤더에 추가
instance.interceptors.request.use(
  (config) => {
    // 브라우저 환경에서만 localStorage에 접근하도록 `typeof window !== 'undefined'` 체크
    const token = typeof window !== 'undefined' ? localStorage.getItem('jwtToken') : null;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`; // 'Bearer' 접두사와 함께 토큰 추가
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 응답 인터셉터: 백엔드로부터 받은 응답 처리, 특히 401 Unauthorized 에러 감지
instance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response && error.response.status === 401) {
      console.error('401 Unauthorized: JWT 토큰이 유효하지 않거나 만료되었습니다. 로그인 페이지로 리다이렉트합니다.');
      // 유효하지 않은 토큰 삭제 및 로그인 페이지로 강제 리다이렉트
      if (typeof window !== 'undefined') {
        localStorage.removeItem('jwtToken');
        window.location.href = '/login'; // Next.js useRouter 대신 window.location.href 사용
      }
    }
    return Promise.reject(error);
  }
);

export default instance;