const mongoose = require("mongoose");
const UnproductiveTime = require("../models/UnproductiveTime");
const Employee = require("../models/Employee.model");

const ADMIN_ROLES = ["superadmin", "manager", "team_leader","user"];

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

const toObjectIdString = (value) => {
  if (!value) return "";
  if (typeof value === "string") return value;
  if (typeof value.toHexString === "function") return value.toHexString();
  if (value._id && value._id !== value) return toObjectIdString(value._id);
  if (typeof value.toString === "function") return value.toString();
  return "";
};

const hoursBetween = (startTime, endTime) => {
  const diffMs = new Date(endTime).getTime() - new Date(startTime).getTime();
  return Math.max(0, Math.round((diffMs / (1000 * 60 * 60)) * 100) / 100);
};

const getRecorderEmployee = async (user) => {
  const userId = toObjectIdString(user?._id || user?.id);
  if (!userId) return null;
  const linkedEmployee = await Employee.findOne({ userAccount: userId });
  if (linkedEmployee) return linkedEmployee;
  const employeeProfileId = toObjectIdString(user.employeeProfile);
  if (employeeProfileId && isValidObjectId(employeeProfileId)) {
    return Employee.findById(employeeProfileId);
  }
  return null;
};

const canManage = (user) => ADMIN_ROLES.includes(user?.role);

const handleError = (res, err, fallback = "Unproductive time request failed") => {
  console.error("UnproductiveTime error:", err);

  if (err?.code === 11000) {
    return res.status(409).json({
      success: false,
      message: "This employee already has an active unproductive-time timer",
    });
  }

  if (err?.name === "ValidationError") {
    return res.status(400).json({
      success: false,
      message: Object.values(err.errors || {})
        .map((error) => error.message)
        .join(", ") || err.message,
    });
  }

  if (err?.name === "CastError") {
    return res.status(400).json({
      success: false,
      message: `Invalid ${err.path || "id"}`,
    });
  }

  return res.status(500).json({
    success: false,
    message: err?.message || fallback,
  });
};

const handleStartTimerError = (res, err) => {
  console.error("Start timer error:", {
    name: err?.name,
    code: err?.code,
    message: err?.message,
    keyValue: err?.keyValue,
    errors: err?.errors,
  });

  if (err?.code === 11000) {
    return res.status(409).json({
      success: false,
      message: "This employee already has an active unproductive-time timer",
    });
  }

  if (err?.name === "ValidationError") {
    return res.status(400).json({
      success: false,
      message: Object.values(err.errors || {})
        .map((error) => error.message)
        .join(", ") || err.message,
    });
  }

  return res.status(400).json({
    success: false,
    message: err?.message || "Failed to start timer",
  });
};

const normalizeRecord = (record) => {
  if (!record) return record;

  const item = record.toObject ? record.toObject() : record;
  const employeeUser = item.employee?.userAccount;
  const recordedByUser = item.recordedBy?.userAccount;
  const approvedByUser = item.approvedBy?.userAccount;

  if (item.employee && employeeUser) {
    item.employee.firstname = employeeUser.firstname;
    item.employee.lastname = employeeUser.lastname;
    item.employee.name = [employeeUser.firstname, employeeUser.lastname]
      .filter(Boolean)
      .join(" ");
    item.employee.email = employeeUser.email;
  }

  if (item.recordedBy && recordedByUser) {
    item.recordedBy.firstname = recordedByUser.firstname;
    item.recordedBy.lastname = recordedByUser.lastname;
  }

  if (item.approvedBy && approvedByUser) {
    item.approvedBy.firstname = approvedByUser.firstname;
    item.approvedBy.lastname = approvedByUser.lastname;
  }

  return item;
};

const populateEntry = (query) =>
  query
    .populate({
      path: "employee",
      populate: { path: "userAccount", select: "firstname lastname email userid" },
    })
    .populate({
      path: "recordedBy",
      populate: { path: "userAccount", select: "firstname lastname email userid" },
    })
    .populate({
      path: "approvedBy",
      populate: { path: "userAccount", select: "firstname lastname email userid" },
    });

