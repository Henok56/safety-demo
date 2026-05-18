// src/api/schedule.js
import api from "../api"; // centralized axios instance

// ---------------------------
// Admin endpoints
// ---------------------------

// Add a new schedule (admin)
export const addSchedule = async (scheduleData) => {
  try {
    const res = await api.post("/schedules", scheduleData);
    return res.data; // { success, data, message }
  } catch (err) {
    const message = err.response?.data?.message || err.message;
    console.error("Failed to add schedule:", message);
    throw new Error(message);
  }
};

// Get all schedules (admin) with optional date filter
export const getSchedules = async (from, to) => {
  try {
    const params = {};
    if (from) params.from = from;
    if (to) params.to = to;

    const res = await api.get("/schedules", { params });
    return res.data.data || [];
  } catch (err) {
    const message = err.response?.data?.message || err.message;
    console.error("Failed to fetch schedules:", message);
    throw new Error(message);
  }
};

// Update schedule (admin)
export const updateSchedule = async (id, updates) => {
  if (!id) throw new Error("Schedule ID is required");

  try {
    const res = await api.put(`/schedules/${id}`, updates);
    return res.data;
  } catch (err) {
    const message = err.response?.data?.message || err.message;
    console.error("Failed to update schedule:", message);
    throw new Error(message);
  }
};

// Delete schedule (admin)
export const deleteSchedule = async (id) => {
  if (!id) throw new Error("Schedule ID is required");

  try {
    const res = await api.delete(`/schedules/${id}`);
    return res.data;
  } catch (err) {
    const message = err.response?.data?.message || err.message;
    console.error("Failed to delete schedule:", message);
    throw new Error(message);
  }
};

// ---------------------------
// User endpoints (read-only)
// ---------------------------

// Get schedules assigned to current user
// Get schedules assigned to current user
export const getUserSchedules = async () => {
  try {
    const res = await api.get("/schedules/user"); // <-- fixed path
    return res.data.data || [];
  } catch (err) {
    const message = err.response?.data?.message || err.message;
    console.error("Failed to fetch user schedules:", message);
    throw new Error(message);
  }
};
