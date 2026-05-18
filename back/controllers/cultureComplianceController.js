const CultureCompliance = require("../models/CultureCompliance");
const Employee = require("../models/Employee.model");
const User = require("../models/User");
const mongoose = require("mongoose");

const ASPECT_KEYS = [
  "teamwork",
  "respect",
  "discipline",
  "grooming",
  "appearance",
  "bureaucracy",
  "indifference",
];

const hydrateCultureRecords = async (records) => {
  const list = Array.isArray(records) ? records : [records].filter(Boolean);
  const plainRecords = list.map((r) => (r.toObject ? r.toObject() : r));

  const employeeIds = plainRecords.map((r) => r.employee).filter(Boolean);
  const userIds = plainRecords
    .flatMap((r) => [
      r.user,
      ...(r.penalties || []).map((p) => p.issuedBy),
      ...(r.aspectHistory || []).map((h) => h.recordedBy),
    ])
    .filter(Boolean);

  const employees = await Employee.find({ _id: { $in: employeeIds } })
    .select("regNo department currentPosition status userAccount")
    .populate("userAccount", "userid firstname lastname email role")
    .lean();

  employees.forEach((e) => {
    if (e.userAccount?._id) userIds.push(e.userAccount._id);
  });

  const users = await User.find({ _id: { $in: userIds } })
    .select("userid firstname lastname email role")
    .lean();

  const employeeMap = new Map(employees.map((e) => [e._id.toString(), e]));
  const userMap = new Map(users.map((u) => [u._id.toString(), u]));

  return plainRecords.map((record) => ({
    ...record,
    employee: employeeMap.get(record.employee?.toString()) || record.employee,
    user: userMap.get(record.user?.toString()) || employeeMap.get(record.employee?.toString())?.userAccount || null,
    penalties: (record.penalties || []).map((p) => ({
      ...p,
      issuedBy: userMap.get(p.issuedBy?.toString()) || null,
    })),
    aspectHistory: (record.aspectHistory || []).map((h) => ({
      ...h,
      recordedBy: userMap.get(h.recordedBy?.toString()) || null,
    })),
  }));
};

const buildAspectEntries = (aspects = {}, userId) =>
  ASPECT_KEYS.map((aspect) => {
    const val = aspects[aspect] || {};
    const score = Number(val.score);
    return {
      aspect,
      score: Number.isFinite(score) ? score : 0,
      reason: val.comment || "",
      recordedBy: userId,
      recordedAt: new Date(),
    };
  });

const getEmployee = async (employeeId) => {
  const emp = await Employee.findById(employeeId).select("userAccount");
  if (!emp) return null;
  return { employee: emp, userId: emp.userAccount || null };
};

