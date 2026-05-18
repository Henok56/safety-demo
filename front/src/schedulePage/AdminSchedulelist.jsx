import React, { useState, useEffect, useMemo } from "react";
import api from "../api";
// ✅ Fix: Use named import for jwtDecode
import { jwtDecode } from "jwt-decode"; 
import { SCHEDULE_DESCRIPTION } from "../data/ScheduleDescription";
import "../styles/AdminSchedulelist.css";

// Helper functions for initial state
const getStartOfCurrentMonth = () => {
  const d = new Date();
  return new Date(d.getFullYear(), d.getMonth(), 1);
};

const getEndOfCurrentMonth = () => {
  const d = new Date();
  return new Date(d.getFullYear(), d.getMonth() + 1, 0);
};

export default function AdminSchedulelist() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState({});
  const [error, setError] = useState("");

  const [fromDate, setFromDate] = useState(getStartOfCurrentMonth());
  const [toDate, setToDate] = useState(getEndOfCurrentMonth());

  // Get user role from JWT
  const userRole = useMemo(() => {
    const token = localStorage.getItem("accessToken");
    if (!token) return null;
    try {
      // ✅ Fix: Ensure use of the named function here
      const decoded = jwtDecode(token);
      return decoded?.role?.toLowerCase() ?? null;
    } catch (err) {
      console.error("Invalid token", err);
      return null;
    }
  }, []);

  const canDelete = ["superadmin", "manager", "team_leader"].includes(userRole);

  const formatDate = (d) => (d ? new Date(d).toLocaleString() : "-");

  const renderAssignedTo = (assignedTo) => {
    if (!assignedTo) return "-";
    if (typeof assignedTo === "object") {
      const name = `${assignedTo.firstname ?? ""} ${assignedTo.lastname ?? ""}`.trim();
      return name ? `${name} ` : "-";
    }
    return assignedTo;
  };

  const fetchSchedules = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await api.get("/schedules", { 
        params: { from: fromDate.toISOString(), to: toDate.toISOString() }
      });
      const data = res.data?.data || res.data || [];
      setTasks(data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch schedules");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSchedules();
  }, [fromDate, toDate]);

  const updateSchedule = async (id, field, value) => {
    setActionLoading((prev) => ({ ...prev, [id]: true }));
    const oldTasks = [...tasks];

    setTasks((prev) =>
      prev.map((t) => (t._id === id ? { ...t, [field]: value } : t))
    );

    try {
      await api.put(`/schedules/${id}`, { [field]: value });
    } catch (err) {
      setTasks(oldTasks);
      alert(err.response?.data?.message || "Failed to update schedule");
    } finally {
      setActionLoading((prev) => ({ ...prev, [id]: false }));
    }
  };

  const deleteSchedule = async (id) => {
    if (!window.confirm("Are you sure you want to permanently delete this schedule?")) return;

    setActionLoading((prev) => ({ ...prev, [id]: true }));
    const oldTasks = [...tasks];
    setTasks((prev) => prev.filter((t) => t._id !== id));

    try {
      await api.delete(`/schedules/${id}`);
    } catch (err) {
      setTasks(oldTasks);
      alert(err.response?.data?.message || "Failed to delete schedule");
    } finally {
      setActionLoading((prev) => ({ ...prev, [id]: false }));
    }
  };

  return (
    <div className="schedule-list-page">
      <h1>Assigned Schedule Tasks</h1>

      <div className="range-filter">
        <label>
          From:{" "}
          <input
            type="date"
            value={fromDate.toISOString().slice(0, 10)}
            onChange={(e) => setFromDate(new Date(e.target.value))}
          />
        </label>

        <label>
          To:{" "}
          <input
            type="date"
            value={toDate.toISOString().slice(0, 10)}
            onChange={(e) => setToDate(new Date(e.target.value))}
          />
        </label>

        <button onClick={fetchSchedules}>Apply Filter</button>
      </div>

      {loading && <p>Loading schedules...</p>}
      {error && <p className="error">{error}</p>}

      {tasks.length === 0 && !loading ? (
        <p>No schedules available.</p>
      ) : (
        <table className="schedule-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Activity</th>
              <th>Start</th>
              <th>Due</th>
              <th>Assigned To</th>
              <th>Status</th>
              <th>Notes</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {tasks.map((t, i) => (
              <tr key={t._id}>
                <td>{i + 1}</td>
                <td>
                  <select
                    value={t.activity ?? ""}
                    onChange={(e) => updateSchedule(t._id, "activity", e.target.value)}
                    disabled={actionLoading[t._id]}
                  >
                    <option value="">Select Activity</option>
                    {SCHEDULE_DESCRIPTION.map((s, idx) => (
                      <option key={idx} value={s.activity}>
                        {s.activity}
                      </option>
                    ))}
                  </select>
                </td>

                <td>{formatDate(t.startdate)}</td>
                <td>{formatDate(t.duedate)}</td>
                <td>{renderAssignedTo(t.assignedTo)}</td>

                <td>
                  <select
                    value={t.status ?? "Pending"}
                    onChange={(e) => updateSchedule(t._id, "status", e.target.value)}
                    disabled={actionLoading[t._id]}
                  >
                    <option value="Pending">Pending</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Completed">Completed</option>
                  </select>
                </td>

                <td>
                  <input
                    type="text"
                    value={t.notes ?? ""}
                    onChange={(e) =>
                      setTasks((prev) =>
                        prev.map((task) =>
                          task._id === t._id ? { ...task, notes: e.target.value } : task
                        )
                      )
                    }
                    onBlur={(e) => updateSchedule(t._id, "notes", e.target.value)}
                    disabled={actionLoading[t._id]}
                  />
                </td>

                <td>
                  {canDelete ? (
                    <button
                      className="delete-btn"
                      onClick={() => deleteSchedule(t._id)}
                      disabled={actionLoading[t._id]}
                    >
                      {actionLoading[t._id] ? "..." : "Delete"}
                    </button>
                  ) : (
                    <span className="no-access">Locked</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}