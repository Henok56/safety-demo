import api from "../api";

// =======================
// AUTH
// =======================
const register = (data) => api.post("/auth/register", data);

const login = async (data) => {
  const res = await api.post("/auth/login", data);

  if (res.data?.data?.accessToken) {
    localStorage.setItem("accessToken", res.data.data.accessToken);
    localStorage.setItem("user", JSON.stringify(res.data.data.user));
  }

  return res.data;
};

const logout = () => {
  localStorage.removeItem("accessToken");
  localStorage.removeItem("user");
  return api.post("/auth/logout");
};

const getMe = () => api.get("/auth/me");
const getCurrentUser = () => getMe();

// =======================
// PASSWORD
// =======================
const resetPassword = (data) =>
  api.post("/auth/reset-password", data);

// =======================
// EMPLOYEE PROFILE
// =======================
const checkEmployeeProfile = () =>
  api.get("/auth/check-employee-profile");

const registerEmployeeProfile = (data) =>
  api.post("/auth/register-employee", data);

const getEmployees = () =>
  api.get("/auth/employees");

// =======================
// USERS
// =======================
const getUsers = () => api.get("/auth/users");

const getUsersDropdown = () =>
  api.get("/auth/users/dropdown");

const checkUserProfile = (id) =>
  api.get(`/auth/users/${id}/check-profile`);

// =======================
// EXPORT SINGLE OBJECT (IMPORTANT FIX)
// =======================
const authApi = {
  register,
  login,
  logout,
  getMe,
  getCurrentUser,
  resetPassword,
  checkEmployeeProfile,
  registerEmployeeProfile,
  getEmployees,
  getUsers,
  getUsersDropdown,
  checkUserProfile,
};

export default authApi;