const getRecordForResponse = async (id) => {
  const record = await populateEntry(UnproductiveTime.findById(id));
  return normalizeRecord(record);
};

exports.startTimer = async (req, res) => {
  try {
    let { type, reason } = req.body;

    const employeeId = toObjectIdString(req.body.employee || req.body.employeeId);
    const userId = toObjectIdString(req.user?._id || req.user?.id);

    // ✅ Validate employee
    if (!employeeId) {
      return res.status(400).json({
        success: false,
        message: "Employee is required",
      });
    }

    if (!isValidObjectId(employeeId)) {
      return res.status(400).json({
        success: false,
        message: `Invalid employee id: ${employeeId}`,
      });
    }

    // ✅ Validate user
    if (!isValidObjectId(userId)) {
      return res.status(401).json({
        success: false,
        message: "Invalid session. Please login again.",
      });
    }

    // ✅ Normalize inputs
    type = (type || "").toLowerCase().trim();
    reason = (reason || "").trim();

    const allowedTypes = [
      "medical leave",
      "morning leave",
      "negligence",
      "maternity",
      "vacation",
      "other",
    ];

    if (!allowedTypes.includes(type)) {
      return res.status(400).json({
        success: false,
        message: `Invalid type: ${type || "missing"}`,
      });
    }

    // ✅ Check employee exists
    const employee = await Employee.findById(employeeId);
    if (!employee) {
      return res.status(404).json({
        success: false,
        message: "Employee not found",
      });
    }

    // ✅ FIXED: recordedBy MUST come only from user mapping
    const recordedBy = await getRecorderEmployee(req.user);

    if (!recordedBy) {
      return res.status(400).json({
        success: false,
        message: "User not linked to employee profile",
      });
    }

    // 🔥 CORE RULE: ONE ACTIVE TIMER PER EMPLOYEE
    const activeTimer = await UnproductiveTime.findOne({
      employee: employeeId,
      endTime: null,
      isDeleted: false,
    });

    if (activeTimer) {
      return res.status(409).json({
        success: false,
        message: "This employee already has an active timer",
      });
    }

    // ✅ Create timer
    const record = await UnproductiveTime.create({
      user: userId,
      employee: employeeId,
      type,
      reason,
      startTime: new Date(),
      endTime: null,
      rawHoursLost: 0,
      finalHoursLost: 0,
      status: "pending",
      recordedBy: recordedBy._id,
    });

    return res.status(201).json({
      success: true,
      data: await getRecordForResponse(record._id),
    });

  } catch (err) {
    return handleStartTimerError(res, err);
  }
};
exports.getActiveTimer = async (req, res) => {
  try {
    const query = {
      endTime: null,
      isDeleted: false,
    };

    const recordedBy = await getRecorderEmployee(req.user);
    if (recordedBy) query.recordedBy = recordedBy._id;

    const record = await populateEntry(
      UnproductiveTime.findOne(query).sort({ startTime: -1 })
    );

    res.status(200).json({
      success: true,
      data: normalizeRecord(record),
    });
  } catch (err) {
    return handleError(res, err, "Failed to load active timer");
  }
};

exports.stopTimer = async (req, res) => {
  try {
    const record = await UnproductiveTime.findOne({
      _id: req.params.id,
      endTime: null,
      isDeleted: false,
    });

    if (!record) {
      return res.status(404).json({
        success: false,
        message: "Active timer not found",
      });
    }

    const endTime = new Date();
    const rawHoursLost = hoursBetween(record.startTime, endTime);

    record.endTime = endTime;
    record.rawHoursLost = rawHoursLost;
    record.finalHoursLost = rawHoursLost;
    record.status = "stopped";
    await record.save();

    res.status(200).json({
      success: true,
      data: await getRecordForResponse(record._id),
    });
  } catch (err) {
    return handleError(res, err, "Failed to stop timer");
  }
};

