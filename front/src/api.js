import axios from "axios";

// Use relative path - works on both localhost and Netlify
// No hardcoded external URL needed
const api = axios.create({
  baseURL: "/api",
  withCredentials: true,
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor - Add token to headers
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken");
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Log request in development
    if (import.meta.env.DEV) {
      console.log(`🚀 ${config.method?.toUpperCase()} ${config.url}`);
    }
    
    return config;
  },
  (error) => {
    console.error("Request interceptor error:", error);
    return Promise.reject(error);
  }
);

// Response interceptor - Handle errors globally
api.interceptors.response.use(
  (response) => {
    // Log response in development
    if (import.meta.env.DEV) {
      console.log(`✅ ${response.config.url} - ${response.status}`);
    }
    return response;
  },
  (error) => {
    // Handle 401 Unauthorized
    if (error.response?.status === 401) {
      console.error("Unauthorized! Redirecting to login...");
      // Clear local storage
      localStorage.removeItem("accessToken");
      localStorage.removeItem("user");
      // Redirect to login page if not already there
      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    }
    
    // Handle 403 Forbidden
    if (error.response?.status === 403) {
      console.error("Forbidden! You don't have permission.");
    }
    
    // Handle 500 Server Error
    if (error.response?.status === 500) {
      console.error("Server error! Please try again later.");
    }
    
    // Log error in development
    if (import.meta.env.DEV) {
      console.error(`❌ ${error.config?.url} - ${error.response?.status}`);
      console.error("Error details:", error.response?.data);
    }
    
    return Promise.reject(error);
  }
);

export default api;