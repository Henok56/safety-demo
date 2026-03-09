const express = require("express");
const router = express.Router();

// Middlewares
const authMiddleware = require("../middleware/authMiddleware"); 
const verifyAdminMiddleware = require("../middleware/verifyAdminMiddleware"); 

// Controller functions
const {
  getAllUsers,
  makeAdmin, 
  deleteUser,
  updateUserRole, 
} = require("../controllers/adminController");

// Import the audit controller functions
const { getOccurrenceAudit, getScheduleAudit } = require("../controllers/auditController");

// --------------------
// 1️⃣ USER MANAGEMENT ROUTES
// --------------------
router.get("/users", authMiddleware, verifyAdminMiddleware(["superadmin", "manager"]), getAllUsers);
router.put("/users/:id/role", authMiddleware, verifyAdminMiddleware(["superadmin"]), updateUserRole);
router.post("/make-admin", authMiddleware, verifyAdminMiddleware(["superadmin"]), makeAdmin);
router.delete("/users/:username", authMiddleware, verifyAdminMiddleware(["superadmin"]), deleteUser);

// --------------------
// 2️⃣ SYSTEM AUDIT ROUTES
// --------------------

/**
 * GET /api/admin/audit/occurrences
 * Matches AdminAudit.jsx call
 */
router.get(
  "/audit/occurrences",
  authMiddleware,
  verifyAdminMiddleware(["superadmin", "manager", "team_leader"]),
  getOccurrenceAudit // 🚩 Updated to match your controller
);

/**
 * GET /api/admin/audit/schedules
 * Useful for tracking schedule changes
 */
router.get(
  "/audit/schedules",
  authMiddleware,
  verifyAdminMiddleware(["superadmin", "manager", "team_leader"]),
  getScheduleAudit // 🚩 Updated to match your controller
);

module.exports = router;