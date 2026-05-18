// C:\Users\HenokGs\Desktop\office_projects\back\routes\adminRoutes.js

const express = require("express");
const router = express.Router();

// 🔐 Middleware (IMPORTANT: match your authController)
const authMiddleware = require("../middleware/authMiddleware");
const verifyRole = require("../middleware/verifyAdminMiddleware");

// 📦 Controllers

// ✅ USER MANAGEMENT (correct file)
const {
  getAllUsers,
  makeAdmin,
  deleteUser,
  updateUserRole,
} = require("../controllers/adminController");

// ✅ AUDIT (correct file)
const {
  getOccurrenceAudit,
  getScheduleAudit,
} = require("../controllers/auditController");

console.log("✅ Admin routes loaded");

// ==============================
// 👥 USER MANAGEMENT
// ==============================

router.get(
  "/users",
  authMiddleware,
  verifyRole(["superadmin", "manager"]),
  getAllUsers
);

router.put(
  "/users/:id/role",
  authMiddleware,
  verifyRole(["superadmin"]),
  updateUserRole
);

router.post(
  "/make-admin",
  authMiddleware,
  verifyRole(["superadmin"]),
  makeAdmin
);

router.delete(
  "/users/:id",
  authMiddleware,
  verifyRole(["superadmin"]),
  deleteUser
);

// ==============================
// 📊 AUDIT ROUTES
// ==============================

router.get(
  "/audit/occurrences",
  authMiddleware,
  verifyRole(["superadmin", "manager"]),
  getOccurrenceAudit
);

router.get(
  "/audit/schedules",
  authMiddleware,
  verifyRole(["superadmin", "manager"]),
  getScheduleAudit
);

module.exports = router;