const pool = require("../config/postgres");
const FleetAssignment = require("../models/FleetAssignment");
const FdmHandling = require("../models/FdmHandling");
const normalizeFleet = require("../services/fleetNormalizer");

// ==============================
// SEVERITY MAP
// ==============================
const severityMap = {
  "1": "LOW",
  "2": "MEDIUM",
  "3": "HIGH",
};

const formatAssignedUsers = (users) => {
  const uniqueUsers = [...new Set(users.filter(Boolean))];
  return uniqueUsers.length ? uniqueUsers.join(" and ") : "Unassigned";
};

const getAssignedUsersForFleetDate = (assignments, fleet, date) => {
  return assignments
    .filter((assignment) => {
      return (
        assignment.fleetFamily === fleet &&
        date >= new Date(assignment.startDate) &&
        (!assignment.endDate || date <= new Date(assignment.endDate))
      );
    })
    .map((assignment) => {
      const user = assignment?.employeeId?.userAccount;
      return user ? `${user.firstname} ${user.lastname}` : null;
    })
    .filter(Boolean);
};

// ==============================
// AIRCRAFT CACHE (OPTIMIZATION)
// ==============================
let aircraftCache = [];

const getAircraftTypes = async () => {
  const result = await pool.query(`
    SELECT DISTINCT ac_type
    FROM aircraft_list
    WHERE ac_type IS NOT NULL
    ORDER BY ac_type
  `);

  return result.rows.map((row) => row.ac_type);
};

const loadAircraftCache = async () => {
  if (aircraftCache.length === 0) {
    aircraftCache = await getAircraftTypes();
  }
  return aircraftCache;
};

// ==============================
// DATE RANGE
// ==============================
const getDateRange = (from, to) => {
  const now = new Date();

  const start = from
    ? new Date(from)
    : new Date(now.getFullYear(), now.getMonth(), 1);

  const end = to ? new Date(to) : now;

  start.setHours(0, 0, 0, 0);
  end.setHours(23, 59, 59, 999);

  return { start, end };
};

// ==============================
// LOAD ASSIGNMENTS
// ==============================
const loadAssignments = async () => {
  return FleetAssignment.find().populate({
    path: "employeeId",
    populate: { path: "userAccount", select: "firstname lastname" },
  });
};

