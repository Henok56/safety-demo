const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware"); // verifies JWT
const { getUserSchedules } = require("../controllers/scheduleController");

// ===========================
// Protected Routes (logged-in users only)
// ===========================

// Get schedules for the logged-in user
router.get("/user", authMiddleware, getUserSchedules);

module.exports = router;
