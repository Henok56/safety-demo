// C:\Users\HenokGs\Desktop\office_projects\back\routes\authRoutes.js

const express = require("express");
const router = express.Router();

// 🔐 Middleware
const authMiddleware = require("../middleware/authMiddleware");

// 📦 Controllers
const { 
  register, 
  login, 
  logout, 
  getMe, 
  resetPassword,
  checkEmployeeProfile,
  registerEmployeeProfile,
  getAllEmployees,
  getAllUsers,
  getAllUsersWithProfile,
  checkUserEmployeeProfile
} = require("../controllers/authController");

console.log("✅ Auth routes loaded");

// ==============================
// 🌐 PUBLIC ROUTES
// ==============================
router.post("/register", register);
router.post("/login", login);
router.post("/reset-password", resetPassword);

// ==============================
// 🔒 PROTECTED ROUTES
// ==============================
router.post("/logout", authMiddleware, logout);
router.get("/me", authMiddleware, getMe);

// ==============================
// 👤 EMPLOYEE PROFILE
// ==============================
router.get("/check-employee-profile", authMiddleware, checkEmployeeProfile);
router.post("/register-employee", authMiddleware, registerEmployeeProfile);
router.get("/employees", authMiddleware, getAllEmployees);

// ==============================
// 👥 USERS
// ==============================
router.get("/users", authMiddleware, getAllUsers);
router.get("/users/dropdown", authMiddleware, getAllUsersWithProfile);
router.get("/users/:userId/check-profile", authMiddleware, checkUserEmployeeProfile);

module.exports = router;