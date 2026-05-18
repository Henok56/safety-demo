import React, { useEffect, useMemo, useState } from "react";
import api from "../../api";
import cultureComplianceApi from "../../api/CultureComplianceApi";
import { 
  FiUsers, FiAward, FiAlertCircle, FiTrendingUp, FiTrendingDown,
  FiCalendar, FiFilter, FiDownload, FiEdit2, FiTrash2, FiSave,
  FiX, FiRefreshCw, FiChevronLeft, FiChevronRight, FiUser,
  FiBarChart2, FiCheckCircle, FiPlus, FiSearch, FiStar,
  FiClock, FiActivity, FiPieChart, FiTarget, FiZap
} from "react-icons/fi";
import "../../styles/CultureCompliance.css";

const ASPECTS = [
  "teamwork", "respect", "discipline", "grooming", 
  "appearance", "bureaucracy", "indifference"
];

const ASPECT_LABELS = {
  teamwork: "Teamwork", 
  respect: "Respect", 
  discipline: "Discipline",
  grooming: "Grooming", 
  appearance: "Appearance", 
  bureaucracy: "Bureaucracy", 
  indifference: "Indifference"
};

const ASPECT_ICONS = {
  teamwork: "🤝",
  respect: "🙏",
  discipline: "📋",
  grooming: "💇",
  appearance: "👔",
  bureaucracy: "📊",
  indifference: "😐"
};

const emptyAspects = () =>
  ASPECTS.reduce((acc, key) => {
    acc[key] = { score: "", comment: "" };
    return acc;
  }, {});

const getName = (user) => {
  if (!user) return "System";
  return `${user?.firstname || ""} ${user?.lastname || ""}`.trim() || "Unassigned";
};

