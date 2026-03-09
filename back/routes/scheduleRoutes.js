const express = require("express");
const router = express.Router();

// Middlewares
const authMiddleware = require("../middleware/authMiddleware");
const verifyAdmin = require("../middleware/verifyAdminMiddleware"); 

// Controller functions
const {
  getPublicSchedules,
  getSchedules,
  createSchedule,
  updateSchedule,
  deleteSchedule,
} = require("../controllers/scheduleController");

// ================= PUBLIC ROUTES =================
// Accessible without a token
router.get("/public", getPublicSchedules);

// ================= ADMIN/STAFF ROUTES =================

/**
 * GET - View Schedules
 * Allowed: superadmin, manager, team_leader, scheduler
 */
router.get("/", 
  authMiddleware, 
  verifyAdmin(["superadmin", "manager", "team_leader", "scheduler"]), 
  getSchedules
);

/**
 * POST - Create Schedule
 * Allowed: superadmin, manager, team_leader, scheduler
 */
router.post("/", 
  authMiddleware, 
  verifyAdmin(["superadmin", "manager", "team_leader", "scheduler"]), 
  createSchedule
);

/**
 * PUT - Update Schedule
 * Allowed: superadmin, manager, team_leader, scheduler
 */
router.put("/:id", 
  authMiddleware, 
  verifyAdmin(["superadmin", "manager", "team_leader", "scheduler"]), 
  updateSchedule
);

/**
 * DELETE - Remove Schedule
 * Allowed: superadmin, manager, team_leader
 * Restricted: scheduler (Cannot delete)
 */
router.delete("/:id", 
  authMiddleware, 
  verifyAdmin(["superadmin", "manager", "team_leader"]), 
  deleteSchedule
);

module.exports = router;