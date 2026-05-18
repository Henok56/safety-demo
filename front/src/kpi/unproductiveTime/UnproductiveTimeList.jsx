import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import {
  approveEntry,
  deleteEntry,
  getEntries,
  rejectEntry,
  getActiveTimer,
  stopTimer,
} from "../../api/unproductiveTimeApi";
import UnproductiveTimeNav from "../../components/UnproductiveTimeNav";
import { 
  FiClock, FiFilter, FiSearch, FiRefreshCw, FiTrash2, 
  FiPlay, FiStopCircle, FiUser, FiTag, FiCalendar,
  FiAlertCircle, FiCheckCircle, FiXCircle, FiEye
} from "react-icons/fi";
import "../../styles/UnproductiveTimeList.css";

const TYPES = [
  "medical leave",
  "morning leave",
  "negligence",
  "maternity",
  "vacation",
  "other",
];

const STATUSES = [
  "pending",
  "stopped",
  "approved",
  "rejected",
  "auto_stopped",
];

const getEmployeeName = (employee) =>
  employee?.name ||
  [employee?.firstname, employee?.lastname].filter(Boolean).join(" ") ||
  employee?.regNo ||
  "-";

const formatHours = (value) => Number(value || 0).toFixed(2);

export default function UnproductiveTimeList({ refreshKey = 0, showNav = true }) {
  const [records, setRecords] = useState([]);
  const [activeTimer, setActiveTimer] = useState(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  
  const recordsPerPage = 10;
  const navigate = useNavigate();

  const token = localStorage.getItem("accessToken");

  const role = useMemo(() => {
    if (!token) return null;
    try {
      return jwtDecode(token)?.role?.toLowerCase();
    } catch {
      return null;
    }
  }, [token]);

  const canManage = ["superadmin", "manager", "team_leader"].includes(role);

  const fetchData = async () => {
    setLoading(true);
    try {
      const params = {
        ...(statusFilter ? { status: statusFilter } : {}),
        ...(typeFilter ? { type: typeFilter } : {}),
      };

      const [entriesRes, activeRes] = await Promise.all([
        getEntries(params),
        getActiveTimer(),
      ]);

      setRecords(entriesRes.data?.data || []);
      setActiveTimer(activeRes.data?.data || null);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to load records");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [refreshKey, statusFilter, typeFilter]);

  // LIVE TIMER EFFECT
  useEffect(() => {
    if (!activeTimer?.startTime) {
      setElapsedSeconds(0);
      return;
    }

    const tick = () => {
      const start = new Date(activeTimer.startTime).getTime();
      setElapsedSeconds(Math.floor((Date.now() - start) / 1000));
    };

    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [activeTimer]);

  const formatElapsed = (seconds) => {
    const h = String(Math.floor(seconds / 3600)).padStart(2, "0");
    const m = String(Math.floor((seconds % 3600) / 60)).padStart(2, "0");
    const s = String(seconds % 60).padStart(2, "0");
    return `${h}:${m}:${s}`;
  };

  const handleStop = async () => {
    if (!activeTimer?._id) return;

    try {
      await stopTimer(activeTimer._id);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || "Stop failed");
    }
  };

  const remove = async (id) => {
    if (!window.confirm("Delete this record?")) return;

    try {
      await deleteEntry(id);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || "Delete failed");
    }
  };

  const viewDetails = (record) => {
    setSelectedRecord(record);
    setShowDetailsModal(true);
  };

  // Filter by search term
  const filteredRecords = records.filter(record => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    const employeeName = getEmployeeName(record.employee).toLowerCase();
    const type = record.type?.toLowerCase() || "";
    return employeeName.includes(term) || type.includes(term);
  });

  // Pagination
  const totalPages = Math.ceil(filteredRecords.length / recordsPerPage);
  const paginatedRecords = filteredRecords.slice(
    (currentPage - 1) * recordsPerPage,
    currentPage * recordsPerPage
  );

  // Calculate stats
  const totalRecords = records.length;
  const pendingRecords = records.filter(r => r.status === "pending").length;
  const approvedRecords = records.filter(r => r.status === "approved").length;
  const rejectedRecords = records.filter(r => r.status === "rejected").length;

  return (
    <div className="list-dashboard">
      {showNav && <UnproductiveTimeNav />}

      {/* Header */}
      <div className="list-header">
        <div className="header-left">
          <div className="header-icon">📋</div>
          <div>
            <h1>Unproductive Time Records</h1>
            <p>View and manage all time entries</p>
          </div>
        </div>
        <button className="refresh-btn" onClick={fetchData}>
          <FiRefreshCw /> Refresh
        </button>
      </div>

      {/* Stats Cards */}
      <div className="list-stats">
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#e0f2fe' }}>
            <FiClock />
          </div>
          <div className="stat-content">
            <span className="stat-label">Total Records</span>
            <span className="stat-value">{totalRecords}</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#fef3c7' }}>
            <FiAlertCircle />
          </div>
          <div className="stat-content">
            <span className="stat-label">Pending</span>
            <span className="stat-value">{pendingRecords}</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#dcfce7' }}>
            <FiCheckCircle />
          </div>
          <div className="stat-content">
            <span className="stat-label">Approved</span>
            <span className="stat-value">{approvedRecords}</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#fee2e2' }}>
            <FiXCircle />
          </div>
          <div className="stat-content">
            <span className="stat-label">Rejected</span>
            <span className="stat-value">{rejectedRecords}</span>
          </div>
        </div>
      </div>

      {/* Active Timer Banner */}
      {activeTimer && (
        <div className="active-timer-banner">
          <div className="timer-info">
            <div className="timer-icon">
              <FiPlay />
            </div>
            <div className="timer-details">
              <span className="timer-label">Active Timer</span>
              <span className="timer-employee">{getEmployeeName(activeTimer.employee)}</span>
              <span className="timer-type">{activeTimer.type}</span>
            </div>
            <div className="timer-display">
              <span className="timer-clock">{formatElapsed(elapsedSeconds)}</span>
              <button className="stop-timer-btn" onClick={handleStop}>
                <FiStopCircle /> Stop Timer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="filters-section">
        <div className="filters-left">
          <div className="filter-group">
            <FiFilter />
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="">All Status</option>
              {STATUSES.map((status) => (
                <option key={status} value={status}>
                  {status.replace('_', ' ').toUpperCase()}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <FiTag />
            <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
              <option value="">All Types</option>
              {TYPES.map((type) => (
                <option key={type} value={type}>
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="filters-right">
          <div className="search-box">
            <FiSearch />
            <input
              type="text"
              placeholder="Search by employee or type..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="table-container">
        {loading ? (
          <div className="loading-container">
            <div className="spinner"></div>
            <p>Loading records...</p>
          </div>
        ) : (
          <table className="data-table">
            <colgroup>
              <col style={{ width: '18%' }} />
              <col style={{ width: '12%' }} />
              <col style={{ width: '15%' }} />
              <col style={{ width: '15%' }} />
              <col style={{ width: '10%' }} />
              <col style={{ width: '10%' }} />
              <col style={{ width: '10%' }} />
              <col style={{ width: '10%' }} />
            </colgroup>
            <thead>
              <tr>
                <th>Employee</th>
                <th>Type</th>
                <th>Start Time</th>
                <th>End Time</th>
                <th className="text-center">Raw Hours</th>
                <th className="text-center">Final Hours</th>
                <th className="text-center">Status</th>
                <th className="text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedRecords.length === 0 ? (
                <tr className="empty-row">
                  <td colSpan="8">
                    <div className="empty-state">
                      <div className="empty-content">
                        <FiClock size={48} />
                        <p>No records found</p>
                        <span>Try adjusting your filters</span>
                      </div>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedRecords.map((record) => (
                  <tr key={record._id} className={`status-row status-${record.status}`}>
                    <td className="employee-cell">
                      <div className="employee-wrapper">
                        <FiUser size={14} className="employee-icon" />
                        <span className="employee-name">{getEmployeeName(record.employee)}</span>
                      </div>
                    </td>
                    <td className="type-cell">
                      <span className="type-badge">{record.type}</span>
                    </td>
                    <td className="datetime-cell">
                      <div className="datetime-wrapper">
                        <span className="date">{new Date(record.startTime).toLocaleDateString()}</span>
                        <span className="time">{new Date(record.startTime).toLocaleTimeString()}</span>
                      </div>
                    </td>
                    <td className="datetime-cell">
                      {record.endTime ? (
                        <div className="datetime-wrapper">
                          <span className="date">{new Date(record.endTime).toLocaleDateString()}</span>
                          <span className="time">{new Date(record.endTime).toLocaleTimeString()}</span>
                        </div>
                      ) : (
                        <span className="in-progress-badge">In Progress</span>
                      )}
                    </td>
                    <td className="hours-cell text-center">
                      <div className="hours-wrapper">
                        <strong>{formatHours(record.rawHoursLost)}</strong>
                        <span className="hours-unit">hrs</span>
                      </div>
                    </td>
                    <td className="hours-cell text-center">
                      <div className="hours-wrapper">
                        <strong>{formatHours(record.finalHoursLost)}</strong>
                        <span className="hours-unit">hrs</span>
                      </div>
                    </td>
                    <td className="status-cell text-center">
                      <span className={`status-badge status-${record.status}`}>
                        {record.status === 'approved' && <FiCheckCircle size={12} />}
                        {record.status === 'pending' && <FiAlertCircle size={12} />}
                        {record.status === 'rejected' && <FiXCircle size={12} />}
                        {record.status === 'stopped' && <FiStopCircle size={12} />}
                        {record.status === 'auto_stopped' && <FiClock size={12} />}
                        <span>{record.status.replace('_', ' ')}</span>
                      </span>
                    </td>
                    <td className="actions-cell text-center">
                      <button 
                        className="view-btn"
                        onClick={() => viewDetails(record)}
                        title="View Details"
                      >
                        <FiEye size={14} />
                        <span>View</span>
                      </button>
                      {canManage && (
                        <button 
                          className="delete-btn"
                          onClick={() => remove(record._id)}
                          title="Delete"
                        >
                          <FiTrash2 size={14} />
                          <span>Delete</span>
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {!loading && filteredRecords.length > 0 && (
        <div className="pagination">
          <div className="pagination-info">
            Showing {((currentPage - 1) * recordsPerPage) + 1} - {Math.min(currentPage * recordsPerPage, filteredRecords.length)} of {filteredRecords.length} entries
          </div>
          <div className="pagination-controls">
            <button 
              disabled={currentPage === 1} 
              onClick={() => setCurrentPage(p => p - 1)}
            >
              Previous
            </button>
            <span className="page-number">{currentPage} / {totalPages}</span>
            <button 
              disabled={currentPage === totalPages} 
              onClick={() => setCurrentPage(p => p + 1)}
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Details Modal */}
      {showDetailsModal && selectedRecord && (
        <div className="modal-overlay" onClick={() => setShowDetailsModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Record Details</h3>
              <button className="modal-close" onClick={() => setShowDetailsModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <div className="detail-row">
                <label>Employee:</label>
                <span>{getEmployeeName(selectedRecord.employee)}</span>
              </div>
              <div className="detail-row">
                <label>Type:</label>
                <span className="type-badge">{selectedRecord.type}</span>
              </div>
              <div className="detail-row">
                <label>Start Time:</label>
                <span>{new Date(selectedRecord.startTime).toLocaleString()}</span>
              </div>
              <div className="detail-row">
                <label>End Time:</label>
                <span>{selectedRecord.endTime ? new Date(selectedRecord.endTime).toLocaleString() : '-'}</span>
              </div>
              <div className="detail-row">
                <label>Raw Hours:</label>
                <span>{formatHours(selectedRecord.rawHoursLost)} hours</span>
              </div>
              <div className="detail-row">
                <label>Final Hours:</label>
                <span className="hours-highlight">{formatHours(selectedRecord.finalHoursLost)} hours</span>
              </div>
              <div className="detail-row">
                <label>Status:</label>
                <span className={`status-badge status-${selectedRecord.status}`}>
                  {selectedRecord.status}
                </span>
              </div>
              {selectedRecord.reason && (
                <div className="detail-row full-width">
                  <label>Reason:</label>
                  <p className="reason-text">{selectedRecord.reason}</p>
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button className="close-modal-btn" onClick={() => setShowDetailsModal(false)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}