export default function CorporateCulturePage() {
  const [employees, setEmployees] = useState([]);
  const [records, setRecords] = useState([]);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState("");
  const [profile, setProfile] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState("evaluation");

  const [aspectForm, setAspectForm] = useState(emptyAspects());
  const [historyFilters, setHistoryFilters] = useState({ start: "", end: "", aspect: "" });
  const [historyPage, setHistoryPage] = useState(1);
  const PAGE_SIZE = 5;

  const [editingHistoryId, setEditingHistoryId] = useState(null);
  const [editForm, setEditForm] = useState({ score: 0, reason: "" });

  const [message, setMessage] = useState({ type: "", text: "" });
  const [loading, setLoading] = useState(true);
  const [submittingAspect, setSubmittingAspect] = useState(null);
  const [selectedQuickScore, setSelectedQuickScore] = useState(null);

  useEffect(() => { loadInitialData(); }, []);

  useEffect(() => {
    if (selectedEmployeeId && records.length > 0) {
      const record = records.find((item) => item.employee?._id === selectedEmployeeId);
      setProfile(record || null);
      setHistoryPage(1);
      setEditingHistoryId(null);
    } else if (!selectedEmployeeId) {
      setProfile(null);
    }
  }, [selectedEmployeeId, records]);

  const loadInitialData = async () => {
    setLoading(true);
    try {
      const [employeesRes, recordsRes] = await Promise.all([
        api.get("/employees"),
        cultureComplianceApi.getAllRecords(),
      ]);
      setEmployees(employeesRes.data?.data || []);
      setRecords(recordsRes?.data || recordsRes || []);
    } catch (err) {
      setMessage({ type: "error", text: "Failed to load data. Please refresh." });
      setTimeout(() => setMessage({ type: "", text: "" }), 3000);
    } finally {
      setLoading(false);
    }
  };

  const submitSingleAspect = async (aspect) => {
    if (!selectedEmployeeId) {
      setMessage({ type: "error", text: "Please select an employee first." });
      setTimeout(() => setMessage({ type: "", text: "" }), 3000);
      return;
    }
    
    if (!aspectForm[aspect].score || aspectForm[aspect].score === "") {
      setMessage({ type: "error", text: `Please enter a score for ${ASPECT_LABELS[aspect]}` });
      setTimeout(() => setMessage({ type: "", text: "" }), 3000);
      return;
    }
    
    setSubmittingAspect(aspect);
    try {
      const scoreValue = Number(aspectForm[aspect].score);
      if (isNaN(scoreValue) || scoreValue < 0 || scoreValue > 100) {
        throw new Error("Score must be between 0 and 100");
      }
      
      const response = await cultureComplianceApi.createRecordWithEntry(
        selectedEmployeeId,
        aspect,
        scoreValue,
        aspectForm[aspect].comment
      );
      
      if (response && response.success) {
        setAspectForm(prev => ({ ...prev, [aspect]: { score: "", comment: "" } }));
        await loadInitialData();
        
        setMessage({ type: "success", text: `${ASPECT_LABELS[aspect]} recorded successfully!` });
        setTimeout(() => setMessage({ type: "", text: "" }), 3000);
      }
    } catch (err) { 
      setMessage({ type: "error", text: err.response?.data?.message || err.message || "Failed to save entry." });
      setTimeout(() => setMessage({ type: "", text: "" }), 3000);
    } finally {
      setSubmittingAspect(null);
    }
  };

  const quickScore = (aspect, score) => {
    setAspectForm(prev => ({ ...prev, [aspect]: { ...prev[aspect], score: score.toString() } }));
    setSelectedQuickScore(aspect);
    setTimeout(() => setSelectedQuickScore(null), 1000);
  };

  const aspectAverages = useMemo(() => {
    if (!profile || !profile.aspectHistory?.length) return { highest: null, lowest: null, all: [] };
    const totals = profile.aspectHistory.reduce((acc, h) => {
      if (!acc[h.aspect]) acc[h.aspect] = { sum: 0, count: 0, recent: h.score };
      acc[h.aspect].sum += Number(h.score);
      acc[h.aspect].count += 1;
      acc[h.aspect].recent = h.score;
      return acc;
    }, {});
    const stats = Object.keys(totals).map(key => ({
      name: ASPECT_LABELS[key] || key,
      key: key,
      avg: totals[key].sum / totals[key].count,
      recent: totals[key].recent,
      count: totals[key].count
    })).sort((a, b) => b.avg - a.avg);
    return { highest: stats[0], lowest: stats[stats.length - 1], all: stats };
  }, [profile]);

  const filteredHistory = useMemo(() => {
    if (!profile) return [];
    let data = [...(profile.aspectHistory || [])];
    if (historyFilters.aspect) data = data.filter(h => h.aspect === historyFilters.aspect);
    if (historyFilters.start) {
      const startDate = new Date(historyFilters.start);
      startDate.setHours(0, 0, 0, 0);
      data = data.filter(h => new Date(h.recordedAt) >= startDate);
    }
    if (historyFilters.end) {
      const endDate = new Date(historyFilters.end);
      endDate.setHours(23, 59, 59, 999);
      data = data.filter(h => new Date(h.recordedAt) <= endDate);
    }
    return data.sort((a, b) => new Date(b.recordedAt) - new Date(a.recordedAt));
  }, [profile, historyFilters]);

  const totalPages = Math.ceil(filteredHistory.length / PAGE_SIZE) || 1;
  const paginatedHistory = useMemo(() => {
    const startIdx = (historyPage - 1) * PAGE_SIZE;
    return filteredHistory.slice(startIdx, startIdx + PAGE_SIZE);
  }, [filteredHistory, historyPage]);

  const exportToCSV = () => {
    if (!filteredHistory.length) {
      setMessage({ type: "error", text: "No data to export." });
      setTimeout(() => setMessage({ type: "", text: "" }), 2000);
      return;
    }
    const headers = "Aspect,Score,Reason,RecordedBy,Date\n";
    const rows = filteredHistory.map(h => 
      `${h.aspect},${h.score},"${(h.reason || "").replace(/"/g, '""')}",${getName(h.recordedBy)},${new Date(h.recordedAt).toLocaleDateString()}`
    ).join("\n");
    const blob = new Blob([headers + rows], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; 
    a.download = `Culture_Export_${getName(profile?.employee?.userAccount)}_${new Date().toISOString().split('T')[0]}.csv`; 
    a.click();
    window.URL.revokeObjectURL(url);
    setMessage({ type: "success", text: "Export completed!" });
    setTimeout(() => setMessage({ type: "", text: "" }), 2000);
  };

  const handleUpdateEntry = async (historyId) => {
    try {
      await cultureComplianceApi.updateAspectHistoryEntry(profile._id, historyId, editForm);
      setEditingHistoryId(null);
      await loadInitialData(); 
      setMessage({ type: "success", text: "Entry updated successfully!" });
      setTimeout(() => setMessage({ type: "", text: "" }), 3000);
    } catch (err) {
      setMessage({ type: "error", text: err.response?.data?.message || "Update failed." });
      setTimeout(() => setMessage({ type: "", text: "" }), 3000);
    }
  };

  const handleDeleteEntry = async (historyId) => {
    if (window.confirm("Are you sure you want to delete this record? This will affect the overall score.")) {
      try {
        await cultureComplianceApi.deleteHistoryEntry(profile._id, historyId);
        await loadInitialData();
        setMessage({ type: "success", text: "Entry deleted successfully." });
        setTimeout(() => setMessage({ type: "", text: "" }), 3000);
      } catch (err) { 
        setMessage({ type: "error", text: err.response?.data?.message || "Delete failed." });
        setTimeout(() => setMessage({ type: "", text: "" }), 3000);
      }
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      excellent: '#10b981', 
      good: '#3b82f6', 
      needs_improvement: '#f59e0b', 
      poor: '#ef4444', 
      critical: '#7f1d1d'
    };
    return colors[status] || '#64748b';
  };

  const getStatusLabel = (status) => {
    const labels = {
      excellent: '🌟 Excellent', 
      good: '👍 Good', 
      needs_improvement: '⚠️ Needs Improvement', 
      poor: '❗ Poor', 
      critical: '🔴 Critical'
    };
    return labels[status] || status || 'No Evaluation';
  };

  const getScoreColor = (score) => {
    if (score >= 80) return '#10b981';
    if (score >= 60) return '#3b82f6';
    if (score >= 40) return '#f59e0b';
    return '#ef4444';
  };

  // Filter employees by search for dropdown
  const filteredEmployees = employees.filter(emp => 
    getName(emp.userAccount).toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.department?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return (
    <div className="culture-loader">
      <div className="spinner"></div>
      <p>Loading Culture Compliance Data...</p>
    </div>
  );

  const selectedEmployee = employees.find(e => e._id === selectedEmployeeId);
  const hasProfile = profile && profile._id;

  return (
    <div className="culture-dashboard">
      {/* Header */}
      <div className="culture-header">
        <div className="header-left">
          <div className="header-icon">🎯</div>
          <div>
            <h1>Corporate Culture Ledger</h1>
            <p>Track and improve employee behavioral metrics</p>
          </div>
        </div>
        <div className="header-actions">
          <button className="refresh-btn" onClick={loadInitialData}>
            <FiRefreshCw /> Refresh
          </button>
        </div>
      </div>

      {/* Alert Message */}
      {message.text && (
        <div className={`culture-alert ${message.type}`}>
          {message.type === 'success' ? <FiCheckCircle /> : <FiAlertCircle />}
          <span>{message.text}</span>
          <button onClick={() => setMessage({ type: "", text: "" })}><FiX /></button>
        </div>
      )}

      {/* Employee Selector Section - DROPDOWN VERSION */}
      <div className="employee-selector-section">
        <div className="selector-header">
          <h3>Select Employee</h3>
          <div className="search-wrapper">
            <FiSearch />
            <input 
              type="text" 
              placeholder="Search employee by name or department..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        
        {/* Dropdown instead of grid */}
        <div className="employee-dropdown-wrapper">
          <select 
            className="employee-dropdown"
            value={selectedEmployeeId} 
            onChange={(e) => setSelectedEmployeeId(e.target.value)}
          >
            <option value="">-- Select an Employee --</option>
            {filteredEmployees.map(emp => {
              const empRecord = records.find(r => r.employee?._id === emp._id);
              return (
                <option key={emp._id} value={emp._id}>
                  {getName(emp.userAccount)} — {emp.department || 'No Department'}
                  {empRecord ? ` (Score: ${empRecord.overallScore}%)` : ' (No Record)'}
                </option>
              );
            })}
          </select>
          
          {/* Show selected employee info */}
          {selectedEmployeeId && selectedEmployee && (
            <div className="selected-employee-info">
              <div className="selected-avatar">
                {getName(selectedEmployee.userAccount).charAt(0)}
              </div>
              <div className="selected-details">
                <div className="selected-name">{getName(selectedEmployee.userAccount)}</div>
                <div className="selected-meta">
                  {selectedEmployee.department || 'No Department'} • {selectedEmployee.currentPosition || 'No Position'}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {!selectedEmployeeId ? (
        <div className="empty-state">
          <div className="empty-content">
            <FiUsers size={64} />
            <h3>No Employee Selected</h3>
            <p>Please select an employee from the dropdown above to view compliance metrics.</p>
          </div>
        </div>
      ) : (
        <>
          {/* Profile Summary */}
          <div className="profile-summary">
            <div className="employee-info">
              <div className="employee-avatar">
                <FiUser size={32} />
              </div>
              <div className="employee-details">
                <h2>{getName(selectedEmployee?.userAccount)}</h2>
                <div className="employee-meta">
                  <span className="department-badge">
                    {selectedEmployee?.department || 'No Department'}
                  </span>
                  <span className="position-badge">
                    {selectedEmployee?.currentPosition || 'No Position'}
                  </span>
                </div>
              </div>
            </div>
            <div className="score-section">
              <div className="overall-score">
                <span className="score-label">Overall Score</span>
                <div className="score-ring">
                  <span className="score-value">{profile?.overallScore ?? 0}%</span>
                </div>
              </div>
              {hasProfile && (
                <div 
                  className="status-badge" 
                  style={{ background: `${getStatusColor(profile?.status)}15`, 
                           borderLeftColor: getStatusColor(profile?.status),
                           color: getStatusColor(profile?.status) }}
                >
                  {getStatusLabel(profile?.status)}
                </div>
              )}
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="view-tabs">
            <button 
              className={`tab-btn ${viewMode === 'evaluation' ? 'active' : ''}`}
              onClick={() => setViewMode('evaluation')}
            >
              <FiStar /> New Evaluation
            </button>
            <button 
              className={`tab-btn ${viewMode === 'history' ? 'active' : ''}`}
              onClick={() => setViewMode('history')}
            >
              <FiClock /> History Ledger
            </button>
            <button 
              className={`tab-btn ${viewMode === 'analytics' ? 'active' : ''}`}
              onClick={() => setViewMode('analytics')}
            >
              <FiPieChart /> Analytics
            </button>
          </div>

          {/* Evaluation View */}
          {viewMode === 'evaluation' && (
            <div className="aspects-section">
              <div className="section-header">
                <h3>Record New Evaluation</h3>
                <p>Rate employee across 7 culture dimensions (0-100%)</p>
              </div>
              <div className="aspects-grid">
                {ASPECTS.map(aspect => (
                  <div key={aspect} className="aspect-card">
                    <div className="aspect-header">
                      <span className="aspect-icon">{ASPECT_ICONS[aspect]}</span>
                      <span className="aspect-title">{ASPECT_LABELS[aspect]}</span>
                      {!hasProfile && <span className="new-badge">First</span>}
                    </div>
                    <div className="aspect-body">
                      <div className="score-input-group">
                        <input 
                          type="range" 
                          min="0" 
                          max="100" 
                          step="5"
                          value={aspectForm[aspect].score || 0} 
                          onChange={e => setAspectForm({...aspectForm, [aspect]: {...aspectForm[aspect], score: e.target.value}})} 
                          className="score-slider"
                          style={{ background: `linear-gradient(90deg, ${getScoreColor(aspectForm[aspect].score || 0)} 0%, ${getScoreColor(aspectForm[aspect].score || 0)} ${aspectForm[aspect].score || 0}%, #e2e8f0 ${aspectForm[aspect].score || 0}%)` }}
                        />
                        <div className="quick-score-buttons">
                          {[0, 25, 50, 75, 100].map(s => (
                            <button 
                              key={s} 
                              className={`quick-score-btn ${selectedQuickScore === aspect && aspectForm[aspect].score == s ? 'active' : ''}`}
                              onClick={() => quickScore(aspect, s)}
                            >
                              {s}%
                            </button>
                          ))}
                        </div>
                        <div className="score-value-display">
                          <span className="score-number">{aspectForm[aspect].score || 0}</span>
                          <span className="score-unit">%</span>
                        </div>
                      </div>
                      <textarea 
                        placeholder="Add context or comments (optional)..."
                        value={aspectForm[aspect].comment} 
                        onChange={e => setAspectForm({...aspectForm, [aspect]: {...aspectForm[aspect], comment: e.target.value}})} 
                        rows={2}
                      />
                    </div>
                    <button 
                      className="log-btn"
                      onClick={() => submitSingleAspect(aspect)}
                      disabled={submittingAspect === aspect || !aspectForm[aspect].score}
                    >
                      {submittingAspect === aspect ? (
                        <div className="btn-spinner"></div>
                      ) : (
                        <>📝 Log {ASPECT_LABELS[aspect]}</>
                      )}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* History View */}
          {viewMode === 'history' && hasProfile && (
            <div className="history-section">
              <div className="section-header">
                <h3>Compliance History Ledger</h3>
                <p>Complete audit trail of all evaluations</p>
              </div>

              <div className="history-controls">
                <div className="filter-group">
                  <FiCalendar />
                  <input 
                    type="date" 
                    value={historyFilters.start} 
                    onChange={e => setHistoryFilters({...historyFilters, start: e.target.value})}
                    placeholder="From"
                  />
                  <span>→</span>
                  <input 
                    type="date" 
                    value={historyFilters.end} 
                    onChange={e => setHistoryFilters({...historyFilters, end: e.target.value})}
                    placeholder="To"
                  />
                  <select value={historyFilters.aspect} onChange={e => setHistoryFilters({...historyFilters, aspect: e.target.value})}>
                    <option value="">All Aspects</option>
                    {ASPECTS.map(a => <option key={a} value={a}>{ASPECT_LABELS[a]}</option>)}
                  </select>
                </div>
                <button className="export-btn" onClick={exportToCSV} disabled={filteredHistory.length === 0}>
                  <FiDownload /> Export CSV
                </button>
              </div>

              <div className="table-wrapper">
                <table className="history-table">
                  <thead>
                    <tr>
                      <th>Aspect</th>
                      <th>Score</th>
                      <th>Reason</th>
                      <th>Recorded By</th>
                      <th>Date</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedHistory.length === 0 ? (
                      <tr className="empty-row">
                        <td colSpan="6">
                          <div className="empty-history">
                            <FiBarChart2 size={32} />
                            <p>No history records found. Start by logging evaluations above.</p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      paginatedHistory.map(entry => {
                        const isEditing = editingHistoryId === entry._id;
                        return (
                          <tr key={entry._id} className={isEditing ? "editing-row" : ""}>
                            <td className="aspect-cell">
                              <span className="aspect-name">{ASPECT_LABELS[entry.aspect] || entry.aspect}</span>
                            </td>
                            <td className="score-cell">
                              {isEditing ? (
                                <input 
                                  type="number" 
                                  className="edit-input"
                                  value={editForm.score} 
                                  onChange={e => setEditForm({...editForm, score: e.target.value})}
                                />
                              ) : (
                                <span className={`score-badge ${entry.score >= 70 ? 'high' : entry.score >= 50 ? 'medium' : 'low'}`}>
                                  {entry.score}%
                                </span>
                              )}
                            </td>
                            <td className="reason-cell">
                              {isEditing ? (
                                <textarea 
                                  className="edit-textarea"
                                  value={editForm.reason} 
                                  onChange={e => setEditForm({...editForm, reason: e.target.value})}
                                  rows={2}
                                />
                              ) : (
                                <span className="reason-text">{entry.reason || '—'}</span>
                              )}
                            </td>
                            <td className="recorded-cell">{getName(entry.recordedBy)}</td>
                            <td className="date-cell">{new Date(entry.recordedAt).toLocaleDateString()}</td>
                            <td className="actions-cell">
                              {isEditing ? (
                                <div className="action-buttons">
                                  <button className="save-btn" onClick={() => handleUpdateEntry(entry._id)}>
                                    <FiSave /> Save
                                  </button>
                                  <button className="cancel-btn" onClick={() => setEditingHistoryId(null)}>
                                    <FiX /> Cancel
                                  </button>
                                </div>
                              ) : (
                                <div className="action-buttons">
                                  <button 
                                    className="edit-btn" 
                                    onClick={() => { 
                                      setEditingHistoryId(entry._id); 
                                      setEditForm({score: entry.score, reason: entry.reason || ""}); 
                                    }}
                                  >
                                    <FiEdit2 /> Edit
                                  </button>
                                  <button className="delete-btn" onClick={() => handleDeleteEntry(entry._id)}>
                                    <FiTrash2 /> Delete
                                  </button>
                                </div>
                              )}
                              </td>
                            </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>

              {filteredHistory.length > 0 && (
                <div className="pagination">
                  <div className="pagination-info">
                    Showing {((historyPage - 1) * PAGE_SIZE) + 1} - {Math.min(historyPage * PAGE_SIZE, filteredHistory.length)} of {filteredHistory.length} entries
                  </div>
                  <div className="pagination-controls">
                    <button disabled={historyPage === 1} onClick={() => setHistoryPage(p => p - 1)}>
                      <FiChevronLeft /> Previous
                    </button>
                    <span className="page-number">{historyPage} / {totalPages}</span>
                    <button disabled={historyPage === totalPages} onClick={() => setHistoryPage(p => p + 1)}>
                      Next <FiChevronRight />
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Analytics View */}
          {viewMode === 'analytics' && hasProfile && (
            <div className="analytics-section">
              <div className="section-header">
                <h3>Performance Analytics</h3>
                <p>Insights and trends based on evaluation history</p>
              </div>

              <div className="analytics-grid">
                {aspectAverages.all.map(aspect => (
                  <div key={aspect.key} className="analytics-card">
                    <div className="analytics-header">
                      <span className="aspect-icon">{ASPECT_ICONS[aspect.key]}</span>
                      <div>
                        <div className="analytics-title">{aspect.name}</div>
                        <div className="analytics-subtitle">{aspect.count} evaluations</div>
                      </div>
                    </div>
                    <div className="analytics-stats">
                      <div className="stat-item">
                        <span className="stat-label">Average</span>
                        <span className="stat-value" style={{ color: getScoreColor(aspect.avg) }}>
                          {aspect.avg.toFixed(1)}%
                        </span>
                      </div>
                      <div className="stat-item">
                        <span className="stat-label">Latest</span>
                        <span className="stat-value" style={{ color: getScoreColor(aspect.recent) }}>
                          {aspect.recent}%
                        </span>
                      </div>
                      <div className="stat-item">
                        <span className="stat-label">Trend</span>
                        <span className="stat-value">
                          {aspect.recent > aspect.avg ? '📈' : aspect.recent < aspect.avg ? '📉' : '➡️'}
                        </span>
                      </div>
                    </div>
                    <div className="progress-bar-container">
                      <div 
                        className="progress-bar-fill"
                        style={{ width: `${aspect.avg}%`, background: getScoreColor(aspect.avg) }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Summary Stats */}
              <div className="summary-stats">
                <div className="summary-card">
                  <FiTarget />
                  <div>
                    <div className="summary-label">Overall Average</div>
                    <div className="summary-value">{aspectAverages.all.reduce((acc, a) => acc + a.avg, 0) / 7}%</div>
                  </div>
                </div>
                <div className="summary-card">
                  <FiZap />
                  <div>
                    <div className="summary-label">Total Evaluations</div>
                    <div className="summary-value">{profile.aspectHistory?.length || 0}</div>
                  </div>
                </div>
                <div className="summary-card">
                  <FiTrendingUp />
                  <div>
                    <div className="summary-label">Best Aspect</div>
                    <div className="summary-value">{aspectAverages.highest?.name || '—'}</div>
                  </div>
                </div>
                <div className="summary-card">
                  <FiTrendingDown />
                  <div>
                    <div className="summary-label">Needs Focus</div>
                    <div className="summary-value">{aspectAverages.lowest?.name || '—'}</div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}