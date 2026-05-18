import api from "../api";

// =======================
// TIMER
// =======================
export const startTimer = ({ employee, employeeId, type, reason }) =>
  api.post("/unproductive-time/start", {
    employee: employee || employeeId,
    type,
    reason,
  });

export const stopTimer = (id) =>
  api.patch(`/unproductive-time/stop/${id}`);

export const getActiveTimer = () =>
  api.get("/unproductive-time/active");


// =======================
// ENTRIES (CRUD)
// =======================
export const getEntries = (params) =>
  api.get("/unproductive-time", { params });

export const getEntry = (id) =>
  api.get(`/unproductive-time/${id}`);

export const createEntry = (data) =>
  api.post("/unproductive-time", data);

export const updateEntry = (id, data) =>
  api.put(`/unproductive-time/${id}`, data);

export const deleteEntry = (id) =>
  api.delete(`/unproductive-time/${id}`);


// =======================
// APPROVAL FLOW
// =======================
export const approveEntry = (id) =>
  api.patch(`/unproductive-time/${id}/approve`);

export const rejectEntry = (id, data) =>
  api.patch(`/unproductive-time/${id}/reject`, data);


// =======================
// ANALYTICS / STATS
// =======================
export const getStatisticsSummary = () =>
  api.get("/unproductive-time/stats/summary");

export const getEmployeesForTimer = () =>
  api.get("/employees");


// =======================
// DEFAULT EXPORT (optional)
// =======================
export default {
  startTimer,
  stopTimer,
  getActiveTimer,

  getEntries,
  getEntry,
  createEntry,
  updateEntry,
  deleteEntry,

  approveEntry,
  rejectEntry,

  getStatisticsSummary,
  getEmployeesForTimer,
};
