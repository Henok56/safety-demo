import React, { useEffect, useState } from "react";
import { getStatisticsSummary } from "../api/unproductiveTimeApi";
import "../styles/StatsCards.css";

export default function StatsCards() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await getStatisticsSummary();
      setStats(res.data.data);
    } catch (err) {
      console.error("Failed to load stats", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="stats-loading">Loading stats...</div>;
  }

  if (!stats) {
    return <div className="stats-error">No data available</div>;
  }

  const { overall, byType } = stats;

  return (
    <div className="stats-container">

      {/* ===== OVERALL CARDS ===== */}
      <div className="stats-grid">
        <div className="stat-card">
          <h3>Total Incidents</h3>
          <p>{overall.totalIncidents}</p>
        </div>

        <div className="stat-card">
          <h3>Total Hours Lost</h3>
          <p>{overall.totalHours}</p>
        </div>

        <div className="stat-card">
          <h3>Average Hours</h3>
          <p>{overall.avgHours}</p>
        </div>
      </div>

      {/* ===== TYPE BREAKDOWN ===== */}
      <div className="stats-types">
        <h3>Breakdown by Type</h3>

        <div className="type-grid">
          {byType.map((item) => (
            <div key={item._id} className="type-card">
              <span className="type-name">{item._id}</span>
              <span className="type-count">{item.count}</span>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
