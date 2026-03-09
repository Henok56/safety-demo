const express = require("express");
const auth = require("../middleware/authMiddleware");
const verifyRole = require("../middleware/verifyAdminMiddleware");

const {
  createCareer,
  getCareers,
  getCareer,
  updateCareer,
  deleteCareer
} = require("../controllers/careerDevelopment.controller");

const router = express.Router();


// ===============================
// CREATE
// ===============================
router.post(
  "/",
  auth,
  verifyRole(["superadmin", "manager", "team_leader"]),
  createCareer
);

// ===============================
// GET ALL
// ===============================
router.get(
  "/",
  auth,
  verifyRole(["superadmin", "manager", "team_leader"]),
  getCareers
);

// ===============================
// GET SINGLE
// ===============================
router.get(
  "/:id",
  auth,
  verifyRole(["superadmin", "manager", "team_leader"]),
  getCareer
);

// ===============================
// UPDATE
// ===============================
router.put(
  "/:id",
  auth,
  verifyRole(["superadmin", "manager", "team_leader"]),
  updateCareer
);

// ===============================
// DELETE
// ===============================
router.delete(
  "/:id",
  auth,
  verifyRole(["superadmin", "manager"]),
  deleteCareer
);

module.exports = router;