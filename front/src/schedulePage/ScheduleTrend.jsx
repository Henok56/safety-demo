import React, { useEffect, useState } from "react";
import { getSchedules } from "../api/scheduleAPI";
import * as XLSX from "xlsx";
import { Pie, Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
} from "chart.js";
import "../styles/ScheduleTrend.css";

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

const getCurrentMonthRange = () => {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  return {
    from: start.toISOString().split("T")[0],
    to: end.toISOString().split("T")[0],
  };
};

export default function ScheduleTrend() {
  const [tasks, setTasks] = useState([]);
  const [dateRange, setDateRange] = useState(getCurrentMonthRange());
  const [loading, setLoading] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const data = await getSchedules(dateRange.from, dateRange.to);
      setTasks(data);
    } catch (err) {
      console.error("Failed to load schedules", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [dateRange]);

  // --- Data Processing for "Magic" Metrics ---
  const stats = {
    total: tasks.length,
    completed: tasks.filter((t) => t.status === "Completed").length,
    pending: tasks.filter((t) => t.status === "Pending" || t.status === "In Progress").length,
    overdue: tasks.filter((t) => new Date(t.duedate) < new Date() && t.status !== "Completed").length,
  };

  const statusMap = tasks.reduce((acc, t) => {
    acc[t.status] = (acc[t.status] || 0) + 1;
    return acc;
  }, {});

  const workloadMap = tasks.reduce((acc, t) => {
    acc[t.assignedTo || "Unassigned"] = (acc[t.assignedTo || "Unassigned"] || 0) + 1;
    return acc;
  }, {});

  const pieData = {
    labels: Object.keys(statusMap),
    datasets: [{
      data: Object.values(statusMap),
      backgroundColor: ["#fbbf24", "#22c55e", "#3b82f6", "#ef4444"],
      hoverOffset: 10,
    }],
  };

  const barData = {
    labels: Object.keys(workloadMap),
    datasets: [{
      label: "Tasks Assigned",
      data: Object.values(workloadMap),
      backgroundColor: "#6366f1",
      borderRadius: 5,
    }],
  };

  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(tasks.map((t) => ({
      Activity: t.activity,
      Assignee: t.assignedTo,
      Status: t.status,
      DueDate: new Date(t.duedate).toLocaleDateString(),
    })));
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Tasks");
    XLSX.writeFile(workbook, `Report_${dateRange.from}.xlsx`);
  };

  return (
    <div className="trend-dashboard">
      <header className="dashboard-header">
        <div>
          <h1>Operations Overview</h1>
          <p>Monthly performance and resource allocation</p>
        </div>
        <div className="header-actions">
          <div className="date-controls">
            <input type="date" value={dateRange.from} onChange={(e) => setDateRange({ ...dateRange, from: e.target.value })} />
            <span>to</span>
            <input type="date" value={dateRange.to} onChange={(e) => setDateRange({ ...dateRange, to: e.target.value })} />
          </div>
          <button className="export-btn" onClick={exportToExcel}>Export Report</button>
        </div>
      </header>

      {/* KPI Section */}
      <section className="stats-grid">
        <div className="stat-card"><span>Total Tasks</span><h3>{stats.total}</h3></div>
        <div className="stat-card success"><span>Completed</span><h3>{stats.completed}</h3></div>
        <div className="stat-card warning"><span>Active</span><h3>{stats.pending}</h3></div>
        <div className="stat-card danger"><span>Overdue</span><h3>{stats.overdue}</h3></div>
      </section>

      {/* Charts Section */}
      <section className="charts-grid">
        <div className="chart-card">
          <h4>Status Breakdown</h4>
          <div className="chart-container"><Pie data={pieData} options={{ maintainAspectRatio: false }} /></div>
        </div>
        <div className="chart-card">
          <h4>Team Workload</h4>
          <div className="chart-container"><Bar data={barData} options={{ maintainAspectRatio: false }} /></div>
        </div>
      </section>

      {/* Table Section */}
      <section className="table-container">
        <table className="modern-table">
          <thead>
            <tr>
              <th>Activity</th>
              <th>Assignee</th>
              <th>Due Date</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {tasks.map((task, i) => (
              <tr key={i}>
                <td className="task-name">{task.activity}</td>
                <td>{task.assignedTo}</td>
                <td>{new Date(task.duedate).toLocaleDateString()}</td>
                <td>
                  <span className={`badge ${task.status.toLowerCase().replace(" ", "-")}`}>
                    {task.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}