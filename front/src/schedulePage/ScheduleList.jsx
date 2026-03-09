import React, { useEffect, useMemo, useState } from "react";
import api from "../api";
import * as XLSX from "xlsx";
import "../styles/ScheduleList.css";

/* ============================
   DATE HELPERS
============================ */
const getStartOfCurrentMonth = () => {
  const d = new Date();
  return new Date(d.getFullYear(), d.getMonth(), 1);
};

const getEndOfCurrentMonth = () => {
  const d = new Date();
  return new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59);
};

const toInputDate = (date) =>
  date.toISOString().split("T")[0];

/* ============================
   COMPONENT
============================ */
const ScheduleList = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  // Date range state
  const [fromDate, setFromDate] = useState(getStartOfCurrentMonth());
  const [toDate, setToDate] = useState(getEndOfCurrentMonth());

  /* ============================
     FETCH SCHEDULES
  ============================ */
  const getPublicSchedules = async () => {
    try {
      const res = await api.get("/schedules/public");
      const data = Array.isArray(res.data?.data)
        ? res.data.data
        : Array.isArray(res.data)
        ? res.data
        : [];
      setTasks(data);
    } catch (err) {
      console.error("❌ Failed to fetch public schedules:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getPublicSchedules();
  }, []);

  /* ============================
     FILTER BY DATE RANGE
  ============================ */
  const filteredTasks = useMemo(() => {
    return tasks.filter((t) => {
      if (!t.startdate || !t.duedate) return false;

      const start = new Date(t.startdate);
      const end = new Date(t.duedate);

      return (
        start <= toDate &&
        end >= fromDate
      );
    });
  }, [tasks, fromDate, toDate]);

  /* ============================
     EXPORT FILTERED DATA
  ============================ */
  const handleExport = () => {
    if (filteredTasks.length === 0) {
      alert("No data to export!");
      return;
    }

    const exportData = filteredTasks.map((t, i) => ({
      "#": i + 1,
      Activity: t.activity || "-",
      "Start Date": t.startdate
        ? new Date(t.startdate).toLocaleDateString()
        : "-",
      "Due Date": t.duedate
        ? new Date(t.duedate).toLocaleDateString()
        : "-",
      "Assigned To": t.assignedTo || "-",
      Status: t.status || "-",
      Notes: t.notes || "-"
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Schedules");

    XLSX.writeFile(
      wb,
      `schedules_${toInputDate(fromDate)}_to_${toInputDate(toDate)}.xlsx`
    );
  };

  /* ============================
     HELPERS
  ============================ */
  const formatDate = (d) =>
    d ? new Date(d).toLocaleDateString() : "-";

  const getStatusClass = (status) => {
    if (!status) return "";
    const s = status.toLowerCase();
    if (s.includes("pending")) return "status-pending";
    if (s.includes("completed")) return "status-completed";
    if (s.includes("overdue")) return "status-overdue";
    return "";
  };

  /* ============================
     RENDER
  ============================ */
  return (
    <div className="user-schedule-list-page">
      <div className="schedule-container premium-list">

        {/* Header */}
        <div className="list-header">
          <h1>📅 Assigned Schedule Tasks</h1>
          <button
            onClick={handleExport}
            className="export-btn secondary-btn"
            disabled={filteredTasks.length === 0}
          >
            📤 Export
          </button>
        </div>

        {/* Date Range Filter */}
        <div className="date-filter-row">
          <div className="date-filter">
            <label>From</label>
            <input
              type="date"
              value={toInputDate(fromDate)}
              onChange={(e) =>
                setFromDate(new Date(e.target.value))
              }
            />
          </div>

          <div className="date-filter">
            <label>To</label>
            <input
              type="date"
              value={toInputDate(toDate)}
              onChange={(e) =>
                setToDate(new Date(e.target.value + "T23:59:59"))
              }
            />
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Loading schedules...</p>
          </div>
        ) : filteredTasks.length === 0 ? (
          <div className="empty-state">
            <p>No schedules found for the selected period.</p>
          </div>
        ) : (
          <div className="table-wrapper">
            <table className="user-schedule-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Activity</th>
                  <th>Start</th>
                  <th>Due</th>
                  <th>Assigned To</th>
                  <th>Status</th>
                  <th>Notes</th>
                </tr>
              </thead>
              <tbody>
                {filteredTasks.map((t, i) => (
                  <tr key={t._id}>
                    <td>{i + 1}</td>
                    <td className="activity-cell">{t.activity}</td>
                    <td>{formatDate(t.startdate)}</td>
                    <td>{formatDate(t.duedate)}</td>
                    <td className="assigned-cell">{t.assignedTo}</td>
                    <td>
                      <span
                        className={`status-badge ${getStatusClass(t.status)}`}
                      >
                        {t.status}
                      </span>
                    </td>
                    <td className="notes-cell">{t.notes || "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default ScheduleList;
