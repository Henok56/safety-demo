const express = require("express");
const router = express.Router();
const { getTrainings, createTraining, deleteTraining } = require("../controllers/training.controller");
const auth = require("../middleware/authMiddleware");
const role = require("../middleware/verifyAdminMiddleware");

/**
 * General Training Access Control:
 * - Read (GET): All authenticated users (including Schedulers/Users)
 * - Create (POST): Superadmin, Manager, Team Leader
 * - Delete (DELETE): Superadmin, Manager, Team Leader
 */

// Anyone logged in can view the training list
router.get("/", auth, getTrainings);

// Only leadership can add new training sessions
router.post("/", 
  auth, 
  role(["superadmin", "manager", "team_leader"]), 
  createTraining
);

// Only leadership can remove training sessions
router.delete("/:id", 
  auth, 
  role(["superadmin", "manager", "team_leader"]), 
  deleteTraining
);

module.exports = router;