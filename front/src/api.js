import axios from "axios";

// =======================
// AXIOS INSTANCE (PUT IT HERE)
// =======================
const BASE_URL = import.meta.env.VITE_BACKEND_URL || "http://lohttps://safety-backend.vercel.appcalhost:4000/api";

const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
  timeout: 15000,
});

// =======================
// TOKEN INTERCEPTOR
// =======================
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export default api;