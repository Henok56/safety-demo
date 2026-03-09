// src/api/occurrences.js
import api from "../api"; // centralized axios instance

// ---------------- CREATE OCCURRENCE ----------------
export const createOccurrence = async (data) => {
  try {
    const res = await api.post("/occurrences", data);
    return res.data; // { success, data, message }
  } catch (err) {
    const message =
      err.response?.data?.message || err.message || "Failed to create occurrence";
    console.error(message);
    throw new Error(message);
  }
};

// ---------------- UPDATE OCCURRENCE ----------------
export const updateOccurrence = async (id, data) => {
  if (!id) throw new Error("Occurrence ID is required for update");

  try {
    const res = await api.put(`/occurrences/${id}`, data);
    return res.data;
  } catch (err) {
    const message =
      err.response?.data?.message || err.message || "Failed to update occurrence";
    console.error(message);
    throw new Error(message);
  }
};

// ---------------- DELETE OCCURRENCE ----------------
export const deleteOccurrence = async (id) => {
  if (!id) throw new Error("Occurrence ID is required for deletion");

  try {
    const res = await api.delete(`/occurrences/${id}`);
    return res.data;
  } catch (err) {
    const message =
      err.response?.data?.message || err.message || "Failed to delete occurrence";
    console.error(message);
    throw new Error(message);
  }
};

// ---------------- GET OCCURRENCES ----------------
export const getOccurrences = async (params = {}) => {
  try {
    const res = await api.get("/occurrences", { params });
    return res.data;
  } catch (err) {
    const message =
      err.response?.data?.message || err.message || "Failed to fetch occurrences";
    console.error(message);
    throw new Error(message);
  }
};
