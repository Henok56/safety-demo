import api from "../api";

const BASE_URL = "/fleet-assignments";

/**
 * ==============================
 * 1. GET ALL ASSIGNMENTS
 * ==============================
 */
export const getAllAssignments = async (params = {}) => {
  try {
    const res = await api.get(BASE_URL, { params });
    return res.data;
  } catch (err) {
    throw err.response?.data || err.message;
  }
};

/**
 * ==============================
 * 2. GET ASSIGNMENTS BY EMPLOYEE
 * ==============================
 */
export const getAssignmentsByEmployee = async (employeeId) => {
  try {
    const res = await api.get(`${BASE_URL}/employee/${employeeId}`);
    return res.data;
  } catch (err) {
    throw err.response?.data || err.message;
  }
};

/**
 * ==============================
 * 3. GET SINGLE ASSIGNMENT
 * ==============================
 */
export const getAssignmentById = async (id) => {
  try {
    const res = await api.get(`${BASE_URL}/${id}`);
    return res.data;
  } catch (err) {
    throw err.response?.data || err.message;
  }
};

/**
 * ==============================
 * 4. CREATE ASSIGNMENT
 * ==============================
 */
export const createAssignment = async (data) => {
  try {
    const res = await api.post(BASE_URL, data);
    return res.data;
  } catch (err) {
    throw err.response?.data || err.message;
  }
};

/**
 * ==============================
 * 5. UPDATE ASSIGNMENT
 * ==============================
 */
export const updateAssignment = async (id, data) => {
  try {
    const res = await api.put(`${BASE_URL}/${id}`, data);
    return res.data;
  } catch (err) {
    throw err.response?.data || err.message;
  }
};

/**
 * ==============================
 * 6. DELETE ASSIGNMENT
 * ==============================
 */
export const deleteAssignment = async (id) => {
  try {
    const res = await api.delete(`${BASE_URL}/${id}`);
    return res.data;
  } catch (err) {
    throw err.response?.data || err.message;
  }
};

/**
 * ==============================
 * 7. GET ALL EMPLOYEES
 * ==============================
 */
export const getAllEmployees = async () => {
  try {
    const res = await api.get(`${BASE_URL}/employees`);
    return res.data;
  } catch (err) {
    throw err.response?.data || err.message;
  }
};