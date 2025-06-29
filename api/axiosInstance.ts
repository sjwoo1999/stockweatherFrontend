// stockweather-frontend/src/api/axiosInstance.ts
import axios from 'axios';
import { getJwtToken, deleteCookie } from '../utils/cookieUtils';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://stockweather-rest-api-1011872961068.asia-northeast3.run.app';

const instance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

instance.interceptors.request.use(
  (config) => {
    const token = getJwtToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

instance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response && error.response.status === 401) {
      console.error('401 Unauthorized: JWT 토큰이 유효하지 않거나 만료되었습니다. 로그인 페이지로 리다이렉트합니다.');
      if (typeof window !== 'undefined') {
        deleteCookie('jwtToken');
        // window.location.href를 사용하면 강제 새로고침 발생.
        // 이는 토큰 만료 후 클라이언트 상태를 완전히 초기화하는 데 유리합니다.
        window.location.href = '/login'; 
      }
    }
    return Promise.reject(error);
  }
);

export default instance;