import React, { useEffect, useState } from "react";
import {
  getActiveTimer,
  getEmployeesForTimer,
  startTimer,
  stopTimer,
} from "../api/unproductiveTimeApi";
import "../styles/TimerCard.css";

const employeeLabel = (employee) => {
  const user = employee?.userAccount || employee;
  const name = [user?.firstname, user?.lastname].filter(Boolean).join(" ");
  const staffId = user?.userid || employee?.regNo;
  return [name || "Unnamed employee", staffId ? `(${staffId})` : ""]
    .filter(Boolean)
    .join(" ");
};

export default function TimerCard() {
  const [activeTimer, setActiveTimer] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [time, setTime] = useState(0);

  const [form, setForm] = useState({
    employee: "",
    type: "medical leave",
    reason: "",
  });

  useEffect(() => {
    fetchActiveTimer();
    fetchEmployees();
  }, []);

  const fetchActiveTimer = async () => {
    try {
      const res = await getActiveTimer();
      setActiveTimer(res.data?.data || null);
    } catch (err) {
      setActiveTimer(null);
    }
  };

  const fetchEmployees = async () => {
    try {
      const res = await getEmployeesForTimer();
      setEmployees(res.data?.data || []);
    } catch (err) {
      console.error("Failed to load employees", err);
    }
  };

  useEffect(() => {
    let interval;

    if (activeTimer) {
      interval = setInterval(() => {
        const start = new Date(activeTimer.startTime).getTime();
        const now = new Date().getTime();
        const diff = Math.floor((now - start) / 1000);
        setTime(diff);
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [activeTimer]);

  const formatTime = (seconds) => {
    const h = String(Math.floor(seconds / 3600)).padStart(2, "0");
    const m = String(Math.floor((seconds % 3600) / 60)).padStart(2, "0");
    const s = String(seconds % 60).padStart(2, "0");
    return `${h}:${m}:${s}`;
  };

  const handleStart = async () => {
    if (!form.employee) {
      alert("Employee required");
      return;
    }

    try {
      setLoading(true);
      const res = await startTimer(form);
      setActiveTimer(res.data.data);
    } catch (err) {
      const message = err.response?.data?.message || "Error starting timer";
      console.error("Start timer failed:", {
        status: err.response?.status,
        data: err.response?.data,
        payload: form,
      });
      alert(message);
    } finally {
      setLoading(false);
    }
  };

  const handleStop = async () => {
    try {
      setLoading(true);
      await stopTimer(activeTimer._id);
      setActiveTimer(null);
      setTime(0);
    } catch (err) {
      alert(err.response?.data?.message || "Error stopping timer");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="timer-card">
      <h2>Unproductive Time Tracker</h2>

      {activeTimer ? (
        <div className="timer-active">
          <p className="timer-time">{formatTime(time)}</p>
          <p>{employeeLabel(activeTimer.employee)}</p>
          <button onClick={handleStop} disabled={loading}>
            Stop Timer
          </button>
        </div>
      ) : (
        <div className="timer-form">
          <select
            value={form.employee}
            onChange={(e) => setForm({ ...form, employee: e.target.value })}
          >
            <option value="">Select employee</option>
            {employees.map((employee) => (
              <option key={employee._id} value={employee._id}>
                {employeeLabel(employee)}
              </option>
            ))}
          </select>

          <select
            value={form.type}
            onChange={(e) => setForm({ ...form, type: e.target.value })}
          >
            <option value="medical leave">Medical Leave</option>
            <option value="morning leave">Morning Leave</option>
            <option value="negligence">Negligence</option>
            <option value="maternity">Maternity</option>
            <option value="vacation">Vacation</option>
            <option value="other">Other</option>
          </select>

          <textarea
            placeholder="Reason (optional)"
            value={form.reason}
            onChange={(e) => setForm({ ...form, reason: e.target.value })}
          />

          <button onClick={handleStart} disabled={loading}>
            Start Timer
          </button>
        </div>
      )}
    </div>
  );
}
