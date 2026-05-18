import api from "../api";

const BASE_URL = "/fdm-handling";

// ==============================
// SYNC FROM CASSIOPEE
// ==============================
export const syncFdmFromCassiopee = async () => {
  try {
    const res = await api.post(`${BASE_URL}/sync`);
    return res.data;
  } catch (err) {
    throw err.response?.data || err.message;
  }
};

// ==============================
// DASHBOARD SUMMARY
// ==============================
export const getDashboardSummary = async (params = {}) => {
  try {
    const res = await api.get(`${BASE_URL}/dashboard`, { params });
    return res.data;
  } catch (err) {
    throw err.response?.data || err.message;
  }
};

// ==============================
// OVERDUE EVENTS
// ==============================
export const getOverdueEvents= async (params = {}) => {
  try {
    const res = await api.get(`${BASE_URL}/overdue`, { params });
    return res.data;
  } catch (err) {
    throw err.response?.data || err.message;
  }
};

// ==============================
// ALL EVENTS
// ==============================
export const getAllFdmEvents = async (params = {}) => {
  try {
    const res = await api.get(`${BASE_URL}/all`, { params });
    return res.data;
  } catch (err) {
    throw err.response?.data || err.message;
  }
};

// ==============================
// PERFORMANCE METRICS
// ==============================
export const getFdmPerformance = async (params = {}) => {
  try {
    const res = await api.get(`${BASE_URL}/performance`, { params });
    return res.data;
  } catch (err) {
    throw err.response?.data || err.message;
  }
};

// ==============================
// SINGLE EVENT
// ==============================
export const getFdmEventById = async (id) => {
  try {
    const res = await api.get(`${BASE_URL}/event/${id}`);
    return res.data;
  } catch (err) {
    throw err.response?.data || err.message;
  }
};

// ==============================
// UPDATE EVENT STATUS
// ==============================
export const updateFdmEventStatus = async (id, status) => {
  try {
    const res = await api.patch(`${BASE_URL}/event/${id}/status`, {
      status,
    });
    return res.data;
  } catch (err) {
    throw err.response?.data || err.message;
  }
};

// ==============================
// GET FLEET LIST
// ==============================
export const getFdmFleets = async () => {
  try {
    const res = await api.get(`${BASE_URL}/fleets`);
    return res.data;
  } catch (err) {
    throw err.response?.data || err.message;
  }
};