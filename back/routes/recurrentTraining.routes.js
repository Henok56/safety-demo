const express = require("express");
const auth = require("../middleware/authMiddleware");
const verifyRole = require("../middleware/verifyAdminMiddleware");
const {
  createRecurrentTraining,
  getRecurrentTrainings,
  updateRecurrentTraining,
  deleteRecurrentTraining
} = require("../controllers/recurrentTraining.controller");

const router = express.Router();

/**
 * Recurrent Training Access Control:
 * - View/Create/Update: Superadmin, Manager, Team Leader
 * - Delete: Superadmin, Manager ONLY
 * - Scheduler: Access Denied
 */

// GET all training records (Fixes 403 in Dashboard)
router.get("/", 
  auth, 
  verifyRole(["superadmin", "manager", "team_leader", "user"]), 
  getRecurrentTrainings
);

// POST new training record
router.post("/", 
  auth, 
  verifyRole(["superadmin", "manager", "team_leader"]), 
  createRecurrentTraining
);

// PUT update training record
router.put("/:id", 
  auth, 
  verifyRole(["superadmin", "manager", "team_leader"]), 
  updateRecurrentTraining
);

// DELETE training record (Higher management only)
router.delete("/:id", 
  auth, 
  verifyRole(["superadmin", "manager"]), 
  deleteRecurrentTraining
);

module.exports = router;