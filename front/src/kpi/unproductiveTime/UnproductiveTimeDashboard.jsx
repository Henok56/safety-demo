import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import {
  approveEntry,
  deleteEntry,
  getEntries,
  getStatisticsSummary,
  rejectEntry,
} from "../../api/unproductiveTimeApi";
import UnproductiveTimeNav from "../../components/UnproductiveTimeNav";
import { 
  FiClock, FiCheckCircle, FiAlertCircle, FiXCircle, 
  FiBarChart2, FiTrendingUp, FiFilter, FiSearch, 
  FiChevronRight, FiCalendar, FiUser, FiTag,
  FiDownload, FiRefreshCw, FiEye, FiActivity
} from "react-icons/fi";
import "../../styles/UnproductiveTimeDashboard.css";

const getEmployeeName = (employee) =>
  employee?.name ||
  [employee?.firstname, employee?.lastname].filter(Boolean).join(" ") ||
  employee?.regNo ||
  "-";

const formatHours = (value) => Number(value || 0).toFixed(2);

const calcPercentage = (part, total) => {
  if (!total) return 0;
  return ((part / total) * 100).toFixed(1);
};

export default function UnproductiveTimeDashboard({
  refreshKey = 0,
  onNavigate,
  showNav = true,
}) {
  const [data, setData] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterType, setFilterType] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("date-desc");
  const [currentPage, setCurrentPage] = useState(1);
  
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

  const isAdmin = ["superadmin", "manager", "team_leader"].includes(role);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [entriesRes, statsRes] = await Promise.all([
        getEntries(),
        getStatisticsSummary(),
      ]);
      setData(entriesRes.data?.data || []);
      setStats(statsRes.data?.data || null);
    } catch (err) {
      console.error("Fetch error", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [refreshKey]);

  const analytics = useMemo(() => {
    if (!stats) return null;
    
    const totalHours = stats.totalHours || 0;
    const approvedHours = stats.approvedHours || 0;
    const pendingHours = stats.pendingHours || 0;
    const rejectedHours = totalHours - approvedHours - pendingHours;
    
    return {
      totalRecords: stats.count || 0,
      totalHours,
      approvedHours,
      pendingHours,
      rejectedHours,
      approvalRate: calcPercentage(approvedHours, totalHours),
      pendingRate: calcPercentage(pendingHours, totalHours),
      rejectionRate: calcPercentage(rejectedHours, totalHours),
      avgHoursPerEntry: totalHours / (stats.count || 1),
    };
  }, [stats]);

  const uniqueTypes = useMemo(() => {
    return [...new Set(data.map(item => item.type))].filter(Boolean);
  }, [data]);

  const processedData = useMemo(() => {
    let filtered = [...data];

    if (filterStatus !== "all") {
      filtered = filtered.filter(item => item.status === filterStatus);
    }

    if (filterType !== "all") {
      filtered = filtered.filter(item => item.type === filterType);
    }

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(item => 
        getEmployeeName(item.employee).toLowerCase().includes(term) ||
        item.type?.toLowerCase().includes(term)
      );
    }

    filtered.sort((a, b) => {
      switch (sortBy) {
        case "date-desc": return new Date(b.startTime) - new Date(a.startTime);
        case "date-asc": return new Date(a.startTime) - new Date(b.startTime);
        case "hours-desc": return (b.finalHoursLost || 0) - (a.finalHoursLost || 0);
        case "hours-asc": return (a.finalHoursLost || 0) - (b.finalHoursLost || 0);
        default: return 0;
      }
    });

    return filtered;
  }, [data, filterStatus, filterType, sortBy, searchTerm]);

  const totalPages = Math.ceil(processedData.length / recordsPerPage);
  const paginatedData = processedData.slice(
    (currentPage - 1) * recordsPerPage,
    currentPage * recordsPerPage
  );

  const statusBreakdown = useMemo(() => ({
    pending: data.filter(d => d.status === "pending").length,
    approved: data.filter(d => d.status === "approved").length,
    rejected: data.filter(d => d.status === "rejected").length,
  }), [data]);

  const topEmployees = useMemo(() => {
    const employeeMap = new Map();
    data.forEach(item => {
      const name = getEmployeeName(item.employee);
      if (!employeeMap.has(name)) {
        employeeMap.set(name, { name, hours: 0, count: 0 });
      }
      const emp = employeeMap.get(name);
      emp.hours += item.finalHoursLost || 0;
      emp.count++;
    });
    return Array.from(employeeMap.values())
      .sort((a, b) => b.hours - a.hours)
      .slice(0, 5);
  }, [data]);

  const openTimer = () => {
    if (onNavigate) {
      onNavigate("timer");
      return;
    }
    navigate("/kpi/unproductive-time/timer");
  };

  const openDetails = (id) => {
    navigate(`/kpi/unproductive-time/${id}`);
  };

  const exportToCSV = () => {
    const csvData = processedData.map(item => ({
      Employee: getEmployeeName(item.employee),
      Type: item.type,
      'Start Time': new Date(item.startTime).toLocaleString(),
      'End Time': item.endTime ? new Date(item.endTime).toLocaleString() : 'In Progress',
      'Hours Lost': item.finalHoursLost || 0,
      Status: item.status,
    }));
    
    const headers = Object.keys(csvData[0] || {});
    const csv = [
      headers.join(','),
      ...csvData.map(row => headers.map(h => JSON.stringify(row[h] || '')).join(','))
    ].join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `unproductive-time-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="ut-dashboard">
      {showNav && <UnproductiveTimeNav />}

      <div className="dashboard-header">
        <div className="header-left">
          <div className="header-icon">⏱️</div>
          <div>
            <h1>Unproductive Time Intelligence</h1>
            <p>Monitor, analyze, and optimize workforce productivity</p>
          </div>
        </div>
        <div className="header-actions">
          <button className="action-btn secondary" onClick={exportToCSV}>
            <FiDownload /> Export
          </button>
          <button className="action-btn primary" onClick={openTimer}>
            <FiClock /> Start Timer
          </button>
        </div>
      </div>

      {analytics && (
        <div className="kpi-grid">
          <div className="kpi-card">
            <div className="kpi-icon" style={{ background: '#e0f2fe' }}>
              <FiBarChart2 />
            </div>
            <div className="kpi-content">
              <span className="kpi-label">Total Hours Lost</span>
              <span className="kpi-value">{formatHours(analytics.totalHours)}h</span>
              <span className="kpi-trend">{analytics.totalRecords} entries</span>
            </div>
          </div>

          <div className="kpi-card">
            <div className="kpi-icon" style={{ background: '#dcfce7' }}>
              <FiCheckCircle />
            </div>
            <div className="kpi-content">
              <span className="kpi-label">Approved</span>
              <span className="kpi-value">{formatHours(analytics.approvedHours)}h</span>
              <span className="kpi-trend success">{analytics.approvalRate}% of total</span>
            </div>
          </div>

          <div className="kpi-card">
            <div className="kpi-icon" style={{ background: '#fef3c7' }}>
              <FiAlertCircle />
            </div>
            <div className="kpi-content">
              <span className="kpi-label">Pending Review</span>
              <span className="kpi-value">{formatHours(analytics.pendingHours)}h</span>
              <span className="kpi-trend warning">{analytics.pendingRate}% of total</span>
            </div>
          </div>

          <div className="kpi-card">
            <div className="kpi-icon" style={{ background: '#fee2e2' }}>
              <FiXCircle />
            </div>
            <div className="kpi-content">
              <span className="kpi-label">Rejected</span>
              <span className="kpi-value">{formatHours(analytics.rejectedHours)}h</span>
              <span className="kpi-trend error">{analytics.rejectionRate}% of total</span>
            </div>
          </div>
        </div>
      )}

      <div className="quick-stats">
        <div className="stat-badge">
          <span className="stat-dot pending"></span>
          Pending: {statusBreakdown.pending}
        </div>
        <div className="stat-badge">
          <span className="stat-dot approved"></span>
          Approved: {statusBreakdown.approved}
        </div>
        <div className="stat-badge">
          <span className="stat-dot rejected"></span>
          Rejected: {statusBreakdown.rejected}
        </div>
        <div className="stat-badge">
          <span className="stat-dot average"></span>
          Avg: {formatHours(analytics?.avgHoursPerEntry)}h/entry
        </div>
      </div>

      <div className="filters-section">
        <div className="filters-left">
          <div className="filter-group">
            <FiFilter />
            <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
              <option value="all">All Status</option>
              <option value="pending">Pending ({statusBreakdown.pending})</option>
              <option value="approved">Approved ({statusBreakdown.approved})</option>
              <option value="rejected">Rejected ({statusBreakdown.rejected})</option>
            </select>
          </div>

          <div className="filter-group">
            <FiTag />
            <select value={filterType} onChange={(e) => setFilterType(e.target.value)}>
              <option value="all">All Types</option>
              {uniqueTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <FiTrendingUp />
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
              <option value="date-desc">Newest First</option>
              <option value="date-asc">Oldest First</option>
              <option value="hours-desc">Most Hours</option>
              <option value="hours-asc">Least Hours</option>
            </select>
          </div>
        </div>

        <div className="filters-right">
          <div className="search-box">
            <FiSearch />
            <input
              type="text"
              placeholder="Search employee or type..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button className="refresh-btn" onClick={fetchData}>
            <FiRefreshCw />
          </button>
        </div>
      </div>

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th className="col-employee">Employee</th>
              <th className="col-type">Type</th>
              <th className="col-start">Start Time</th>
              <th className="col-end">End Time</th>
              <th className="col-hours">Hours Lost</th>
              <th className="col-status">Status</th>
              <th className="col-actions">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr className="loading-row">
                <td colSpan="7">
                  <div className="loading-state">
                    <div className="spinner"></div>
                    <p>Loading data...</p>
                  </div>
                </td>
              </tr>
            ) : paginatedData.length === 0 ? (
              <tr className="empty-row">
                <td colSpan="7">
                  <div className="empty-state">
                    <div className="empty-content">
                      <FiClock size={48} />
                      <p>No unproductive time entries found</p>
                      <button className="text-btn" onClick={openTimer}>Start Timer</button>
                    </div>
                  </div>
                </td>
              </tr>
            ) : (
              paginatedData.map((item) => (
                <tr key={item._id} className={`status-row status-${item.status}`}>
                  <td className="col-employee">
                    <div className="employee-cell">
                      <FiUser size={14} />
                      <span>{getEmployeeName(item.employee)}</span>
                    </div>
                  </td>
                  <td className="col-type">
                    <span className="type-badge">{item.type}</span>
                  </td>
                  <td className="col-start">
                    <div className="datetime-cell">
                      <span className="date">{new Date(item.startTime).toLocaleDateString()}</span>
                      <span className="time">{new Date(item.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                  </td>
                  <td className="col-end">
                    <div className="datetime-cell">
                      {item.endTime ? (
                        <>
                          <span className="date">{new Date(item.endTime).toLocaleDateString()}</span>
                          <span className="time">{new Date(item.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </>
                      ) : (
                        <span className="in-progress">In Progress</span>
                      )}
                    </div>
                  </td>
                  <td className="col-hours">
                    <div className="hours-cell">
                      <strong>{formatHours(item.finalHoursLost)}</strong>
                      <span> hrs</span>
                    </div>
                  </td>
                  <td className="col-status">
                    <span className={`status-badge status-${item.status}`}>
                      {item.status === 'approved' && <FiCheckCircle size={12} />}
                      {item.status === 'pending' && <FiAlertCircle size={12} />}
                      {item.status === 'rejected' && <FiXCircle size={12} />}
                      <span>{item.status}</span>
                    </span>
                  </td>
                  <td className="col-actions">
                    <div className="actions-cell">
                      <button 
                        className="view-btn"
                        onClick={() => openDetails(item._id)}
                        title="View Details"
                      >
                        <FiEye size={14} /> View
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {!loading && processedData.length > 0 && (
        <div className="pagination">
          <div className="pagination-info">
            Showing {((currentPage - 1) * recordsPerPage) + 1} - {Math.min(currentPage * recordsPerPage, processedData.length)} of {processedData.length} entries
          </div>
          <div className="pagination-controls">
            <button disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)}>
              Previous
            </button>
            <span className="page-number">{currentPage} / {totalPages}</span>
            <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)}>
              Next
            </button>
          </div>
        </div>
      )}

      {topEmployees.length > 0 && (
        <div className="insights-section">
          <div className="insights-header">
            <h3>📊 Top Contributors to Unproductive Time</h3>
            <p>Focus areas for performance improvement</p>
          </div>
          <div className="top-employees">
            {topEmployees.map((emp, idx) => (
              <div key={emp.name} className="employee-rank">
                <div className="rank-number">#{idx + 1}</div>
                <div className="rank-info">
                  <div className="rank-name">{emp.name}</div>
                  <div className="rank-stats">
                    <span className="rank-hours">{formatHours(emp.hours)} hours</span>
                    <span className="rank-count">{emp.count} entries</span>
                  </div>
                </div>
                <div className="rank-progress">
                  <div 
                    className="progress-fill"
                    style={{ width: `${Math.min((emp.hours / analytics?.totalHours || 1) * 100, 100)}` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}