// ==================== CREATE RECORD WITH FIRST ENTRY ====================
exports.createRecordWithEntry = async (req, res) => {
  try {
    const { employeeId, aspect, score, reason } = req.body;
    
    if (!employeeId) {
      return res.status(400).json({ success: false, message: "Employee ID is required" });
    }
    
    if (!aspect || !ASPECT_KEYS.includes(aspect)) {
      return res.status(400).json({ success: false, message: "Valid aspect is required" });
    }
    
    if (score === undefined || score === null) {
      return res.status(400).json({ success: false, message: "Score is required" });
    }
    
    const empData = await getEmployee(employeeId);
    if (!empData) {
      return res.status(404).json({ success: false, message: "Employee not found" });
    }
    
    let record = await CultureCompliance.findOne({ employee: employeeId });
    
    if (record) {
      record.aspectHistory.push({
        aspect,
        score: Number(score),
        reason: reason || "",
        recordedBy: req.user?.id,
        recordedAt: new Date(),
      });
    } else {
      record = new CultureCompliance({
        employee: employeeId,
        user: empData.userId,
        aspectHistory: [{
          aspect,
          score: Number(score),
          reason: reason || "",
          recordedBy: req.user?.id,
          recordedAt: new Date(),
        }],
      });
    }
    
    await record.save();
    
    const populated = await hydrateCultureRecords(record);
    res.status(201).json({ success: true, data: populated, message: "Entry recorded successfully" });
    
  } catch (err) {
    console.error("Error in createRecordWithEntry:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// ==================== BULK CREATE ENTRIES ====================
exports.bulkCreateEntries = async (req, res) => {
  try {
    const { employeeId, entries } = req.body;
    
    if (!employeeId) {
      return res.status(400).json({ success: false, message: "Employee ID is required" });
    }
    
    if (!entries || !Array.isArray(entries) || entries.length === 0) {
      return res.status(400).json({ success: false, message: "At least one entry is required" });
    }
    
    for (const entry of entries) {
      if (!ASPECT_KEYS.includes(entry.aspect)) {
        return res.status(400).json({ success: false, message: `Invalid aspect: ${entry.aspect}` });
      }
      if (entry.score === undefined || entry.score === null) {
        return res.status(400).json({ success: false, message: `Score required for aspect: ${entry.aspect}` });
      }
    }
    
    const empData = await getEmployee(employeeId);
    if (!empData) {
      return res.status(404).json({ success: false, message: "Employee not found" });
    }
    
    let record = await CultureCompliance.findOne({ employee: employeeId });
    
    const newEntries = entries.map(entry => ({
      aspect: entry.aspect,
      score: Number(entry.score),
      reason: entry.reason || "",
      recordedBy: req.user?.id,
      recordedAt: new Date(),
    }));
    
    if (record) {
      record.aspectHistory.push(...newEntries);
    } else {
      record = new CultureCompliance({
        employee: employeeId,
        user: empData.userId,
        aspectHistory: newEntries,
      });
    }
    
    await record.save();
    
    const populated = await hydrateCultureRecords(record);
    res.status(201).json({ success: true, data: populated, message: `${entries.length} entries recorded successfully` });
    
  } catch (err) {
    console.error("Error in bulkCreateEntries:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// ==================== CREATE CULTURE RECORD (Legacy) ====================
exports.createCultureRecord = async (req, res) => {
  try {
    const { employeeId, aspects = {} } = req.body;

    if (!employeeId) {
      return res.status(400).json({ message: "Employee ID is required" });
    }

    const empData = await getEmployee(employeeId);
    if (!empData) {
      return res.status(404).json({ message: "Employee not found" });
    }

    const exists = await CultureCompliance.findOne({ employee: employeeId });
    if (exists) {
      const populated = await hydrateCultureRecords(exists);
      return res.json({ success: true, data: populated, message: "Record already exists" });
    }

    const record = new CultureCompliance({
      employee: employeeId,
      user: empData.userId,
      aspectHistory: buildAspectEntries(aspects, req.user?.id || req.body.userId),
    });

    await record.save();

    const populated = await hydrateCultureRecords(record);
    res.status(201).json({ success: true, data: populated, message: "Record created successfully" });

  } catch (err) {
    console.error("Create culture record error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// ==================== GET ALL RECORDS ====================
exports.getAllCultureRecords = async (req, res) => {
  try {
    const records = await CultureCompliance.find()
      .sort({ overallScore: -1 })
      .lean();

    const data = await hydrateCultureRecords(records);
    res.json({ success: true, data });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ==================== GET SINGLE RECORD ====================
exports.getCultureRecord = async (req, res) => {
  try {
    const record = await CultureCompliance.findById(req.params.id).lean();
    if (!record) return res.status(404).json({ message: "Not found" });

    const populated = await hydrateCultureRecords(record);
    res.json({ success: true, data: populated });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ==================== GET RECORD BY EMPLOYEE ====================
exports.getEmployeeCulture = async (req, res) => {
  try {
    const record = await CultureCompliance.findOne({
      employee: req.params.employeeId,
    }).lean();

    if (!record) {
      return res.status(404).json({ success: false, message: "No culture record found for this employee" });
    }

    const populated = await hydrateCultureRecords(record);
    res.json({ success: true, data: populated });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ==================== UPDATE CULTURE RECORD (Append) ====================
exports.updateCultureRecord = async (req, res) => {
  try {
    const record = await CultureCompliance.findById(req.params.id);
    if (!record) return res.status(404).json({ message: "Not found" });

    if (req.body.aspects) {
      const entries = buildAspectEntries(req.body.aspects, req.user?.id);
      const filtered = entries.filter(e => e.score !== 0 || e.reason);
      record.aspectHistory.push(...filtered);
    }

    await record.save();

    const populated = await hydrateCultureRecords(record);
    res.json({ success: true, data: populated });

  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// ==================== UPDATE CULTURE BY EMPLOYEE ====================
exports.updateCultureByEmployee = async (req, res) => {
  try {
    const record = await CultureCompliance.findOne({
      employee: req.params.employeeId,
    });

    if (!record) return res.status(404).json({ message: "Not found" });

    if (req.body.aspects) {
      record.aspectHistory.push(...buildAspectEntries(req.body.aspects, req.user?.id));
    }

    await record.save();

    const populated = await hydrateCultureRecords(record);
    res.json({ success: true, data: populated });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// ==================== ADD ASPECT ENTRY ====================
exports.addAspectEntry = async (req, res) => {
  try {
    const { aspect, score, reason } = req.body;

    if (!ASPECT_KEYS.includes(aspect)) {
      return res.status(400).json({ message: "Invalid aspect" });
    }

    const record = await CultureCompliance.findById(req.params.id);
    if (!record) return res.status(404).json({ message: "Not found" });

    record.aspectHistory.push({
      aspect,
      score: Number(score || 0),
      reason: reason || "",
      recordedBy: req.user?.id,
      recordedAt: new Date(),
    });

    await record.save();

    const populated = await hydrateCultureRecords(record);
    res.json({ success: true, data: populated });

  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// ==================== UPDATE HISTORY ENTRY ====================
exports.updateAspectHistoryEntry = async (req, res) => {
  try {
    const { id, historyId } = req.params;
    const { score, reason, aspect } = req.body;

    const record = await CultureCompliance.findById(id);
    if (!record) return res.status(404).json({ message: "Record not found" });

    const entry = record.aspectHistory.id(historyId);
    if (!entry) return res.status(404).json({ message: "History entry not found" });

    if (aspect && ASPECT_KEYS.includes(aspect)) entry.aspect = aspect;
    if (score !== undefined) entry.score = Number(score);
    if (reason !== undefined) entry.reason = reason;
    entry.recordedAt = new Date();
    if (req.user?.id) entry.recordedBy = req.user.id;

    await record.save();

    const populated = await hydrateCultureRecords(record);
    res.json({ success: true, data: populated });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// ==================== DELETE HISTORY ENTRY ====================
exports.deleteAspectHistoryEntry = async (req, res) => {
  try {
    const record = await CultureCompliance.findById(req.params.id);
    if (!record) return res.status(404).json({ message: "Not found" });

    record.aspectHistory = record.aspectHistory.filter(
      (h) => h._id.toString() !== req.params.historyId
    );

    await record.save();

    const populated = await hydrateCultureRecords(record);
    res.json({ success: true, data: populated });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ==================== ADD ADJUSTMENT ====================
exports.addAdjustment = async (req, res) => {
  try {
    const record = await CultureCompliance.findById(req.params.id);
    if (!record) return res.status(404).json({ message: "Not found" });

    record.penalties.push({
      ...req.body,
      impactValue: Number(req.body.impactValue || 0),
      severity: Number(req.body.severity || 1),
      issuedBy: req.user?.id,
    });

    await record.save();

    const populated = await hydrateCultureRecords(record);
    res.json({ success: true, data: populated });

  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// ==================== DELETE RECORD ====================
exports.deleteCultureRecord = async (req, res) => {
  try {
    const record = await CultureCompliance.findByIdAndDelete(req.params.id);
    if (!record) return res.status(404).json({ message: "Not found" });
    res.json({ success: true, message: "Deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};