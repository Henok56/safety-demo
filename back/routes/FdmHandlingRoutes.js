const express = require("express");
const router = express.Router();

const FdmHandlingController = require("../controllers/FdmHandlingController");

// ==============================
// BASE: /api/fdm-handling
// ==============================

console.log("FDM HANDLING ROUTES LOADED");

// ==============================
// SYNC FROM CASSIOPEE
// ==============================
router.post("/sync", FdmHandlingController.syncFromCassiopee);

// ==============================
// DASHBOARD & ANALYTICS
// ==============================
router.get("/dashboard", FdmHandlingController.getDashboardSummary);

router.get("/overdue", FdmHandlingController.getOverdueEvents);

router.get("/all", FdmHandlingController.getAllEvents);

router.get("/performance", FdmHandlingController.getPerformanceMetrics);

// ==============================
// SINGLE EVENT
// ==============================
router.get("/event/:id", FdmHandlingController.getEventById);

// ==============================
// UPDATE EVENT STATUS
// ==============================
router.patch("/event/:id/status", FdmHandlingController.updateEventStatus);

// ==============================
// FLEET LIST (FROM CASSIOPEE)
// ==============================
router.get("/fleets", FdmHandlingController.getFleetFamilies);

module.exports = router;