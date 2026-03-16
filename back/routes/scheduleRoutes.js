// routes/scheduleRoutes.js
const express = require("express");
const router = express.Router();

// Middlewares
const authMiddleware = require("../middleware/authMiddleware");
const verifyRoles = require("../middleware/verifyAdminMiddleware");

// Controller
const scheduleController = require("../controllers/scheduleController");

// ================= ROLE MAP =================
// Define allowed roles for each action
const ROLE_MAP = {
  view: ["superadmin", "manager", "team_leader", "scheduler"],
  create: ["superadmin", "manager", "team_leader", "scheduler"],
  update: ["superadmin", "manager", "team_leader", "scheduler"],
  delete: ["superadmin", "manager", "team_leader"], // scheduler cannot delete
};

// ================= HELPER =================
// Returns array of middlewares; use spread in routes
const protectAndAuthorize = (roles) => [authMiddleware, verifyRoles(roles)];

// ================= PUBLIC ROUTES =================
// Accessible without authentication
router.get("/public", scheduleController.getPublicSchedules);

// ================= ADMIN/STAFF ROUTES =================
// GET - View schedules
router.get("/", ...protectAndAuthorize(ROLE_MAP.view), scheduleController.getSchedules);

// POST - Create schedule
router.post("/", ...protectAndAuthorize(ROLE_MAP.create), scheduleController.createSchedule);

// PUT - Update schedule
router.put("/:id", ...protectAndAuthorize(ROLE_MAP.update), scheduleController.updateSchedule);

// DELETE - Remove schedule
router.delete("/:id", ...protectAndAuthorize(ROLE_MAP.delete), scheduleController.deleteSchedule);

module.exports = router;