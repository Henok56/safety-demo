import React, { useState, useEffect, useMemo } from "react";
import api from "../api";
import * as XLSX from "xlsx";
import "../styles/ScheduleList.css";

const ScheduleList = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  // Default to current month in local time
  const getDefaultFrom = () => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0);
  };
  const getDefaultTo = () => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
  };

  const [fromDate, setFromDate] = useState(getDefaultFrom);
  const [toDate, setToDate] = useState(getDefaultTo);

  // Format date as YYYY-MM-DD without timezone shift
  const toDateString = (date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  };

  // Fetch schedules from API with date range
  const fetchSchedules = async (from, to) => {
    setLoading(true);
    try {
      const res = await api.get(
        `/schedules/public?from=${toDateString(from)}&to=${toDateString(to)}`
      );
      const data = Array.isArray(res.data?.data) ? res.data.data : [];
      setTasks(data);
    } catch (err) {
      console.error("❌ Failed to fetch public schedules:", err);
      setTasks([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch on mount and whenever date range changes
  useEffect(() => {
    fetchSchedules(fromDate, toDate);
  }, [fromDate, toDate]);

  // Handle from date change
  const handleFromChange = (e) => {
    const val = e.target.value;
    if (!val) return;
    const [y, m, d] = val.split("-").map(Number);
    setFromDate(new Date(y, m - 1, d, 0, 0, 0));
  };

  // Handle to date change
  const handleToChange = (e) => {
    const val = e.target.value;
    if (!val) return;
    const [y, m, d] = val.split("-").map(Number);
    setToDate(new Date(y, m - 1, d, 23, 59, 59));
  };

  // Client-side filter as safety net
  const filteredTasks = useMemo(() => {
    return tasks.filter((t) => {
      if (!t.startdate || !t.duedate) return false;
      const start = new Date(t.startdate);
      const end = new Date(t.duedate);
      return start <= toDate && end >= fromDate;
    });
  }, [tasks, fromDate, toDate]);

  // Export to Excel
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
      "Assigned To": t.assignedTo
        ? `${t.assignedTo.firstname} ${t.assignedTo.lastname}`
        : "-",
      Status: t.status || "-",
      Notes: t.notes || "-",
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Schedules");
    XLSX.writeFile(
      wb,
      `schedules_${toDateString(fromDate)}_to_${toDateString(toDate)}.xlsx`
    );
  };

  return (
    <div className="user-schedule-list-page">
      <h1>Monthly Task List</h1>

      {/* Date Filter */}
      <div className="date-filter-row">
        <div>
          <label>From</label>
          <input
            type="date"
            value={toDateString(fromDate)}
            onChange={handleFromChange}
          />
        </div>

        <div>
          <label>To</label>
          <input
            type="date"
            value={toDateString(toDate)}
            onChange={handleToChange}
          />
        </div>

        <button onClick={handleExport} disabled={filteredTasks.length === 0}>
          📤 Export
        </button>
      </div>

      {/* Content */}
      {loading ? (
        <p>Loading schedules...</p>
      ) : filteredTasks.length === 0 ? (
        <p>No schedules found for the selected period.</p>
      ) : (
        <table>
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
                <td>{t.activity}</td>
                <td>{new Date(t.startdate).toLocaleDateString()}</td>
                <td>{new Date(t.duedate).toLocaleDateString()}</td>
                <td>
                  {t.assignedTo
                    ? `${t.assignedTo.firstname} ${t.assignedTo.lastname}`
                    : "-"}
                </td>
                <td>{t.status || "-"}</td>
                <td>{t.notes || "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default ScheduleList;