import axios from "axios";

// 1️⃣ Create Axios instance
const api = axios.create({
  baseURL: `http://${window.location.hostname}:5000/api`,
  // ✅ Remove withCredentials since no cookies are used
});

// 2️⃣ Attach access token from localStorage to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 3️⃣ Handle 401 responses globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && window.location.pathname !== "/login") {
      // Clear localStorage in case token is invalid or expired
      localStorage.removeItem("accessToken");
      localStorage.removeItem("user");

      window.location.href = "/login"; // redirect on unauthorized
    }
    return Promise.reject(error);
  }
);

export default api;
