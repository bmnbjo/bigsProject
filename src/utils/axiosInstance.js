import axios from "axios";

const API_BASE_URL = "https://front-mission.bigs.or.kr";

// ✅ Axios 인스턴스 생성
const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// ✅ 요청 인터셉터: 요청 전에 토큰을 자동 추가
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ✅ 응답 인터셉터: 토큰 만료 시 자동 로그아웃 & 로그인 페이지로 이동
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      console.error("⛔ 토큰이 만료되었습니다. 로그아웃 처리 후 로그인 페이지로 이동합니다.");

      // ✅ 로컬 스토리지에서 토큰 삭제
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");

      // ✅ 로그인 페이지로 이동
      window.location.href = "/auth/login";
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
