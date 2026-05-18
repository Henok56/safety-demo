import React, { useEffect, useState } from "react";
import {
  getAllAssignments,
  createAssignment,
  updateAssignment,
  deleteAssignment,
  getAllEmployees,
} from "../../api/fleetassignmentApi";

import "/src/styles/FleetAssignment.css";

export default function FleetAssignment() {
  const [tab, setTab] = useState("list");

  const [assignments, setAssignments] = useState([]);
  const [employees, setEmployees] = useState([]);

  const [filters, setFilters] = useState({
    employeeId: "",
    startDate: "",
    endDate: "",
  });

  const [form, setForm] = useState({
    employeeId: "",
    fleetFamily: "B-737",
    startDate: "",
    endDate: "",
  });

  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // ================= VALIDATION & OVERLAP CHECK =================
  const checkOverlaps = (employeeId, startDate, endDate, excludeId = null) => {
    return assignments.filter((a) => {
      if (excludeId && a._id === excludeId) return false;
      if (a.employeeId?._id !== employeeId) return false;

      const aStart = new Date(a.startDate);
      const aEnd = new Date(a.endDate) || new Date("9999-12-31");
      const start = new Date(startDate);
      const end = endDate ? new Date(endDate) : new Date("9999-12-31");

      // Check if periods overlap
      return aStart <= end && aEnd >= start;
    });
  };

  const validateForm = () => {
    setError("");

    if (!form.employeeId) {
      setError("Please select an employee");
      return false;
    }
    if (!form.fleetFamily) {
      setError("Please select a fleet family");
      return false;
    }
    if (!form.startDate) {
      setError("Please enter start date");
      return false;
    }

    // If endDate is provided, validate it
    if (form.endDate) {
      const start = new Date(form.startDate);
      const end = new Date(form.endDate);

      if (start > end) {
        setError("Start date must be before end date");
        return false;
      }
    }

    return true;
  };

  // ================= LOAD =================
  const loadAssignments = async () => {
    try {
      setLoading(true);
      setError("");

      // Only include params with actual values
      const params = {};
      if (filters.startDate) params.startDate = filters.startDate;
      if (filters.endDate) params.endDate = filters.endDate;

      const res = await getAllAssignments(params);

      let data = res.data || [];

      if (filters.employeeId) {
        data = data.filter(
          (a) => a.employeeId?._id === filters.employeeId
        );
      }

      setAssignments(data);
    } catch (err) {
      setError(err.message || "Failed to load assignments");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadEmployees = async () => {
    try {
      const res = await getAllEmployees();
      setEmployees(res.data || []);
    } catch (err) {
      setError("Failed to load employees");
      console.error(err);
    }
  };

  useEffect(() => {
    loadAssignments();
    loadEmployees();
  }, []);

  // ================= FORM =================
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const resetForm = () => {
    setForm({
      employeeId: "",
      fleetFamily: "B-737",
      startDate: "",
      endDate: "",
    });
    setEditingId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);

      if (editingId) {
        await updateAssignment(editingId, form);
        setSuccess("Assignment updated successfully");
      } else {
        await createAssignment(form);
        setSuccess("Assignment created successfully");
      }

      resetForm();
      await loadAssignments();
      setTab("list");

      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err.message || "Operation failed");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (a) => {
    setForm({
      employeeId: a.employeeId?._id || "",
      fleetFamily: a.fleetFamily,
      startDate: new Date(a.startDate).toISOString().split("T")[0],
      endDate: a.endDate ? new Date(a.endDate).toISOString().split("T")[0] : "",
    });

    setEditingId(a._id);
    setTab("form");
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete assignment?")) return;

    try {
      setError("");
      await deleteAssignment(id);
      setSuccess("Assignment deleted successfully");
      await loadAssignments();
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err.message || "Delete failed");
      console.error(err);
    }
  };

  // ================= EXPORT CSV =================
  const exportCSV = () => {
    const rows = assignments.map((a) => ({
      Employee:
        a.employeeId?.userAccount?.firstname +
        " " +
        a.employeeId?.userAccount?.lastname,
      Fleet: a.fleetFamily,
      Start: a.startDate,
      End: a.endDate || "",
    }));

    const csv =
      "Employee,Fleet,Start,End\n" +
      rows
        .map((r) => Object.values(r).join(","))
        .join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "fleet_assignments.csv";
    a.click();
  };

  // ================= GET EMPLOYEE ASSIGNMENTS =================
  const getEmployeeAssignments = () => {
    if (!form.employeeId) return [];
    return assignments.filter((a) => a.employeeId?._id === form.employeeId);
  };

  const employeeAssignments = getEmployeeAssignments();

  return (
    <div className="fleet-container">
      <h2>Fleet Assignment Dashboard</h2>

      {/* ================= MESSAGES ================= */}
      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      {/* ================= NAV ================= */}
      <div className="tabs">
        <button onClick={() => setTab("list")}>Assignments</button>
        <button onClick={() => setTab("form")}>Create / Edit</button>
      </div>

      {/* ================= LIST ================= */}
      {tab === "list" && (
        <>
          <div className="filters">
            <select
              onChange={(e) =>
                setFilters({ ...filters, employeeId: e.target.value })
              }
            >
              <option value="">All Employees</option>
              {employees.map((e) => (
                <option key={e._id} value={e._id}>
                  {e.userAccount?.firstname}{" "}
                  {e.userAccount?.lastname}
                </option>
              ))}
            </select>

            <input
              type="date"
              onChange={(e) =>
                setFilters({ ...filters, startDate: e.target.value })
              }
            />

            <input
              type="date"
              onChange={(e) =>
                setFilters({ ...filters, endDate: e.target.value })
              }
            />

            <button onClick={loadAssignments}>Filter</button>
            <button onClick={exportCSV}>Export CSV</button>
          </div>

          <table className="fleet-table">
            <thead>
              <tr>
                <th>Employee</th>
                <th>Fleet</th>
                <th>Start</th>
                <th>End</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="5">Loading...</td>
                </tr>
              ) : (
                assignments.map((a) => (
                  <tr key={a._id}>
                    <td>
                      {a.employeeId?.userAccount?.firstname}{" "}
                      {a.employeeId?.userAccount?.lastname}
                    </td>
                    <td>{a.fleetFamily}</td>
                    <td>
                      {new Date(a.startDate).toLocaleDateString()}
                    </td>
                    <td>
                      {a.endDate
                        ? new Date(a.endDate).toLocaleDateString()
                        : "-"}
                    </td>
                    <td>
                      <button onClick={() => handleEdit(a)}>
                        Edit
                      </button>
                      <button
                        className="danger"
                        onClick={() => handleDelete(a._id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </>
      )}

      {/* ================= FORM ================= */}
      {tab === "form" && (
        <>
          <form className="fleet-form" onSubmit={handleSubmit}>
            <select
              name="employeeId"
              value={form.employeeId}
              onChange={handleChange}
              required
            >
              <option value="">Select Employee</option>
              {employees.map((e) => (
                <option key={e._id} value={e._id}>
                  {e.userAccount?.firstname}{" "}
                  {e.userAccount?.lastname}
                </option>
              ))}
            </select>

            <select
              name="fleetFamily"
              value={form.fleetFamily}
              onChange={handleChange}
            >
              <option>B-737</option>
              <option>B-777</option>
              <option>B-787</option>
              <option>B-767</option>
              <option>A-350</option>
              <option>Q-400</option>
            </select>

            <input
              type="date"
              name="startDate"
              value={form.startDate}
              onChange={handleChange}
              required
            />

            <input
              type="date"
              name="endDate"
              value={form.endDate}
              onChange={handleChange}
            />

            <div className="form-actions">
              <button type="submit" disabled={loading}>
                {loading ? "Processing..." : editingId ? "Update" : "Create"}
              </button>
              <button type="button" onClick={resetForm} disabled={loading}>
                Reset
              </button>
            </div>
          </form>

          {/* ================= EMPLOYEE ASSIGNMENTS INFO ================= */}
          {form.employeeId && (
            <div className="employee-info">
              <h3>
                {employees.find((e) => e._id === form.employeeId)?.userAccount
                  ?.firstname}{" "}
                {employees.find((e) => e._id === form.employeeId)?.userAccount
                  ?.lastname}
              </h3>
              <p className="info-text">
                Total Assignments: <strong>{employeeAssignments.length}</strong>
              </p>

              {employeeAssignments.length > 0 && (
                <div className="assignments-list">
                  <h4>Current Assignments:</h4>
                  <ul>
                    {employeeAssignments.map((a) => (
                      <li key={a._id}>
                        <strong>{a.fleetFamily}</strong>:{" "}
                        {new Date(a.startDate).toLocaleDateString()} →{" "}
                        {a.endDate
                          ? new Date(a.endDate).toLocaleDateString()
                          : "Ongoing"}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <p className="constraint-info">
                ℹ️ Maximum 2 simultaneous fleets allowed per period. End date is optional.
              </p>
            </div>
          )}
        </>
      )}


    </div>
  );
}