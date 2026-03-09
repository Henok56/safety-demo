const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");
const verifyRole = require("../middleware/verifyAdminMiddleware"); // Renamed for consistency with your other routes
const {
  getCoachings,
  createCoaching,
  updateCoaching,
  deleteCoaching
} = require("../controllers/coaching.controller");

/**
 * Coaching Access Control:
 * - Superadmin, Manager, Team Leader: Access Allowed
 * - Scheduler: Access Denied (Hidden from Nav and Blocked by API)
 */

// GET - View all coachings
router.get("/", 
  auth, 
  verifyRole(["superadmin", "manager", "team_leader"]), 
  getCoachings
);

// POST - Create new coaching
router.post("/", 
  auth, 
  verifyRole(["superadmin", "manager", "team_leader"]), 
  createCoaching
);

// PUT - Update coaching
router.put("/:id", 
  auth, 
  verifyRole(["superadmin", "manager", "team_leader"]), 
  updateCoaching
);

// DELETE - Remove coaching (Management Only)
router.delete("/:id", 
  auth, 
  verifyRole(["superadmin", "manager"]), 
  deleteCoaching
);

module.exports = router;