exports.getAllEntries = async (req, res) => {
  try {
    const { status, type, employeeId } = req.query;
    const filter = { isDeleted: false };

    if (status) filter.status = status;
    if (type) filter.type = type;
    if (employeeId) {
      if (!isValidObjectId(employeeId)) {
        return res.status(400).json({ success: false, message: "Invalid employeeId" });
      }
      filter.employee = employeeId;
    }

    const records = await populateEntry(
      UnproductiveTime.find(filter).sort({ createdAt: -1 })
    );

    const data = records.map(normalizeRecord);

    res.status(200).json({
      success: true,
      count: data.length,
      data,
    });
  } catch (err) {
    return handleError(res, err, "Failed to load unproductive-time records");
  }
};

exports.getEntryById = async (req, res) => {
  try {
    const record = await populateEntry(
      UnproductiveTime.findOne({ _id: req.params.id, isDeleted: false })
    );

    if (!record) {
      return res.status(404).json({ success: false, message: "Record not found" });
    }

    res.status(200).json({
      success: true,
      data: normalizeRecord(record),
    });
  } catch (err) {
    return handleError(res, err, "Failed to load unproductive-time record");
  }
};

exports.createEntry = async (req, res) => {
  try {
    const {
      type,
      reason,
      startTime,
      endTime,
      finalHoursLost,
    } = req.body;

    const employeeId = toObjectIdString(req.body.employee || req.body.employeeId);
    const userId = toObjectIdString(req.user?._id || req.user?.id);

    // ✅ Validate IDs
    if (!isValidObjectId(employeeId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid employeeId",
      });
    }

    if (!isValidObjectId(userId)) {
      return res.status(401).json({
        success: false,
        message: "Invalid user session. Please login again.",
      });
    }

    // ✅ Ensure employee exists
    const employee = await Employee.findById(employeeId);
    if (!employee) {
      return res.status(404).json({
        success: false,
        message: "Employee not found",
      });
    }

    // ✅ IMPORTANT FIX:
    // recordedBy should ALWAYS come from logged-in user (not fallback employee)
    const recordedBy = await getRecorderEmployee(req.user);

    if (!recordedBy) {
      return res.status(400).json({
        success: false,
        message: "User is not linked to an employee profile",
      });
    }

    // ✅ Time calculation
    const start = startTime ? new Date(startTime) : new Date();
    const end = endTime ? new Date(endTime) : null;

    const rawHoursLost = end ? hoursBetween(start, end) : 0;

    // ✅ Create record
    const record = await UnproductiveTime.create({
      user: userId,
      employee: employeeId,
      type,
      reason,
      startTime: start,
      endTime: end,
      rawHoursLost,
      finalHoursLost:
        typeof finalHoursLost === "number"
          ? finalHoursLost
          : rawHoursLost,
      status: end ? "stopped" : "pending",
      recordedBy: recordedBy._id,
      isManuallyEdited: typeof finalHoursLost === "number",
    });

    return res.status(201).json({
      success: true,
      data: await getRecordForResponse(record._id),
    });

  } catch (err) {
    return handleError(res, err, "Failed to create unproductive-time record");
  }
};

exports.updateEntry = async (req, res) => {
  try {
    const record = await UnproductiveTime.findOne({
      _id: req.params.id,
      isDeleted: false,
    });

    if (!record) {
      return res.status(404).json({ success: false, message: "Record not found" });
    }

    const editable = ["type", "reason", "startTime", "endTime", "finalHoursLost"];
    const changes = {};

    editable.forEach((field) => {
      if (Object.prototype.hasOwnProperty.call(req.body, field)) {
        changes[field] = { from: record[field], to: req.body[field] };
        record[field] = req.body[field];
      }
    });

    if (req.body.startTime || req.body.endTime) {
      record.rawHoursLost = record.endTime
        ? hoursBetween(record.startTime, record.endTime)
        : 0;
      if (!Object.prototype.hasOwnProperty.call(req.body, "finalHoursLost")) {
        record.finalHoursLost = record.rawHoursLost;
      }
    }

    record.isManuallyEdited = true;
    record.editHistory.push({
      editedBy: req.user._id,
      editedAt: new Date(),
      changes,
      editReason: req.body.editReason || "Record updated",
    });

    await record.save();

    res.status(200).json({
      success: true,
      data: await getRecordForResponse(record._id),
    });
  } catch (err) {
    return handleError(res, err, "Failed to update unproductive-time record");
  }
};

