const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");

const {
  startTimer,
  stopTimer,
  getActiveTimer,
  getAllEntries,
  getEntryById,
  createEntry,
  updateEntry,
  deleteEntry,
  approveEntry,
  rejectEntry,
  getStatisticsSummary,
} = require("../controllers/unproductiveTimeController");

router.use(auth.protect);

// =======================
// ⏱ TIMER
// =======================
router.post("/start", startTimer);
router.patch("/stop/:id", stopTimer);
router.get("/active", getActiveTimer);

// =======================
// 📊 STATS (⚠️ MUST COME BEFORE :id)
// =======================
router.get("/stats/summary", getStatisticsSummary);

// =======================
// 📋 ENTRIES
// =======================
router.get("/", getAllEntries);
router.get("/:id", getEntryById);

router.post("/", createEntry);
router.put("/:id", updateEntry);
router.delete("/:id", deleteEntry);

// =======================
// ✅ APPROVAL
// =======================
router.patch("/:id/approve", approveEntry);
router.patch("/:id/reject", rejectEntry);

// =======================
// EXPORT
// =======================
module.exports = router;
