const express = require("express");
const router = express.Router();

const scheduleCtrl = require("../controllers/scheduleController");

// Correct import — your middleware exports a single function
const verifyToken = require("../middleware/authMiddleware");

// Correct import — your RBAC middleware exports a single function
const verifyRoles = require("../middleware/verifyAdminMiddleware");

// Debug logs (optional — remove after testing)
console.log("verifyRoles import:", verifyRoles);
console.log("scheduleCtrl:", scheduleCtrl);
console.log("Route GET / typeof:", typeof scheduleCtrl.getSchedules);
console.log("Route POST / typeof:", typeof scheduleCtrl.createSchedule);
console.log("Route PUT / typeof:", typeof scheduleCtrl.updateSchedule);
console.log("Route DELETE / typeof:", typeof scheduleCtrl.deleteSchedule);

// All routes require token
router.use(verifyToken);

// PUBLIC VIEW
router.get("/public", scheduleCtrl.getPublicSchedules);

// ADMIN & TREND VIEW
router.get(
  "/",
  verifyRoles(["superadmin", "manager", "team_leader", "scheduler", "user"]),
  scheduleCtrl.getSchedules
);

router.post(
  "/",
  verifyRoles(["manager", "scheduler"]),
  scheduleCtrl.createSchedule
);

router.put(
  "/:id",
  verifyRoles(["manager", "team_leader", "scheduler"]),
  scheduleCtrl.updateSchedule
);

router.delete(
  "/:id",
  verifyRoles(["manager", "team_leader"]),
  scheduleCtrl.deleteSchedule
);

module.exports = router;
