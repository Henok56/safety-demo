import axios from "axios";

// 1️⃣ Determine the Base URL dynamically
// If we are on localhost, use the local backend. 
// If deployed, use the HTTPS production URL (no port 5000).
const isLocalhost = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";

const BASE_URL = isLocalhost 
  ? "http://localhost:5000/api" 
  : "https://safetyoffice-yqn3.vercel.app/api"; // Ensure this matches your deployed backend endpoint

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
    // Check if the error is 401 and we aren't already on the login page
    if (error.response?.status === 401 && !window.location.pathname.includes("/login")) {
      
      // Clear localStorage in case token is invalid or expired
      localStorage.removeItem("accessToken");
      localStorage.removeItem("user");

      // Redirect to login
      window.location.href = "/login"; 
    }
    return Promise.reject(error);
  }
);

export default api;