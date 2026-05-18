import axios from "axios";

// Correct base URL
const BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:4000";

const api = axios.create({
  baseURL: BASE_URL + "/api",
  withCredentials: true,
  timeout: 15000,
});

// TOKEN INTERCEPTOR
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export default api;