exports.deleteEntry = async (req, res) => {
  try {
    const record = await UnproductiveTime.findOne({
      _id: req.params.id,
      isDeleted: false,
    });

    if (!record) {
      return res.status(404).json({ success: false, message: "Record not found" });
    }

    record.isDeleted = true;
    record.deletedAt = new Date();
    record.deletedBy = req.user._id;
    await record.save();

    res.status(200).json({
      success: true,
      message: "Deleted successfully",
    });
  } catch (err) {
    return handleError(res, err, "Failed to delete unproductive-time record");
  }
};

exports.approveEntry = async (req, res) => {
  try {
    if (!canManage(req.user)) {
      return res.status(403).json({ success: false, message: "Not authorized" });
    }

    const record = await UnproductiveTime.findOne({
      _id: req.params.id,
      isDeleted: false,
    });

    if (!record) {
      return res.status(404).json({ success: false, message: "Record not found" });
    }

    if (!record.endTime) {
      return res.status(400).json({
        success: false,
        message: "Stop the timer before approving the record",
      });
    }

    record.status = "approved";
    const approvedBy = await getRecorderEmployee(req.user);
    if (approvedBy) record.approvedBy = approvedBy._id;
    record.rejectionReason = undefined;
    await record.save();

    res.status(200).json({
      success: true,
      data: await getRecordForResponse(record._id),
    });
  } catch (err) {
    return handleError(res, err, "Failed to approve unproductive-time record");
  }
};

exports.rejectEntry = async (req, res) => {
  try {
    if (!canManage(req.user)) {
      return res.status(403).json({ success: false, message: "Not authorized" });
    }

    const record = await UnproductiveTime.findOne({
      _id: req.params.id,
      isDeleted: false,
    });

    if (!record) {
      return res.status(404).json({ success: false, message: "Record not found" });
    }

    record.status = "rejected";
    record.rejectionReason = req.body?.reason || req.body?.rejectionReason || "";
    await record.save();

    res.status(200).json({
      success: true,
      data: await getRecordForResponse(record._id),
    });
  } catch (err) {
    return handleError(res, err, "Failed to reject unproductive-time record");
  }
};

exports.getStatisticsSummary = async (req, res) => {
  try {
    const [summary] = await UnproductiveTime.aggregate([
      { $match: { isDeleted: false } },
      {
        $facet: {
          totals: [
            {
              $group: {
                _id: null,
                totalHours: { $sum: "$finalHoursLost" },
                approvedHours: {
                  $sum: {
                    $cond: [{ $eq: ["$status", "approved"] }, "$finalHoursLost", 0],
                  },
                },
                pendingHours: {
                  $sum: {
                    $cond: [{ $eq: ["$status", "pending"] }, "$finalHoursLost", 0],
                  },
                },
                count: { $sum: 1 },
              },
            },
          ],
          byType: [
            {
              $group: {
                _id: "$type",
                totalHours: { $sum: "$finalHoursLost" },
                count: { $sum: 1 },
              },
            },
            { $sort: { totalHours: -1 } },
          ],
          byStatus: [
            {
              $group: {
                _id: "$status",
                totalHours: { $sum: "$finalHoursLost" },
                count: { $sum: 1 },
              },
            },
            { $sort: { count: -1 } },
          ],
        },
      },
    ]);

    const totals = summary?.totals?.[0] || {
      totalHours: 0,
      approvedHours: 0,
      pendingHours: 0,
      count: 0,
    };
    const byType = summary?.byType || [];
    const byStatus = summary?.byStatus || [];

    res.status(200).json({
      success: true,
      data: {
        ...totals,
        overall: {
          totalIncidents: totals.count,
          totalHours: Math.round(totals.totalHours * 100) / 100,
          avgHours:
            totals.count > 0
              ? Math.round((totals.totalHours / totals.count) * 100) / 100
              : 0,
        },
        byType,
        byStatus,
      },
    });
  } catch (err) {
    return handleError(res, err, "Failed to load statistics");
  }
};
