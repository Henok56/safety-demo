import axios from "axios";

// 1️⃣ Determine the Base URL dynamically
const isLocalhost = 
  window.location.hostname === "localhost" || 
  window.location.hostname === "127.0.0.1";

// ✅ FIX: Use a relative path '/api' for production. 
// This prevents 'http' vs 'https' mismatches and port 5000 issues.
const BASE_URL = isLocalhost 
  ? "http://localhost:5000/api" 
  : "/api"; 

const api = axios.create({
  baseURL: BASE_URL,
});

// 2️⃣ Attach access token from localStorage to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// 3️⃣ Handle 401 responses globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && !window.location.pathname.includes("/login")) {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("user");
      window.location.href = "/login"; 
    }
    return Promise.reject(error);
  }
);

export default api;