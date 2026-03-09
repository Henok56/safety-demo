/* eslint-disable */
import React, { useState, useEffect } from "react";
import { 
  FiTrash2, FiEdit3, FiSearch, FiDownload, FiCalendar, FiChevronLeft, FiChevronRight 
} from "react-icons/fi";
import {
  getLeadershipRecords,
  createLeadershipRecord,
  updateLeadershipRecord,
  deleteLeadershipRecord,
  getTopicsByCategory
} from "../../api/talentApi";

import EmployeeSelector from "../../components/EmployeeSelector";
import "../../styles/LeadershipDevelopmentTab.css";

const initialFormState = {
  employee: "",
  userid: "",              
  firstName: "",           
  lastName: "",            
  costCenter: "",          
  department: "",          
  groomedForPosition: "",  
  trainingType: "",        
  preferredSchedule: "",   
  remark: "pending",
};

export default function LeadershipDevelopmentTab() {
  const [topics, setTopics] = useState([]);
  const [savedRecords, setSavedRecords] = useState([]);
  const [formData, setFormData] = useState(initialFormState);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState({ type: "", message: "" });
  
  // --- NEW STATES FOR FILTERING & PAGINATION ---
  const [searchTerm, setSearchTerm] = useState("");
  const [dateFilter, setDateFilter] = useState({ from: "", to: "" });
  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 5;

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      const [topicRes, recordRes] = await Promise.all([
        getTopicsByCategory("Leadership Development"),
        getLeadershipRecords()
      ]);
      setTopics(topicRes.data.data || []);
      setSavedRecords(recordRes.data.data || []);
    } catch (err) {
      console.error("Fetch error:", err);
    }
  };

  const handleEmployeeAutoFill = (data) => {
    if (data) {
      setFormData(prev => ({
        ...prev,
        employee: data.employeeId,
        firstName: data.firstName,
        lastName: data.lastName,
        userid: data.staffId,
        costCenter: data.costCenter,
        department: data.department || ""
      }));
    } else {
      setFormData(initialFormState);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        employee: formData.employee,
        costCenter: formData.costCenter,
        department: formData.department,
        groomedForPosition: formData.groomedForPosition,
        trainingType: formData.trainingType, 
        preferredSchedule: formData.preferredSchedule,
        remark: formData.remark
      };

      if (editingId) {
        await updateLeadershipRecord(editingId, payload);
        setStatus({ type: "success", message: "✅ Plan updated successfully!" });
      } else {
        await createLeadershipRecord(payload);
        setStatus({ type: "success", message: "✅ Leadership plan saved!" });
      }

      setFormData(initialFormState);
      setEditingId(null);
      loadInitialData();
    } catch (err) {
      const msg = err.response?.data?.message || "Validation Failed";
      setStatus({ type: "error", message: `❌ ${msg}` });
    } finally {
      setLoading(false);
      setTimeout(() => setStatus({ type: "", message: "" }), 4000);
    }
  };

  const handleEdit = (item) => {
    setEditingId(item._id);
    setFormData({
      employee: item.employee?._id || "",
      userid: item.employee?.userAccount?.userid || "",
      firstName: item.employee?.userAccount?.firstname || "",
      lastName: item.employee?.userAccount?.lastname || "",
      costCenter: item.costCenter || "",
      department: item.department || "",
      groomedForPosition: item.groomedForPosition || "",
      trainingType: item.trainingType?._id || "", 
      preferredSchedule: item.preferredSchedule ? item.preferredSchedule.split('T')[0] : "",
      remark: item.remark || "pending"
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this record?")) return;
    try {
      await deleteLeadershipRecord(id);
      loadInitialData();
      setStatus({ type: "success", message: "🗑️ Record removed" });
    } catch (err) {
      setStatus({ type: "error", message: "❌ Delete failed" });
    }
  };

  // --- CSV EXPORT LOGIC ---
  const exportToCSV = () => {
    const headers = ["Staff ID,Candidate,Target Position,Topic,Schedule,Status"];
    const rows = filteredRecords.map(r => [
      r.employee?.userAccount?.userid || "N/A",
      `${r.employee?.userAccount?.firstname} ${r.employee?.userAccount?.lastname}`,
      r.groomedForPosition,
      r.trainingType?.topic,
      r.preferredSchedule ? new Date(r.preferredSchedule).toLocaleDateString() : "TBD",
      r.remark
    ].join(","));

    const csvContent = "data:text/csv;charset=utf-8," + [headers, ...rows].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "leadership_development_records.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // --- FILTERING, SORTING & PAGINATION LOGIC ---
  const filteredRecords = savedRecords
    .filter(r => {
      // Search logic
      const matchesSearch = 
        r.employee?.userAccount?.firstname?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.employee?.userAccount?.userid?.includes(searchTerm);
      
      // Date filter logic
      const recordDate = r.preferredSchedule ? new Date(r.preferredSchedule) : null;
      const from = dateFilter.from ? new Date(dateFilter.from) : null;
      const to = dateFilter.to ? new Date(dateFilter.to) : null;

      let matchesDate = true;
      if (from && recordDate < from) matchesDate = false;
      if (to && recordDate > to) matchesDate = false;

      return matchesSearch && matchesDate;
    })
    // Sort by most recent (using preferredSchedule or createdAt if available)
    .sort((a, b) => new Date(b.preferredSchedule) - new Date(a.preferredSchedule));

  const totalPages = Math.ceil(filteredRecords.length / recordsPerPage);
  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
  const currentRecords = filteredRecords.slice(indexOfFirstRecord, indexOfLastRecord);

  return (
    <div className="tab-content-container">
      {status.message && <div className={`status-alert ${status.type}`}>{status.message}</div>}

      <form onSubmit={handleSubmit} className="talent-form">
        <h3 className="form-title">{editingId ? "Modify Leadership Plan" : "Create Leadership Plan"}</h3>

        <div className="form-grid-row">
          <div className="talent-form-row">
            <EmployeeSelector onEmployeeSelected={handleEmployeeAutoFill} selectedId={formData.employee} />
          </div>
          <div className="talent-form-row">
            <label>User ID</label>
            <input type="text" value={formData.userid} readOnly className="readonly-input" />
          </div>
        </div>

        <div className="form-grid-row">
          <div className="talent-form-row">
            <label>Groomed For Position</label>
            <input 
              type="text" 
              value={formData.groomedForPosition} 
              onChange={(e) => setFormData({...formData, groomedForPosition: e.target.value})} 
              placeholder="e.g. Senior Manager"
              required 
            />
          </div>
          <div className="talent-form-row">
            <label>Proposed Training (Topic)</label>
            <select 
              value={formData.trainingType} 
              onChange={(e) => setFormData({...formData, trainingType: e.target.value})} 
              required
            >
              <option value="">-- Select Topic --</option>
              {topics.map(t => (
                <option key={t._id} value={t._id}>{t.topic}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="form-grid-row">
          <div className="talent-form-row">
            <label>Schedule Date</label>
            <input 
                type="date" 
                value={formData.preferredSchedule} 
                onChange={(e) => setFormData({...formData, preferredSchedule: e.target.value})} 
            />
          </div>
          <div className="talent-form-row">
            <label>Status</label>
            <select value={formData.remark} onChange={(e) => setFormData({...formData, remark: e.target.value})}>
              <option value="pending">Pending</option>
              <option value="taken">Completed</option>
            </select>
          </div>
        </div>

        <div className="form-action-group">
          <button type="submit" className="talent-form-submit" disabled={loading}>
            {loading ? "..." : editingId ? "Update Plan" : "Save Plan"}
          </button>
          {editingId && (
            <button type="button" className="cancel-btn" onClick={() => { setEditingId(null); setFormData(initialFormState); }}>
              Cancel
            </button>
          )}
        </div>
      </form>

      {/* --- SEARCH & FILTERS SECTION --- */}
      <div className="table-controls-row">
        <div className="search-box">
          <FiSearch />
          <input 
            type="text" 
            placeholder="Search Staff ID or Name..." 
            value={searchTerm}
            onChange={(e) => {setSearchTerm(e.target.value); setCurrentPage(1);}}
          />
        </div>

        <div className="date-filters">
          <div className="date-input-group">
            <label>From:</label>
            <input 
              type="date" 
              value={dateFilter.from} 
              onChange={(e) => {setDateFilter({...dateFilter, from: e.target.value}); setCurrentPage(1);}}
            />
          </div>
          <div className="date-input-group">
            <label>To:</label>
            <input 
              type="date" 
              value={dateFilter.to} 
              onChange={(e) => {setDateFilter({...dateFilter, to: e.target.value}); setCurrentPage(1);}}
            />
          </div>
          <button className="export-btn" onClick={exportToCSV}>
            <FiDownload /> Export
          </button>
        </div>
      </div>

      <div className="talent-table-container">
        <table className="leadership-table">
          <thead>
            <tr>
              <th className="text-left">User ID</th>
              <th className="text-left">Candidate Name</th>
              <th className="text-left">Target Position</th>
              <th className="text-left">Training Topic</th>
              <th className="text-left">Schedule</th>
              <th className="text-left">Status</th>
              <th className="text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {currentRecords.length > 0 ? (
              currentRecords.map((item) => (
                <tr key={item._id}>
                  <td className="text-left">
                    <span className="userid-tag">{item.employee?.userAccount?.userid || "N/A"}</span>
                  </td>
                  <td className="text-left">
                    <span className="candidate-name">
                      {item.employee?.userAccount?.firstname} {item.employee?.userAccount?.lastname}
                    </span>
                  </td>
                  <td className="text-left">{item.groomedForPosition || "—"}</td>
                  <td className="text-left">{item.trainingType?.topic || "—"}</td>
                  <td className="text-left">
                    {item.preferredSchedule 
                      ? new Date(item.preferredSchedule).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) 
                      : "TBD"}
                  </td>
                  <td className="text-left">
                    <span className={`badge ${item.remark}`}>
                      {item.remark}
                    </span>
                  </td>
                  <td className="text-right">
                    <button className="action-icon-btn edit" title="Edit" onClick={() => handleEdit(item)}>
                      <FiEdit3 />
                    </button>
                    <button className="action-icon-btn delete" title="Delete" onClick={() => handleDelete(item._id)}>
                      <FiTrash2 />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" className="text-center" style={{ padding: "30px", color: "#999" }}>
                  No leadership development records found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* --- PAGINATION SECTION --- */}
      {totalPages > 1 && (
        <div className="pagination-container">
          <button 
            disabled={currentPage === 1} 
            onClick={() => setCurrentPage(prev => prev - 1)}
            className="pagination-btn"
          >
            <FiChevronLeft /> Prev
          </button>
          <span className="page-info">
            Page <strong>{currentPage}</strong> of {totalPages}
          </span>
          <button 
            disabled={currentPage === totalPages} 
            onClick={() => setCurrentPage(prev => prev + 1)}
            className="pagination-btn"
          >
            Next <FiChevronRight />
          </button>
        </div>
      )}
    </div>
  );
}