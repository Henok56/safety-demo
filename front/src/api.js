import axios from "axios";

// This is the FIX for Mixed Content errors.
// Locally it uses localhost, on Vercel it uses the current secure domain.
const BASE_URL = window.location.hostname === "localhost" 
  ? "http://localhost:5000/api" 
  : "/api"; 

const api = axios.create({
  baseURL: BASE_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && !window.location.pathname.includes("/login")) {
      localStorage.removeItem("accessToken");
      window.location.href = "/login"; 
    }
    return Promise.reject(error);
  }
);

export default api;