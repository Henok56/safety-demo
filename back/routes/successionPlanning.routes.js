const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");
const role = require("../middleware/verifyAdminMiddleware"); 
const { 
  getSuccessions, 
  getSuccession, 
  createSuccession, 
  updateSuccession, 
  deleteSuccession 
} = require("../controllers/successionPlanning.controller");

/**
 * Succession Planning Access Control:
 * - View/Create/Update: Superadmin, Manager, Team Leader
 * - Delete: Superadmin, Manager ONLY
 * - Scheduler: Access Denied
 */

// GET - View succession list
router.get("/", 
  auth, 
  role(["superadmin", "manager", "team_leader"]), 
  getSuccessions
);

// GET - View specific plan
router.get("/:id", 
  auth, 
  role(["superadmin", "manager", "team_leader"]), 
  getSuccession
);

// POST - Create succession plan
router.post("/", 
  auth, 
  role(["superadmin", "manager", "team_leader"]), 
  createSuccession
);

// PUT - Update succession plan
router.put("/:id", 
  auth, 
  role(["superadmin", "manager", "team_leader"]), 
  updateSuccession
);

// DELETE - Strictly restricted to higher management
router.delete("/:id", 
  auth, 
  role(["superadmin", "manager"]), 
  deleteSuccession
);

module.exports = router;