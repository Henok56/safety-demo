import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlusCircle, faListAlt, faChartLine, faEye } from "@fortawesome/free-solid-svg-icons";
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
        <div className="dashboard-button" onClick={() => navigate('/form')}>
          <FontAwesomeIcon icon={faPlusCircle} size="3x" />
          <h3>New Occurrence</h3>
          <p>Submit a new Safety occurrence report.</p>
        </div>

        <div className="dashboard-button" onClick={() => navigate('/list')}>
          <FontAwesomeIcon icon={faListAlt} size="3x" />
          <h3>Registered Occurrences</h3>
          <p>Browse and manage all reported occurrences.</p>
        </div>

        <div className="dashboard-button" onClick={() => navigate('/trends')}>
          <FontAwesomeIcon icon={faChartLine} size="3x" />
          <h3>View Trends</h3>
          <p>Analyze trends and patterns in reported data.</p>
        </div>

        <div className="dashboard-button" onClick={() => navigate("/schedule")}>
          <FontAwesomeIcon icon={faEye} size="3x" />
          <h3>Schedule List</h3>
          <p>View all assigned tasks.</p>
        </div>
      </div>
    </div>
  );
}
