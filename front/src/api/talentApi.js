import axios from "axios";

const api = axios.create({
  // Ensure this matches your backend IP/Port
  baseURL: "http://localhost:5000/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// ------------------ REQUEST INTERCEPTOR ------------------
api.interceptors.request.use(
  (config) => {
    // ✅ FIXED: Changed "token" to "accessToken" to match your Login.jsx
    const token = localStorage.getItem("accessToken"); 
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    } else {
      // This will help you see if a specific route is firing before login is complete
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
    // Check if the server sent a specific error message (like Mongoose validation)
    const serverMessage = error.response?.data?.message || error.response?.data?.error;
    
    if (error.response?.status === 400) {
      console.error("❌ Validation Error:", serverMessage);
      alert(`Submission Failed: ${serverMessage}`); // Temporary alert for debugging
    }

    if (error.response?.status === 401) {
      localStorage.removeItem("accessToken");
      window.location.href = "/login"; 
    }
    return Promise.reject(error);
  }
);

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
// ✅ Corrected to match your backend: /api/recurrent-training
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