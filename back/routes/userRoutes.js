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
} = require("../controllers/userController");

// Audit Controller Functions
const { 
  getOccurrenceAudit, 
  getScheduleAudit 
} = require("../controllers/auditController");

// --- User Management ---
router.get("/users", authMiddleware, verifyAdminMiddleware(["superadmin", "manager", "team_leader", "scheduler", "user"]), getAllUsers);
router.put("/users/:id/role", authMiddleware, verifyAdminMiddleware(["superadmin"]), updateUserRole);
router.post("/make-admin", authMiddleware, verifyAdminMiddleware(["superadmin"]), makeAdmin);
router.delete("/users/:username", authMiddleware, verifyAdminMiddleware(["superadmin"]), deleteUser);

// --- Audit Management ---
// NOTE: Audit routes now live in auditRoutes.js under /api/admin/audit

module.exports = router;