const express = require("express");
const router = express.Router();

// Ensure this path matches where you keep your middleware
const authMiddleware = require("../middleware/authMiddleware");
const { register, login, logout, getMe, resetPassword } = require("../controllers/authController");

console.log("✈️ Auth routes initialized");

// Public Routes
router.post("/register", register);
router.post("/login", login);

// Protected Routes (Require Token)
router.post("/logout", authMiddleware, logout);
router.get("/me", authMiddleware, getMe);

// Manual Reset Password
router.post("/reset-password", authMiddleware, resetPassword);

module.exports = router;