import React, { useEffect, useMemo, useState } from "react";
import {
  getActiveTimer,
  getEmployeesForTimer,
  getEntries,
  startTimer,
  stopTimer,
} from "../../api/unproductiveTimeApi";
import UnproductiveTimeNav from "../../components/UnproductiveTimeNav";
import "../../styles/UnproductiveTimeTimer.css";

const TYPES = [
  ["medical leave", "Medical Leave"],
  ["morning leave", "Morning Leave"],
  ["negligence", "Negligence"],
  ["maternity", "Maternity"],
  ["vacation", "Vacation"],
  ["other", "Other"],
];

const employeeLabel = (employee) => {
  const user = employee?.userAccount || employee;
  const name = [user?.firstname, user?.lastname].filter(Boolean).join(" ");
  const staffId = user?.userid || employee?.regNo;

  return [name || "Unnamed employee", staffId ? `(${staffId})` : ""]
    .filter(Boolean)
    .join(" ");
};

const formatHours = (value) => Number(value || 0).toFixed(2);

export default function UnproductiveTimeTimer({ onSuccess, showNav = true }) {
  const [employeeId, setEmployeeId] = useState("");
  const [employees, setEmployees] = useState([]);
  const [activeTimers, setActiveTimers] = useState([]);
  const [type, setType] = useState("medical leave");
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [elapsedMap, setElapsedMap] = useState({});

  const selectedEmployee = useMemo(
    () => employees.find((e) => e._id === employeeId),
    [employees, employeeId]
  );

  // ======================
  // FETCH ACTIVE TIMERS
  // ======================
  const fetchActiveTimers = async () => {
    try {
      const res = await getActiveTimer();
      const data = res.data?.data || res.data || [];
      setActiveTimers(Array.isArray(data) ? data : (data ? [data] : []));
    } catch (err) {
      setActiveTimers([]);
    }
  };

  // ======================
  // FETCH EMPLOYEES
  // ======================
  const fetchEmployees = async () => {
    try {
      const res = await getEmployeesForTimer();
      const activeEmployees = (res.data?.data || []).filter(
        (e) => e.status !== "inactive"
      );
      setEmployees(activeEmployees);
    } catch (err) {
      alert("Failed to load employees");
    }
  };

  useEffect(() => {
    fetchActiveTimers();
    fetchEmployees();
  }, []);

  // ======================
  // LIVE TIMERS
  // ======================
  useEffect(() => {
    const interval = setInterval(() => {
      const map = {};

      activeTimers.forEach((t) => {
        const start = new Date(t.startTime).getTime();
        map[t._id] = Math.floor((Date.now() - start) / 1000);
      });

      setElapsedMap(map);
    }, 1000);

    return () => clearInterval(interval);
  }, [activeTimers]);

  const formatElapsed = (sec = 0) => {
    const h = String(Math.floor(sec / 3600)).padStart(2, "0");
    const m = String(Math.floor((sec % 3600) / 60)).padStart(2, "0");
    const s = String(sec % 60).padStart(2, "0");
    return `${h}:${m}:${s}`;
  };

  // ======================
  // START TIMER (FIXED)
  // ======================
  const handleStart = async () => {
    if (!employeeId) {
      alert("Select employee");
      return;
    }

    // ✅ FIX: only check THIS employee
    const alreadyRunning = activeTimers.some(
      (t) => t.employee?._id === employeeId
    );

    if (alreadyRunning) {
      alert("This employee already has an active timer.");
      return;
    }

    setLoading(true);
    try {
      await startTimer({
        employee: employeeId,
        type,
        reason: reason.trim(),
      });

      setReason("");
      await fetchActiveTimers();
      onSuccess?.();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to start timer");
    } finally {
      setLoading(false);
    }
  };

  // ======================
  // STOP TIMER
  // ======================
  const handleStop = async (id) => {
    try {
      await stopTimer(id);
      await fetchActiveTimers();
    } catch (err) {
      alert("Failed to stop timer");
    }
  };

  return (
    <div className="ut-timer-container">
      {showNav && <UnproductiveTimeNav />}

      <h2>Unproductive Time Timer</h2>

      {/* ======================
          FORM
      ====================== */}
      <div className="form-box">
        <select
          value={employeeId}
          onChange={(e) => setEmployeeId(e.target.value)}
        >
          <option value="">Select employee</option>
          {employees.map((e) => (
            <option key={e._id} value={e._id}>
              {employeeLabel(e)}
            </option>
          ))}
        </select>

        <select value={type} onChange={(e) => setType(e.target.value)}>
          {TYPES.map(([v, l]) => (
            <option key={v} value={v}>
              {l}
            </option>
          ))}
        </select>

        <textarea
          placeholder="Reason..."
          value={reason}
          onChange={(e) => setReason(e.target.value)}
        />

        <button onClick={handleStart} disabled={loading}>
          Start Timer
        </button>
      </div>


    </div>
  );
}