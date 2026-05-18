// src/api/employeeApi.js
import api from "../api";

// =======================
// EMPLOYEE CRUD
// =======================
export const getEmployees = () =>
  api.get("/employees");

export const getEmployee = (id) =>
  api.get(`/employees/${id}`);

export const createEmployee = (data) =>
  api.post("/employees", data);

export const updateEmployee = (id, data) =>
  api.put(`/employees/${id}`, data);

export const deleteEmployee = (id) =>
  api.delete(`/employees/${id}`);

// =======================
// HELPERS
// =======================
export const getAvailableUsers = () =>
  api.get("/employees/available-users");