// ==============================
// SYNC FROM CASSIOPEE
// ==============================
const syncFromCassiopee = async (req, res) => {
  try {
    const { from, to } = req.query;
    const { start, end } = getDateRange(from, to);

    const result = await pool.query(
      `
      SELECT
        e.event_id,
        e.event_definition_name,
        e.event_severity_current,
        e.event_creation_datetime,
        e.event_status,
        f.flight_aircraft_tail,
        a.ac_type
      FROM va_events_v1 e
      LEFT JOIN va_flights_v1 f ON e.flight_id = f.flight_id
      LEFT JOIN aircraft_list a ON TRIM(f.flight_aircraft_tail) = TRIM(a.ac_tail)
      WHERE e.event_creation_datetime BETWEEN $1 AND $2
      `,
      [start, end]
    );

    const operations = result.rows.map((row) => {
      const severity = severityMap[String(row.event_severity_current)] || "LOW";
      const acType = row.ac_type || "UNMAPPED";

      return {
        updateOne: {
          filter: { recordId: String(row.event_id) },
          update: {
            $set: {
              recordId: String(row.event_id),
              fleetFamily: normalizeFleet(acType),
              event: {
                eventId: String(row.event_id),
                eventName: row.event_definition_name,
                acType,
              },
              aircraftTail: row.flight_aircraft_tail,
              eventStatus: row.event_status || "NotChecked",
              severity,
              qarDataIngestionDate: row.event_creation_datetime,
            },
          },
          upsert: true,
        },
      };
    });

    const syncResult = operations.length
      ? await FdmHandling.bulkWrite(operations, { ordered: false })
      : { upsertedCount: 0, modifiedCount: 0, matchedCount: 0 };

    aircraftCache = [];

    res.json({
      success: true,
      message: "FDM handling data synced",
      data: {
        sourceCount: result.rowCount,
        upserted: syncResult.upsertedCount || 0,
        modified: syncResult.modifiedCount || 0,
        matched: syncResult.matchedCount || 0,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ==============================
// DASHBOARD SUMMARY
// ==============================
const getDashboardSummary = async (req, res) => {
  try {
    const { from, to } = req.query;
    const { start, end } = getDateRange(from, to);

    const assignments = await loadAssignments();

    const result = await pool.query(
      `
      SELECT 
        e.event_severity_current,
        e.event_creation_datetime,
        a.ac_type
      FROM va_events_v1 e
      LEFT JOIN va_flights_v1 f ON e.flight_id = f.flight_id
      LEFT JOIN aircraft_list a ON TRIM(f.flight_aircraft_tail) = TRIM(a.ac_tail)
      WHERE e.event_status = 'NotChecked'
      AND e.event_severity_current IN ('2', '3')
      AND e.event_creation_datetime BETWEEN $1 AND $2
      `,
      [start, end]
    );

    const map = {};

    for (const row of result.rows) {
      const fleet = normalizeFleet(row.ac_type) || "UNMAPPED";
      const date = new Date(row.event_creation_datetime);
      const severity = severityMap[String(row.event_severity_current)];

      if (!map[fleet]) {
        map[fleet] = {
          fleetType: fleet,
          highNotChecked: 0,
          mediumNotChecked: 0,
          totalPending: 0,
          assignedUsers: [],
        };
      }

      if (severity === "HIGH") map[fleet].highNotChecked++;
      if (severity === "MEDIUM") map[fleet].mediumNotChecked++;

      map[fleet].totalPending++;

      const assignedUsers = getAssignedUsersForFleetDate(
        assignments,
        fleet,
        date
      );

      map[fleet].assignedUsers.push(...assignedUsers);
    }

    const data = Object.values(map).map((item) => ({
      ...item,
      assignedUser: formatAssignedUsers(item.assignedUsers),
      assignedUsers: [...new Set(item.assignedUsers)],
    }));

    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ==============================
// OVERDUE EVENTS
// ==============================
const getOverdueEvents = async (req, res) => {
  try {
    const { from, to } = req.query;
    const { start, end } = getDateRange(from, to);

    const assignments = await loadAssignments();

    const result = await pool.query(
      `
      SELECT 
        e.event_id,
        e.event_definition_name,
        e.event_severity_current,
        e.event_creation_datetime,
        f.flight_aircraft_tail,
        a.ac_type
      FROM va_events_v1 e
      LEFT JOIN va_flights_v1 f ON e.flight_id = f.flight_id
      LEFT JOIN aircraft_list a ON TRIM(f.flight_aircraft_tail) = TRIM(a.ac_tail)
      WHERE e.event_status = 'NotChecked'
      AND e.event_severity_current IN ('2', '3')
      AND e.event_creation_datetime BETWEEN $1 AND $2
      `,
      [start, end]
    );

    const now = new Date();

    const data = result.rows
      .filter((row) => {
        const ingestion = new Date(row.event_creation_datetime);

        const diffDays =
          (now - ingestion) / (1000 * 60 * 60 * 24);

        return diffDays >= 3; // 🔥 OVERDUE RULE
      })
      .map((row) => {
        const fleet = normalizeFleet(row.ac_type) || "UNMAPPED";
        const date = new Date(row.event_creation_datetime);

        const assignedUsers = getAssignedUsersForFleetDate(
          assignments,
          fleet,
          date
        );

        return {
          recordId: row.event_id,
          fleetFamily: fleet,
          event: { eventName: row.event_definition_name },
          severity: severityMap[String(row.event_severity_current)],
          qarDataIngestionDate: date,
          assignedUsers: [...new Set(assignedUsers)],
          assignedUser: formatAssignedUsers(assignedUsers),
        };
      });

    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ==============================
// ALL EVENTS
// ==============================
const getAllEvents = async (req, res) => {
  try {
    const { from, to } = req.query;
    const { start, end } = getDateRange(from, to);

    const result = await pool.query(
      `
      SELECT 
        e.event_id,
        e.event_definition_name,
        e.event_severity_current,
        e.event_creation_datetime,
        f.flight_aircraft_tail,
        a.ac_type,
        e.event_status
      FROM va_events_v1 e
      LEFT JOIN va_flights_v1 f ON e.flight_id = f.flight_id
      LEFT JOIN aircraft_list a ON TRIM(f.flight_aircraft_tail) = TRIM(a.ac_tail)
      WHERE e.event_creation_datetime BETWEEN $1 AND $2
      `,
      [start, end]
    );

    const data = result.rows.map((row) => ({
      recordId: row.event_id,
      fleetFamily: normalizeFleet(row.ac_type) || "UNMAPPED",
      event: { eventName: row.event_definition_name },
      severity: severityMap[String(row.event_severity_current)],
      status: row.event_status,
      qarDataIngestionDate: row.event_creation_datetime,
    }));

    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ==============================
// PERFORMANCE METRICS
// ==============================
const getPerformanceMetrics = async (req, res) => {
  try {
    const { from, to } = req.query;
    const { start, end } = getDateRange(from, to);

    const result = await pool.query(
      `
      SELECT 
        COUNT(*) FILTER (
          WHERE event_status = 'NotChecked'
          AND event_severity_current IN ('2', '3')
        ) AS pending,
        COUNT(*) FILTER (
          WHERE event_status = 'NotChecked'
          AND event_severity_current = '3'
        ) AS high,
        COUNT(*) FILTER (
          WHERE event_status = 'NotChecked'
          AND event_severity_current = '2'
        ) AS medium
      FROM va_events_v1
      WHERE event_creation_datetime BETWEEN $1 AND $2
      `,
      [start, end]
    );

    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ==============================
// SINGLE EVENT
// ==============================
const getEventById = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `SELECT * FROM va_events_v1 WHERE event_id = $1`,
      [id]
    );

    if (!result.rows.length) {
      return res.status(404).json({ success: false, message: "Event not found" });
    }

    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ==============================
// UPDATE EVENT STATUS
// ==============================
const updateEventStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    await pool.query(
      `UPDATE va_events_v1 SET event_status = $1 WHERE event_id = $2`,
      [status, id]
    );

    res.json({ success: true, message: "Status updated" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ==============================
// FLEET LIST (FROM CASSIOPEE)
// ==============================
const getFleetFamilies = async (req, res) => {
  try {
    const aircraftList = await loadAircraftCache();

    const fleets = aircraftList
      .map((ac) => normalizeFleet(ac))
      .filter(Boolean);

    res.json({
      success: true,
      data: [...new Set(fleets)],
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = {
  syncFromCassiopee,
  getDashboardSummary,
  getOverdueEvents,
  getAllEvents,
  getPerformanceMetrics,
  getEventById,
  updateEventStatus,
  getFleetFamilies,
};
