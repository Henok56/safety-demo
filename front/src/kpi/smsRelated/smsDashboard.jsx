// src/kpi/smsRelated/smsDashboard.jsx
import React, { useEffect, useState, useCallback } from "react";
import { 
  FiTrendingUp, FiBarChart2, FiUsers, FiTarget, 
  FiCalendar, FiRefreshCw, FiAlertCircle, FiCheckCircle,
  FiActivity, FiClock, FiUser, FiPlus, FiList, FiEye,
  FiHome, FiFileText, FiArchive
} from "react-icons/fi";
import hazardTrackingApi from "../../api/hazardTrackingApi";
//import HazardForm from "./hazardForm";
import HazardList from "./hazardList";
import HazardDetail from "./hazardDetail";
import "../../styles/smsDashboard.css";

export default function SmsDashboard() {
  const [myStatus, setMyStatus] = useState(null);
  const [myHistory, setMyHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedHazard, setSelectedHazard] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [stats, setStats] = useState({
    totalHazards: 0,
    compliantMonths: 0,
    totalMonths: 0,
    bestMonth: null
  });

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      try {
        const decoded = JSON.parse(atob(token.split(".")[1]));
        setUser(decoded);
      } catch (e) {
        console.error("Error decoding token:", e);
      }
    }
  }, []);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [statusRes, historyRes] = await Promise.all([
        hazardTrackingApi.getMyStatus({ month: selectedMonth, year: selectedYear }),
        hazardTrackingApi.getMyHistory()
      ]);
      
      if (statusRes?.success) {
        setMyStatus(statusRes.data);
      }
      
      if (historyRes?.success) {
        const allHazards = historyRes.data?.all || [];
        setMyHistory(allHazards);
        
        setStats({
          totalHazards: historyRes.data?.total || 0,
          compliantMonths: 0,
          totalMonths: 0,
          bestMonth: null
        });
      }
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setLoading(false);
    }
  }, [selectedMonth, selectedYear]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleViewHazard = (hazard) => {
    setSelectedHazard(hazard);
    setShowDetailModal(true);
  };

  const handleEditHazard = (hazard) => {
    setActiveTab("form");
  };

  const handleDeleteHazard = async (id, hazardId) => {
    if (window.confirm(`Are you sure you want to archive ${hazardId}?`)) {
      try {
        const response = await hazardTrackingApi.deleteHazard(id);
        if (response?.success) {
          await loadData();
          alert("Hazard archived successfully");
        }
      } catch (error) {
        console.error("Delete error:", error);
        alert("Failed to archive hazard");
      }
    }
  };

  const getStatusColor = (submitted, required) => {
    if (submitted >= required) return "#10b981";
    if (submitted >= required * 0.5) return "#f59e0b";
    return "#ef4444";
  };

  const getComplianceMessage = (submitted, required) => {
    if (submitted >= required) return "✅ Monthly requirement met!";
    const remaining = required - submitted;
    return `⚠️ ${remaining} more hazard${remaining !== 1 ? 's' : ''} needed this month`;
  };

  const months = Array.from({ length: 12 }, (_, i) => i + 1);
  const years = [2024, 2025, 2026, 2027];

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="spinner"></div>
        <p>Loading hazard tracking data...</p>
      </div>
    );
  }

  return (
    <div className="sms-dashboard">
      <div className="dashboard-header">
        <div className="header-left">
          <div className="header-icon">⚠️</div>
          <div>
            <h1>SMS Hazard Tracking</h1>
            <p>Safety Management System - Hazard Reporting & Compliance</p>
          </div>
        </div>
        <button className="refresh-btn" onClick={loadData}>
          <FiRefreshCw /> Refresh
        </button>
      </div>

      {user && (
        <div className="user-info-bar">
          <FiUser />
          <span><strong>{user.firstname} {user.lastname}</strong> ({user.email})</span>
          <span className="role-tag">{user.role || "Employee"}</span>
        </div>
      )}

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#e0f2fe' }}>
            <FiBarChart2 />
          </div>
          <div className="stat-content">
            <span className="stat-label">Total Hazards</span>
            <span className="stat-value">{stats.totalHazards}</span>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#dcfce7' }}>
            <FiTrendingUp />
          </div>
          <div className="stat-content">
            <span className="stat-label">Monthly Target</span>
            <span className="stat-value">4 / month</span>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#fef3c7' }}>
            <FiTarget />
          </div>
          <div className="stat-content">
            <span className="stat-label">Current Status</span>
            <span className="stat-value">{myStatus?.submitted || 0}/4</span>
          </div>
        </div>
      </div>

      <div className="month-selector">
        <div className="selector-group">
          <FiCalendar />
          <select 
            value={selectedMonth} 
            onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
          >
            {months.map(m => (
              <option key={m} value={m}>
                {new Date(2000, m - 1).toLocaleString('default', { month: 'long' })}
              </option>
            ))}
          </select>
          <select 
            value={selectedYear} 
            onChange={(e) => setSelectedYear(parseInt(e.target.value))}
          >
            {years.map(y => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>
      </div>

      {myStatus && (
        <div className="status-card">
          <div className="status-header">
            <h3>{new Date(selectedYear, selectedMonth - 1).toLocaleString('default', { month: 'long' })} {selectedYear} Status</h3>
          </div>
          <div className="status-content">
            <div className="progress-section">
              <div className="progress-label">
                <span>Progress: {myStatus.submitted}/{myStatus.required}</span>
                <span className="compliance-message">{getComplianceMessage(myStatus.submitted, myStatus.required)}</span>
              </div>
              <div className="progress-bar-container">
                <div 
                  className="progress-bar-fill"
                  style={{ 
                    width: `${Math.min((myStatus.submitted / myStatus.required) * 100, 100)}%`,
                    background: getStatusColor(myStatus.submitted, myStatus.required)
                  }}
                />
              </div>
            </div>
            {myStatus.hazardIds?.length > 0 && (
              <div className="submitted-hazards">
                <strong>Submitted Hazards:</strong>
                <div className="hazard-tags">
                  {myStatus.hazardIds.map((id, idx) => (
                    <span key={idx} className="hazard-tag">{id}</span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="sms-tabs">
        <button 
          className={`tab-btn ${activeTab === 'dashboard' ? 'active' : ''}`}
          onClick={() => setActiveTab('dashboard')}
        >
          <FiHome /> Dashboard
        </button>
       
        <button 
          className={`tab-btn ${activeTab === 'history' ? 'active' : ''}`}
          onClick={() => setActiveTab('history')}
        >
          <FiList /> Hazard History
        </button>
      </div>

      <div className="tab-content">
        {activeTab === 'dashboard' && (
          <div className="dashboard-content">
            <div className="info-card">
              <h3>Welcome to SMS Hazard Tracking</h3>
              <p>This system helps you track and monitor hazard reports for KPI compliance. Each employee is required to submit at least 4 hazards per month.</p>
            </div>
          </div>
        )}

        {activeTab === 'form' && (
          <HazardForm onSuccess={loadData} user={user} />
        )}

        {activeTab === 'history' && (
          <HazardList 
            hazards={myHistory}
            loading={loading}
            onEdit={handleEditHazard}
            onDelete={handleDeleteHazard}
            onView={handleViewHazard}
          />
        )}
      </div>

      {showDetailModal && selectedHazard && (
        <HazardDetail 
          hazard={selectedHazard}
          onClose={() => {
            setShowDetailModal(false);
            setSelectedHazard(null);
          }}
        />
      )}
    </div>
  );
}