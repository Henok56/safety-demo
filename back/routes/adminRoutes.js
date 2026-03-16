const express = require("express");
const router = express.Router();

// Middlewares
const authMiddleware = require("../middleware/authMiddleware"); 
const verifyAdminMiddleware = require("../middleware/verifyAdminMiddleware"); 

// Controllers
const { 
  getAllUsers, 
  updateUserRole, 
  makeAdmin, 
  deleteUser 
} = require("../controllers/adminController");

// Audit Controller Functions
const { 
  getOccurrenceAudit, 
  getScheduleAudit 
} = require("../controllers/auditController");

// --- User Management ---
router.get("/users", authMiddleware, verifyAdminMiddleware(["superadmin", "manager", "team_leader", "scheduler"]), getAllUsers);
router.put("/users/:id/role", authMiddleware, verifyAdminMiddleware(["superadmin"]), updateUserRole);
router.post("/make-admin", authMiddleware, verifyAdminMiddleware(["superadmin"]), makeAdmin);
router.delete("/users/:username", authMiddleware, verifyAdminMiddleware(["superadmin"]), deleteUser);

// --- Audit Management ---
// 🚩 This path + the server.js prefix results in: /api/admin/audit/occurrences
router.get(
  "/audit/occurrences", 
  authMiddleware, 
  verifyAdminMiddleware(["superadmin", "manager", "team_leader"]), 
  getOccurrenceAudit
);

// 🚩 This path + the server.js prefix results in: /api/admin/audit/schedules
router.get(
  "/audit/schedules", 
  authMiddleware, 
  verifyAdminMiddleware(["superadmin", "manager", "team_leader"]), 
  getScheduleAudit
);

module.exports = router;