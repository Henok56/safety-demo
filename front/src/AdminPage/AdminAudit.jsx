import React, { useEffect, useState, useRef } from "react";
import api from "../api";
import "../styles/AdminAudit.css";
import { 
  FaUserCircle, FaHistory, FaSearch, 
  FaChevronLeft, FaChevronRight, FaArrowRight,
  FaFileAlt, FaCalendarAlt
} from "react-icons/fa";

// --- Enhanced Audit Timeline Component ---
function AuditTimelineItem({ entry }) {
  // Fix the "Record was d" bug by providing a fallback and checking the action
  const actionLabel = entry.action || (entry.changes && Object.keys(entry.changes).length > 0 ? "UPDATE" : "ACTION");
  
  // An update is any action that isn't a fresh creation or a deletion
  const isUpdate = actionLabel === "UPDATE" || (entry.changes && Object.keys(entry.changes).length > 0 && actionLabel !== "CREATE");

  return (
    <div className="timeline-item">
      <div className="timeline-marker"></div>
      <div className="timeline-content">
        <div className="timeline-header">
          <span className="user-pill">
             <FaUserCircle className="user-icon" /> {entry.changedBy || "System"}
          </span>
          <span className="timestamp">
            {entry.changedAt ? new Date(entry.changedAt).toLocaleString() : "Date Unknown"}
          </span>
        </div>
        
        <div className="action-row">
          <span className={`action-badge ${actionLabel.toLowerCase()}`}>
            {actionLabel}
          </span>
        </div>

        {isUpdate ? (
          <div className="diff-container">
            {Object.entries(entry.changes || {}).map(([field, val]) => (
              field !== "action" && (
                <div key={field} className="diff-row">
                  <span className="field-label">{field}</span>
                  <div className="diff-values">
                    <span className="old-val">{String(val?.old ?? "Empty")}</span>
                    <FaArrowRight className="arrow-icon" />
                    <span className="new-val">{String(val?.new ?? "Empty")}</span>
                  </div>
                </div>
              )
            ))}
          </div>
        ) : (
          <p className="event-note">
            The record was <strong>{actionLabel.toLowerCase()}d</strong> by the administrator.
          </p>
        )}
      </div>
    </div>
  );
}

export default function AdminAudit() {
  const [activeLog, setActiveLog] = useState("occurrences");
  const [logs, setLogs] = useState([]);
  const [filters, setFilters] = useState({ user: "", fromDate: "", toDate: "" });
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);
  const logsRef = useRef(null);

  const fetchLogs = async (logType = activeLog) => {
    setLoading(true);
    try {
      // Ensure the endpoint matches your backend route structure
      const res = await api.get(`/admin/audit/${logType}`, { params: filters });
      setLogs(res.data?.data || []);
      setCurrentPage(1);
    } catch (err) {
      console.error("Fetch Error:", err);
      setLogs([]); 
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs(activeLog);
  }, [activeLog]);

  const totalPages = Math.ceil(logs.length / itemsPerPage) || 1;
  const paginatedData = logs.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="audit-dashboard">
      <div className="audit-header-section">
        <div className="header-flex">
          <FaHistory className="main-history-icon" />
          <div>
            <h1>System Audit Trail</h1>
            <p>Transparency log for FDM Occurrences and Operational Schedules</p>
          </div>
        </div>
      </div>

      <div className="audit-controls">
        <div className="tab-switcher">
          <button 
            className={`tab ${activeLog === "occurrences" ? "active" : ""}`} 
            onClick={() => setActiveLog("occurrences")}
          >
            <FaFileAlt /> Occurrences
          </button>
          <button 
            className={`tab ${activeLog === "schedules" ? "active" : ""}`} 
            onClick={() => setActiveLog("schedules")}
          >
            <FaCalendarAlt /> Schedules
          </button>
        </div>

        <div className="search-box">
          <div className="search-input-wrapper">
            <FaSearch className="inner-search-icon" />
            <input 
              type="text" 
              placeholder="Filter by user..." 
              value={filters.user} 
              onChange={(e) => setFilters({ ...filters, user: e.target.value })} 
            />
          </div>
          <input 
            type="date" 
            className="date-picker"
            value={filters.fromDate} 
            onChange={(e) => setFilters({ ...filters, fromDate: e.target.value })} 
          />
          <button className="search-btn" onClick={() => fetchLogs()}>Search History</button>
        </div>
      </div>

      <div className="audit-layout">
        {loading ? (
          <div className="audit-loader-wrapper">
            <div className="loading-spinner"></div>
            <p>Retrieving secure logs...</p>
          </div>
        ) : (
          <div className="audit-main-content" ref={logsRef}>
            {paginatedData.length === 0 ? (
              <div className="empty-audit-state">
                <span>📂</span>
                <p>No activity logs found for this selection.</p>
              </div>
            ) : (
              paginatedData.map((item) => (
                <div className="audit-group-card" key={item._id}>
                  <div className="group-banner">
                    <div className="banner-text">
                      <span className="type-tag">{activeLog === "occurrences" ? "SPI REF" : "ACTIVITY"}</span>
                      <h3>{activeLog === "occurrences" ? item.spi : item.activity}</h3>
                    </div>
                    <span className="db-id">ID: ...{item._id.slice(-8).toUpperCase()}</span>
                  </div>
                  
                  <div className="timeline-container">
                    {(item.changeHistory || [])
                      .sort((a, b) => new Date(b.changedAt) - new Date(a.changedAt))
                      .map((entry, idx) => (
                        <AuditTimelineItem key={idx} entry={entry} />
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {totalPages > 1 && (
        <div className="audit-pagination">
          <button 
            className="pag-nav"
            disabled={currentPage === 1} 
            onClick={() => setCurrentPage(c => c - 1)}
          >
            <FaChevronLeft /> Previous
          </button>
          <span className="page-indicator">
            Page <strong>{currentPage}</strong> of {totalPages}
          </span>
          <button 
            className="pag-nav"
            disabled={currentPage === totalPages} 
            onClick={() => setCurrentPage(c => c + 1)}
          >
            Next <FaChevronRight />
          </button>
        </div>
      )}
    </div>
  );
}