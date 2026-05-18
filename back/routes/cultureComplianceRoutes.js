const express = require('express');
const router = express.Router();
const cultureController = require('../controllers/cultureComplianceController');

// ==================== NEW RECOMMENDED ENDPOINTS ====================
router.post('/create-with-entry', cultureController.createRecordWithEntry);
router.post('/bulk-create', cultureController.bulkCreateEntries);

// ==================== GET ROUTES ====================
router.get('/', cultureController.getAllCultureRecords);
router.get('/:id', cultureController.getCultureRecord);
router.get('/employee/:employeeId', cultureController.getEmployeeCulture);

// ==================== POST ROUTES ====================
router.post('/', cultureController.createCultureRecord);
router.post('/:id/aspect', cultureController.addAspectEntry);
router.post('/:id/adjustment', cultureController.addAdjustment);

// ==================== PUT ROUTES ====================
router.put('/:id', cultureController.updateCultureRecord);
router.put('/employee/:employeeId', cultureController.updateCultureByEmployee);
router.put('/:id/history/:historyId', cultureController.updateAspectHistoryEntry);

// ==================== DELETE ROUTES ====================
router.delete('/:id', cultureController.deleteCultureRecord);
router.delete('/:id/history/:historyId', cultureController.deleteAspectHistoryEntry);

module.exports = router;