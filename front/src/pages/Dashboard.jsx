import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlusCircle, faChartLine, faEye, faExclamationTriangle } from "@fortawesome/free-solid-svg-icons";
import "../styles/Dashboard.css";

export default function Dashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        await api.get("/auth/me"); // verify cookie
        setLoading(false);
      } catch {
        navigate("/login", { replace: true });
      }
    };
    checkAuth();
  }, [navigate]);

  if (loading) return <p>Loading dashboard...</p>;

  return (
    <div className="dashboard">
      <h2>Dashboard</h2>
      <div className="button-grid">
        
        {/* ✅ REGISTER SAFETY HAZARD CARD BUTTON */}
        <div className="dashboard-button hazard-card" onClick={() => navigate("/sms/form")}>
          <FontAwesomeIcon icon={faExclamationTriangle} size="3x" style={{ color: "#f59e0b" }} />
          <h3>Register Safety Hazard</h3>
          <p>Instantly log a safety hazard observation or risk.</p>
        </div>

        <div className="dashboard-button" onClick={() => navigate("/talent/my-training")}>
          <FontAwesomeIcon icon={faChartLine} size="3x" />
          <h3>Your Assigned Training</h3>
          <p>View your scheduled Training sessions.</p>
        </div>

        <div className="dashboard-button" onClick={() => navigate("/schedule")}>
          <FontAwesomeIcon icon={faEye} size="3x" />
          <h3>Monthly Task List</h3>
          <p>View all assigned tasks.</p>
        </div>

        <div className="dashboard-button" onClick={() => navigate("/scheduletrend")}>
          <FontAwesomeIcon icon={faEye} size="3x" />
          <h3>Task List Chart</h3>
          <p>View tasks in chart format.</p>
        </div>

      </div>
    </div>
  );
}