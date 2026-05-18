// src/api/adminApi.js
import api from "../api";

// =======================
// USER MANAGEMENT
// =======================
export const getAllUsers = () =>
  api.get("/admin/users");

export const updateUserRole = (id, role) =>
  api.put(`/admin/users/${id}/role`, { role });

export const makeAdmin = (userId) =>
  api.post("/admin/make-admin", { userId });

export const deleteUser = (id) =>
  api.delete(`/admin/users/${id}`);

// =======================
// AUDIT
// =======================
export const getOccurrenceAudit = () =>
  api.get("/admin/audit/occurrences");

export const getScheduleAudit = () =>
  api.get("/admin/audit/schedules");