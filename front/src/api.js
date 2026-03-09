import axios from "axios";

/**
 * ✅ THE OFFICE-READY FIX:
 * Detects if the app is running on your local machine or the Vercel cloud.
 */
const isLocal = 
  window.location.hostname === "localhost" || 
  window.location.hostname === "127.0.0.1" ||
  window.location.hostname.startsWith("192.168.") || 
  window.location.hostname.startsWith("10.");

/**
 * 🚀 BASE_URL LOGIC:
 * - Local: Uses the full address with port 5000.
 * - Production: Uses a relative path "/api". 
 * This forces the browser to use HTTPS, killing the "Mixed Content" error.
 */
const BASE_URL = isLocal 
  ? `http://${window.location.hostname}:5000/api` 
  : "/api"; 

const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true, // Crucial for cross-origin session/cookie support
});

// 1️⃣ Request Interceptor: Automatically attach the JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// 2️⃣ Response Interceptor: Handle errors globally (like expired sessions)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // If the server says "Unauthorized" (401), boot user to login
    if (error.response?.status === 401 && !window.location.pathname.includes("/login")) {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("user");
      window.location.href = "/login"; 
    }
    
    // Provide a clearer error message for debugging
    console.error("API Error:", error.response?.data?.message || error.message);
    return Promise.reject(error);
  }
);

export default api;