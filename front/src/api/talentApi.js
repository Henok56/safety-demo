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
 * 🚀 DYNAMIC BASE_URL:
 * - Local: Uses the full address with port 5000.
 * - Production: Uses a relative path "/api". 
 * This kills the "Mixed Content" error by forcing the browser to stay on HTTPS.
 */
const BASE_URL = isLocal 
  ? `http://${window.location.hostname}:5000/api` 
  : "/api"; 

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, // Needed for secure session handling
});

// ------------------ REQUEST INTERCEPTOR ------------------
api.interceptors.request.use(
  (config) => {
    // ✅ Matches your Login.jsx storage key
    const token = localStorage.getItem("accessToken"); 
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    } else {
      // Helps debug if a request fires before the user is logged in
      console.warn(`⚠️ No accessToken found for: ${config.url}`);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ------------------ RESPONSE INTERCEPTOR ------------------
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const serverMessage = error.response?.data?.message || error.response?.data?.error;
    
    // 400 Bad Request (Validation errors)
    if (error.response?.status === 400) {
      console.error("❌ Validation Error:", serverMessage);
    }

    // 401 Unauthorized (Expired or missing token)
    if (error.response?.status === 401 && !window.location.pathname.includes("/login")) {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("user");
      window.location.href = "/login"; 
    }
    return Promise.reject(error);
  }
);

/* ============================================================
    EXPORTED API SERVICES (Unified under 'api' instance)
   ============================================================ */

// ------------------ CAREER DEVELOPMENT ------------------
export const getCareerRecords = () => api.get("/career");
export const createCareerRecord = (payload) => api.post("/career", payload);
export const updateCareerRecord = (id, payload) => api.put(`/career/${id}`, payload);
export const deleteCareerRecord = (id) => api.delete(`/career/${id}`);

// ------------------ COACHING ------------------
export const getCoachingRecords = () => api.get("/coaching");
export const createCoachingRecord = (payload) => api.post("/coaching", payload);
export const updateCoachingRecord = (id, payload) => api.put(`/coaching/${id}`, payload);
export const deleteCoachingRecord = (id) => api.delete(`/coaching/${id}`);

// ------------------ LEADERSHIP DEVELOPMENT ------------------
export const getLeadershipRecords = () => api.get("/leadership");
export const createLeadershipRecord = (payload) => api.post("/leadership", payload);
export const updateLeadershipRecord = (id, payload) => api.put(`/leadership/${id}`, payload);
export const deleteLeadershipRecord = (id) => api.delete(`/leadership/${id}`);

// ------------------ RECURRENT TRAINING ------------------
export const getRecurrentRecords = () => api.get("/recurrent-training");
export const createRecurrentRecord = (payload) => api.post("/recurrent-training", payload);
export const updateRecurrentRecord = (id, payload) => api.put(`/recurrent-training/${id}`, payload);
export const deleteRecurrentRecord = (id) => api.delete(`/recurrent-training/${id}`);

// ------------------ SUCCESSION PLANNING ------------------
export const getSuccessionRecords = () => api.get("/succession");
export const createSuccessionRecord = (payload) => api.post("/succession", payload);
export const updateSuccessionRecord = (id, payload) => api.put(`/succession/${id}`, payload);
export const deleteSuccessionRecord = (id) => api.delete(`/succession/${id}`);

// ------------------ EMPLOYEES & TOPICS ------------------
export const getEmployees = () => api.get("/employees");

export const getTopicsByCategory = (category) =>
  api.get(`/trainings${category ? `?category=${encodeURIComponent(category)}` : ""}`);

export default api;