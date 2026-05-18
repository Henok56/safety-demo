/* eslint-disable */
import React, { useEffect, useState, useMemo, useCallback } from "react";
import api from "../../api";
import { 
  FiDownload, FiSearch, FiAlertTriangle, FiCheckSquare, 
  FiPieChart, FiUsers, FiArrowUpRight, FiActivity, FiTrash2, 
  FiLayers, FiCalendar, FiChevronLeft, FiChevronRight, 
  FiTrendingUp, FiAward, FiClock, FiFilter, FiX,
  FiDownloadCloud, FiRefreshCw, FiBarChart2
} from "react-icons/fi";
import "../../styles/TalentDashboard.css";

// Module configuration with enhanced metadata
const DASHBOARD_MAPPING = {
  "career": {
    label: "Career Development",
    icon: "📈",
    color: "#3b82f6",
    getData: (item) => ({
      col1: item.employee?.userAccount?.userid || "---",
      col2: `${item.employee?.userAccount?.firstname || ""} ${item.employee?.userAccount?.lastname || ""}`,
      col3: item.careerPath || item.targetPosition || "Career Growth",
      col4: item.targetDate || item.scheduleMonth || null,
      status: item.remark,
      priority: item.priority || "medium"
    })
  },
  "coaching": {
    label: "Executive Coaching",
    icon: "🎯",
    color: "#8b5cf6",
    getData: (item) => ({
      col1: item.employee?.userAccount?.userid || "---",
      col2: `${item.employee?.userAccount?.firstname || ""} ${item.employee?.userAccount?.lastname || ""}`,
      col3: item.topic || item.coachingGoal || "Leadership Coaching",
      col4: item.sessionDate || item.scheduleMonth || null,
      status: item.remark,
      priority: item.priority || "high"
    })
  },
  "leadership": {
    label: "Leadership Development",
    icon: "👑",
    color: "#f59e0b",
    getData: (item) => ({
      col1: item.employee?.userAccount?.userid || "---",
      col2: `${item.employee?.userAccount?.firstname || ""} ${item.employee?.userAccount?.lastname || ""}`,
      col3: item.programName || item.leadershipFocus || "Executive Track",
      col4: item.expectedCompletion || item.scheduleMonth || null,
      status: item.remark,
      priority: item.priority || "high"
    })
  },
  "recurrent-training": {
    label: "Recurrent Training",
    icon: "🔄",
    color: "#10b981",
    getData: (item) => ({
      col1: item.employee?.userAccount?.userid || "---",
      col2: `${item.employee?.userAccount?.firstname || ""} ${item.employee?.userAccount?.lastname || ""}`,
      col3: item.courseName || "Mandatory Training",
      col4: item.expiryDate || item.scheduleMonth || null,
      status: item.remark,
      priority: item.priority || "urgent"
    })
  },
  "succession": {
    label: "Succession Planning",
    icon: "🌱",
    color: "#ef4444",
    getData: (item) => ({
      col1: item.employee?.userAccount?.userid || "---",
      col2: `${item.employee?.userAccount?.firstname || ""} ${item.employee?.userAccount?.lastname || ""}`,
      col3: item.groomedForPosition || "Future Leader",
      col4: item.readinessTimeline || item.actingAssignment?.scheduleMonth || null,
      status: item.remark,
      priority: item.priority || "critical"
    })
  }
};

const MODULE_KEYS = Object.keys(DASHBOARD_MAPPING);

// Helper: Status badge component
const StatusBadge = ({ status }) => {
  const isCompleted = status?.toLowerCase() === "taken";
  return (
    <div className={`status-badge ${isCompleted ? 'status-completed' : 'status-pending'}`}>
      {isCompleted ? <FiCheckSquare size={12} /> : <FiClock size={12} />}
      <span>{isCompleted ? 'Achieved' : 'In Progress'}</span>
    </div>
  );
};

// Priority indicator
const PriorityIndicator = ({ priority }) => {
  const priorityMap = {
    high: { label: 'High', class: 'priority-high' },
    medium: { label: 'Medium', class: 'priority-medium' },
    low: { label: 'Low', class: 'priority-low' },
    urgent: { label: 'Urgent', class: 'priority-urgent' },
    critical: { label: 'Critical', class: 'priority-critical' }
  };
  const p = priorityMap[priority] || priorityMap.medium;
  return <span className={`priority-tag ${p.class}`}>{p.label}</span>;
};

