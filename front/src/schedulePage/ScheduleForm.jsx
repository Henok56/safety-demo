// ScheduleForm.jsx
import React, { useState, useEffect } from "react";
import * as XLSX from "xlsx";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { SCHEDULE_DESCRIPTION } from "../data/ScheduleDescription";
import { EMPLOYEE_LIST } from "../data/employeeList";
import { getSchedules, addSchedule } from "../api/scheduleAPI";

import "../styles/ScheduleForm.css";

/* ============================
   CONSTANTS
============================ */
const today = new Date();
const currentYear = today.getFullYear();
const currentMonth = today.getMonth(); // 0-based

/* ============================
   DATE HELPERS
============================ */
const isPastMonth = (year, monthIndex) =>
  year < currentYear ||
  (year === currentYear && monthIndex < currentMonth);

const getStartOfMonth = (year, monthIndex) =>
  new Date(year, monthIndex, 1, 0, 0, 0);

const getEndOfMonth = (year, monthIndex) =>
  new Date(year, monthIndex + 1, 0, 23, 59, 59);

/* ============================
   COMPONENT
============================ */
const ScheduleForm = () => {
  const [formData, setFormData] = useState({
    activity: "",
    description: "",
    assignedTo: "",
    startPeriod: "", // YYYY-MM
    status: "Pending",
    comments: ""
  });

  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);

  /* ============================
     FETCH TASKS
  ============================ */
  const fetchTasks = async () => {
    try {
      const res = await getSchedules();
      setTasks(res.data || []);
    } catch {
      toast.error("Failed to load schedules.");
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  /* ============================
     HANDLE CHANGE
  ============================ */
  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({ ...prev, [name]: value }));

    if (name === "activity") {
      const activityObj = SCHEDULE_DESCRIPTION.find(
        (a) => a.activity === value
      );
      setFormData((prev) => ({
        ...prev,
        description: activityObj ? activityObj.description : ""
      }));
    }
  };

  /* ============================
     SUBMIT
  ============================ */
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.startPeriod) {
      toast.warning("Please select a month.");
      return;
    }

    const [year, month] = formData.startPeriod.split("-").map(Number);
    const monthIndex = month - 1;

    if (isPastMonth(year, monthIndex)) {
      toast.error("You cannot assign tasks to past months.");
      return;
    }

    setLoading(true);

    try {
      const startdate = getStartOfMonth(year, monthIndex);
      const duedate = getEndOfMonth(year, monthIndex);

      await addSchedule({
        activity: formData.activity,
        assignedTo: formData.assignedTo,
        startdate,
        duedate,
        status: formData.status,
        notes: formData.comments
      });

      toast.success("Activity assigned successfully!");

      await fetchTasks();

      setFormData({
        activity: "",
        description: "",
        assignedTo: "",
        startPeriod: "",
        status: "Pending",
        comments: ""
      });
    } catch {
      toast.error("Failed to save activity.");
    } finally {
      setLoading(false);
    }
  };

  /* ============================
     EXPORT TO EXCEL
  ============================ */
  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(
      tasks.map((t, i) => ({
        "#": i + 1,
        Activity: t.activity,
        "Assigned To": t.assignedTo,
        "Start Date": new Date(t.startdate).toLocaleDateString(),
        "Due Date": new Date(t.duedate).toLocaleDateString(),
        Status: t.status,
        Notes: t.notes || "-"
      }))
    );

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Schedules");
    XLSX.writeFile(workbook, "schedules.xlsx");
  };

  /* ============================
     RENDER
  ============================ */
  return (
    <div className="schedule-page">
      <ToastContainer position="top-right" autoClose={3000} />

      <div className="header-section">
        <h1>Assign Monthly Task</h1>
        <p>Tasks can be assigned only for the current or future months.</p>
      </div>

      <div className="form-container">
        <form onSubmit={handleSubmit} className="premium-form">

          {/* Activity */}
          <div className="form-section">
            <h3 className="section-title">Activity Details</h3>

            <div className="form-row">
              <div className="form-group flex-2">
                <label>Activity *</label>
                <select name="activity" value={formData.activity} onChange={handleChange} required>
                  <option value="">Select Activity</option>
                  {SCHEDULE_DESCRIPTION.map((s, i) => (
                    <option key={i} value={s.activity}>{s.activity}</option>
                  ))}
                </select>
              </div>

              <div className="form-group flex-1">
                <label>Assigned To *</label>
                <select name="assignedTo" value={formData.assignedTo} onChange={handleChange} required>
                  <option value="">Select Employee</option>
                  {EMPLOYEE_LIST.map((emp, i) => (
                    <option key={i} value={emp}>{emp}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-group">
              <label>Description</label>
              <textarea readOnly value={formData.description} />
            </div>
          </div>

          {/* Schedule */}
          <div className="form-section">
            <h3 className="section-title">Schedule the Month</h3>

            <div className="form-row">
              <div className="form-group">
                <label>Month *</label>
                <input
                  type="month"
                  name="startPeriod"
                  value={formData.startPeriod}
                  min={`${currentYear}-${String(currentMonth + 1).padStart(2, "0")}`}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
          </div>

          {/* Additional Info */}
          <div className="form-section">
            <h3 className="section-title">Additional Information</h3>
            <div className="form-group">
              <label>Comments</label>
              <textarea
                name="comments"
                value={formData.comments}
                onChange={handleChange}
                placeholder="Optional notes"
              />
            </div>
          </div>

          <div className="form-actions">
            <button type="submit" className="submit-btn" disabled={loading}>
              {loading ? "Saving..." : "Assign Task"}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};

export default ScheduleForm;
