import axios from 'axios';

const api = axios.create({
  // Vite 프록시를 사용하므로 baseURL을 상대경로로 설정 (개발 환경)
  // 운영 환경에서는 실제 백엔드 URL로 변경 필요
  baseURL: import.meta.env.VITE_API_BASE_URL || '',
  withCredentials: true, // if backend uses cookies
});

export default api;
