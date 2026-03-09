const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");
const verifyRole = require("../middleware/verifyAdminMiddleware"); 
const {
  getLeaderships,
  createLeadership,
  updateLeadership,
  deleteLeadership
} = require("../controllers/leadershipDevelopment.controller");

/**
 * Leadership Development Access Control:
 * - Superadmin & Manager: Full access (CRUD)
 * - Team Leader: View and Update
 * - Scheduler: No Access (Blocked by Nav and API)
 */

// GET - View all records
router.get("/", 
  auth, 
  verifyRole(["superadmin", "manager", "team_leader"]), 
  getLeaderships
);

// POST - Create new record
router.post("/", 
  auth, 
  verifyRole(["superadmin", "manager", "team_leader"]), 
  createLeadership
);

// PUT - Update record
router.put("/:id", 
  auth, 
  verifyRole(["superadmin", "manager", "team_leader"]), 
  updateLeadership
);

// DELETE - Management Only
router.delete("/:id", 
  auth, 
  verifyRole(["superadmin", "manager"]), 
  deleteLeadership
);

module.exports = router;