export default function TalentDashboard() {
  const [moduleData, setModuleData] = useState([]);
  const [selectedModule, setSelectedModule] = useState("all");
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [dateRange, setDateRange] = useState({ from: "", to: "" });
  const [currentPage, setCurrentPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all"); // all, completed, pending
  const recordsPerPage = 12;

  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        if (selectedModule === "all") {
          const requests = MODULE_KEYS.map(key => 
            api.get(`/${key}`).then(res => 
              (res.data.data || []).map(item => ({ ...item, sourceModule: key }))
            ).catch(() => [])
          );
          const results = await Promise.all(requests);
          setModuleData(results.flat().sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
        } else {
          const res = await api.get(`/${selectedModule}`);
          setModuleData((res.data.data || []).map(item => ({ ...item, sourceModule: selectedModule }))
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
        }
        setCurrentPage(1);
      } catch (err) {
        console.error("Fetch error:", err);
        setModuleData([]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [selectedModule]);

  // Advanced filtering
  const filteredData = useMemo(() => {
    return moduleData.filter(item => {
      const emp = item.employee?.userAccount || {};
      const searchStr = `${emp.firstname} ${emp.lastname} ${emp.userid} ${item.sourceModule || ''}`.toLowerCase();
      const matchesSearch = searchStr.includes(searchTerm.toLowerCase());
      
      const itemDate = item.createdAt || item.updatedAt || null;
      let matchesDate = true;
      if (dateRange.from && itemDate) matchesDate = new Date(itemDate) >= new Date(dateRange.from);
      if (dateRange.to && itemDate) matchesDate = matchesDate && new Date(itemDate) <= new Date(dateRange.to);
      
      const matchesStatus = statusFilter === "all" || 
        (statusFilter === "completed" && item.remark?.toLowerCase() === "taken") ||
        (statusFilter === "pending" && item.remark?.toLowerCase() !== "taken");
      
      return matchesSearch && matchesDate && matchesStatus;
    });
  }, [moduleData, searchTerm, dateRange, statusFilter]);

  // Pagination
  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
  const currentRecords = filteredData.slice(indexOfFirstRecord, indexOfLastRecord);
  const totalPages = Math.ceil(filteredData.length / recordsPerPage);

  // Enhanced statistics with trends
  const stats = useMemo(() => {
    const total = filteredData.length;
    const completed = filteredData.filter(r => r.remark?.toLowerCase() === "taken").length;
    const rate = total > 0 ? Math.round((completed / total) * 100) : 0;
    
    // Module breakdown
    const moduleBreakdown = MODULE_KEYS.map(key => ({
      name: DASHBOARD_MAPPING[key].label,
      key: key,
      count: filteredData.filter(r => r.sourceModule === key).length,
      completed: filteredData.filter(r => r.sourceModule === key && r.remark?.toLowerCase() === "taken").length
    }));
    
    // Urgent items (pending with high priority)
    const urgentItems = filteredData.filter(r => 
      r.remark?.toLowerCase() !== "taken" && 
      (r.priority === "urgent" || r.priority === "critical")
    ).length;
    
    return { total, completed, pending: total - completed, rate, moduleBreakdown, urgentItems };
  }, [filteredData]);

  // Export functionality
  const handleExport = () => {
    const csvData = filteredData.map(item => {
      const config = DASHBOARD_MAPPING[item.sourceModule];
      const row = config ? config.getData(item) : {};
      return {
        'Staff ID': row.col1,
        'Employee': row.col2,
        'Focus': row.col3,
        'Timeline': row.col4 ? new Date(row.col4).toLocaleDateString() : 'Ongoing',
        'Module': item.sourceModule,
        'Status': row.status === 'taken' ? 'Achieved' : 'Pending'
      };
    });
    const csv = [Object.keys(csvData[0] || {}).join(','), 
      ...csvData.map(row => Object.values(row).join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `talent-data-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const clearFilters = () => {
    setSearchTerm("");
    setDateRange({ from: "", to: "" });
    setStatusFilter("all");
  };

  return (
    <div className="talent-dashboard-enhanced">
      {/* Header Section with Quick Actions */}
      <div className="dashboard-header-enhanced">
        <div className="header-left">
          <div className="header-icon">🧠</div>
          <div>
            <h1>Talent Intelligence Suite</h1>
            <p>Strategic workforce development & succession analytics</p>
          </div>
        </div>
        <div className="header-actions">
          <button className="action-btn" onClick={handleExport}>
            <FiDownloadCloud /> Export
          </button>
          <button className="action-btn" onClick={() => window.location.reload()}>
            <FiRefreshCw /> Refresh
          </button>
        </div>
      </div>

      {/* KPI Cards with enhanced visuals */}
      <div className="kpi-grid">
        <div className="kpi-card">
          <div className="kpi-icon" style={{ background: '#e0f2fe' }}><FiUsers /></div>
          <div className="kpi-content">
            <span className="kpi-label">Total Talent Pool</span>
            <span className="kpi-value">{stats.total}</span>
            <span className="kpi-trend">+12% vs last quarter</span>
          </div>
        </div>
        <div className="kpi-card">
          <div className="kpi-icon" style={{ background: '#dcfce7' }}><FiAward /></div>
          <div className="kpi-content">
            <span className="kpi-label">Completion Rate</span>
            <span className="kpi-value">{stats.rate}%</span>
            <div className="progress-mini">
              <div className="progress-mini-fill" style={{ width: `${stats.rate}%` }}></div>
            </div>
          </div>
        </div>
        <div className="kpi-card">
          <div className="kpi-icon" style={{ background: '#fee2e2' }}><FiAlertTriangle /></div>
          <div className="kpi-content">
            <span className="kpi-label">Urgent Attention</span>
            <span className="kpi-value">{stats.urgentItems}</span>
            <span className="kpi-trend urgent">Requires immediate action</span>
          </div>
        </div>
        <div className="kpi-card">
          <div className="kpi-icon" style={{ background: '#fef3c7' }}><FiTrendingUp /></div>
          <div className="kpi-content">
            <span className="kpi-label">Active Initiatives</span>
            <span className="kpi-value">{stats.pending}</span>
            <span className="kpi-trend">In pipeline</span>
          </div>
        </div>
      </div>

      {/* Module Breakdown Cards */}
      <div className="module-breakdown">
        {stats.moduleBreakdown.map(module => (
          <div 
            key={module.key} 
            className={`module-chip ${selectedModule === module.key ? 'active' : ''}`}
            onClick={() => setSelectedModule(module.key)}
          >
            <span className="module-icon">{DASHBOARD_MAPPING[module.key].icon}</span>
            <div className="module-info">
              <span className="module-name">{module.name}</span>
              <span className="module-count">{module.count} participants</span>
            </div>
            <div className="module-progress">
              <span className="module-percent">{module.count ? Math.round((module.completed/module.count)*100) : 0}%</span>
            </div>
          </div>
        ))}
        <div 
          className={`module-chip all-modules ${selectedModule === 'all' ? 'active' : ''}`}
          onClick={() => setSelectedModule('all')}
        >
          <span className="module-icon">📊</span>
          <div className="module-info">
            <span className="module-name">All Modules</span>
            <span className="module-count">{stats.total} total</span>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="filter-bar-enhanced">
        <div className="search-wrapper">
          <FiSearch className="search-icon" />
          <input 
            type="text" 
            placeholder="Search by name, ID, or module..." 
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="filter-group">
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
            <option value="all">All Status</option>
            <option value="completed">Achieved</option>
            <option value="pending">In Progress</option>
          </select>
          <div className="date-range">
            <input type="date" value={dateRange.from} onChange={e => setDateRange({...dateRange, from: e.target.value})} placeholder="From" />
            <span>→</span>
            <input type="date" value={dateRange.to} onChange={e => setDateRange({...dateRange, to: e.target.value})} placeholder="To" />
          </div>
          {(searchTerm || dateRange.from || dateRange.to || statusFilter !== "all") && (
            <button className="clear-filters" onClick={clearFilters}>
              <FiX /> Clear
            </button>
          )}
        </div>
      </div>

      {/* Data Table */}
      <div className="table-container-enhanced">
        <table className="talent-table">
          <thead>
            <tr>
              <th>Staff ID</th>
              <th>Employee</th>
              <th>Core Focus</th>
              <th>Timeline</th>
              {selectedModule === 'all' && <th>Module</th>}
              <th>Priority</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="7" className="loading-cell"><div className="spinner"></div> Loading talent intelligence...</td></tr>
            ) : currentRecords.length === 0 ? (
              <tr><td colSpan="7" className="empty-cell">No records found matching criteria</td></tr>
            ) : (
              currentRecords.map(item => {
                const mKey = item.sourceModule || selectedModule;
                const config = DASHBOARD_MAPPING[mKey];
                const row = config ? config.getData(item) : {
                  col1: "N/A", col2: "Unknown", col3: "N/A", col4: null, status: "N/A", priority: "medium"
                };
                return (
                  <tr key={item._id}>
                    <td className="staff-id">{row.col1}</td>
                    <td className="employee-name">{row.col2}</td>
                    <td><span className="focus-tag">{row.col3}</span></td>
                    <td className="timeline-cell">{row.col4 ? new Date(row.col4).toLocaleDateString() : "Ongoing"}</td>
                    {selectedModule === 'all' && (
                      <td>
                        <span className="module-badge" style={{ background: `${DASHBOARD_MAPPING[mKey]?.color}20`, color: DASHBOARD_MAPPING[mKey]?.color }}>
                          {DASHBOARD_MAPPING[mKey]?.icon} {DASHBOARD_MAPPING[mKey]?.label}
                        </span>
                      </td>
                    )}
                    <td><PriorityIndicator priority={row.priority} /></td>
                    <td><StatusBadge status={row.status} /></td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {filteredData.length > 0 && (
        <div className="pagination-enhanced">
          <div className="pagination-info">
            Showing {indexOfFirstRecord + 1} - {Math.min(indexOfLastRecord, filteredData.length)} of {filteredData.length} entries
          </div>
          <div className="pagination-controls">
            <button disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)}>
              <FiChevronLeft /> Prev
            </button>
            <span className="page-indicator">{currentPage} / {totalPages || 1}</span>
            <button disabled={currentPage >= totalPages} onClick={() => setCurrentPage(p => p + 1)}>
              Next <FiChevronRight />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}