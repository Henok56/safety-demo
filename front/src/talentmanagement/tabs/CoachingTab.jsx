/* eslint-disable */
import React, { useState, useEffect } from "react";
import { FiTrash2, FiEdit3, FiSearch, FiChevronLeft, FiChevronRight, FiCalendar } from "react-icons/fi";
import {
  getCoachingRecords,
  createCoachingRecord,
  updateCoachingRecord,
  deleteCoachingRecord,
  getTopicsByCategory
} from "../../api/talentApi";

import EmployeeSelector from "../../components/EmployeeSelector";
import "../../styles/CoachingTab.css";

const initialFormState = {
  employee: "",       
  userid: "",         
  firstName: "",      
  lastName: "",       
  costCenter: "",     
  category: "Coaching",
  trainingType: "",     
  proposedPLLevel: "",  
  coachingScheduleStartMonth: "", 
  coachingScheduleEndMonth: "",   
  remark: "pending",
};

export default function CoachingTab() {
  const [topics, setTopics] = useState([]);
  const [savedRecords, setSavedRecords] = useState([]);
  const [formData, setFormData] = useState(initialFormState);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState({ type: "", message: "" });
  
  // Filtering & Pagination State
  const [searchTerm, setSearchTerm] = useState("");
  const [dateFilter, setDateFilter] = useState({ from: "", to: "" });
  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 5;

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [topicRes, recordRes] = await Promise.all([
        getTopicsByCategory("Coaching"),
        getCoachingRecords()
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
        userid: data.staffId,
        firstName: data.firstName,
        lastName: data.lastName,
        costCenter: data.costCenter
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
        trainingType: formData.trainingType, 
        proposedPLLevel: formData.proposedPLLevel,
        coachingScheduleStartMonth: formData.coachingScheduleStartMonth,
        coachingScheduleEndMonth: formData.coachingScheduleEndMonth,
        remark: formData.remark,
        costCenter: formData.costCenter
      };

      if (editingId) await updateCoachingRecord(editingId, payload);
      else await createCoachingRecord(payload);

      setStatus({ type: "success", message: "✅ Saved Successfully!" });
      setFormData(initialFormState);
      setEditingId(null);
      await loadData(); 
    } catch (err) {
      setStatus({ type: "error", message: "❌ Save failed." });
    } finally { 
      setLoading(false); 
      setTimeout(() => setStatus({ type: "", message: "" }), 3000); 
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
      trainingType: item.trainingType?._id || "", 
      proposedPLLevel: item.proposedPLLevel || "",
      coachingScheduleStartMonth: item.coachingScheduleStartMonth?.split('T')[0] || "",
      coachingScheduleEndMonth: item.coachingScheduleEndMonth?.split('T')[0] || "", 
      remark: item.remark || "pending"
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "—";
    const d = new Date(dateStr);
    return isNaN(d.getTime()) ? "—" : d.toLocaleDateString('en-GB');
  };

  // --- FILTERING & SORTING LOGIC ---
  const filteredRecords = savedRecords
    .filter(r => {
      // 1. Search Text Filter
      const matchesSearch = 
        r.employee?.userAccount?.firstname?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.employee?.userAccount?.lastname?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.employee?.userAccount?.userid?.includes(searchTerm);

      // 2. Date Range Filter
      const recordDate = r.coachingScheduleStartMonth ? new Date(r.coachingScheduleStartMonth) : null;
      const fromDate = dateFilter.from ? new Date(dateFilter.from) : null;
      const toDate = dateFilter.to ? new Date(dateFilter.to) : null;

      let matchesDate = true;
      if (recordDate) {
        if (fromDate && recordDate < fromDate) matchesDate = false;
        if (toDate && recordDate > toDate) matchesDate = false;
      }

      return matchesSearch && matchesDate;
    })
    // 3. Sorting: Recent records on top
    .sort((a, b) => new Date(b.coachingScheduleStartMonth) - new Date(a.coachingScheduleStartMonth));

  // --- PAGINATION CALCULATION ---
  const totalPages = Math.ceil(filteredRecords.length / recordsPerPage);
  const currentRecords = filteredRecords.slice(
    (currentPage - 1) * recordsPerPage, 
    currentPage * recordsPerPage
  );

  return (
    <div className="tab-content-container">
      {status.message && <div className={`status-alert ${status.type}`}>{status.message}</div>}

      <form onSubmit={handleSubmit} className="talent-form">
        <h3 className="form-title">{editingId ? "Modify Entry" : "New Coaching Entry"}</h3>
        
        {/* Identity & Name Rows (Same as before) */}
        <div className="form-grid-row">
          <div className="talent-form-row">
            <EmployeeSelector onEmployeeSelected={handleEmployeeAutoFill} selectedId={formData.employee} />
          </div>
          <div className="talent-form-row">
            <label>Staff ID</label>
            <input type="text" value={formData.userid} readOnly className="readonly-input" placeholder="Auto-filled" />
          </div>
        </div>

        <div className="form-grid-row">
          <div className="talent-form-row">
            <label>First Name</label>
            <input type="text" value={formData.firstName} readOnly className="readonly-input" />
          </div>
          <div className="talent-form-row">
            <label>Last Name</label>
            <input type="text" value={formData.lastName} readOnly className="readonly-input" />
          </div>
        </div>

        <div className="form-grid-row">
          <div className="talent-form-row">
            <label>Topic</label>
            <select value={formData.trainingType} onChange={(e) => setFormData({...formData, trainingType: e.target.value})} required>
              <option value="">-- Select --</option>
              {topics.map(t => <option key={t._id} value={t._id}>{t.topic}</option>)}
            </select>
          </div>
          <div className="talent-form-row">
            <label>PL Level</label>
            <input type="text" value={formData.proposedPLLevel} onChange={(e) => setFormData({...formData, proposedPLLevel: e.target.value})} required />
          </div>
        </div>

        <div className="form-grid-row">
          <div className="talent-form-row">
            <label>Start Month</label>
            <input type="date" value={formData.coachingScheduleStartMonth} onChange={(e) => setFormData({...formData, coachingScheduleStartMonth: e.target.value})} required />
          </div>
          <div className="talent-form-row">
            <label>End Month</label>
            <input type="date" value={formData.coachingScheduleEndMonth} onChange={(e) => setFormData({...formData, coachingScheduleEndMonth: e.target.value})} />
          </div>
        </div>

        <div className="form-action-group">
          <button type="submit" className="talent-form-submit" disabled={loading}>
            {loading ? "..." : editingId ? "Update" : "Save"}
          </button>
        </div>
      </form>

      {/* TABLE CONTROLS (Search & Date Filters) */}
      <div className="table-controls-row">
        <div className="search-input-wrapper">
          <FiSearch />
          <input 
            type="text" 
            placeholder="Search name or ID..." 
            value={searchTerm} 
            onChange={(e) => {setSearchTerm(e.target.value); setCurrentPage(1);}}
          />
        </div>
        
        <div className="date-filter-group">
          <FiCalendar />
          <input 
            type="date" 
            value={dateFilter.from} 
            onChange={(e) => {setDateFilter({...dateFilter, from: e.target.value}); setCurrentPage(1);}} 
            title="From Date"
          />
          <span>to</span>
          <input 
            type="date" 
            value={dateFilter.to} 
            onChange={(e) => {setDateFilter({...dateFilter, to: e.target.value}); setCurrentPage(1);}} 
            title="To Date"
          />
        </div>
      </div>

      <div className="table-section-wrapper">
        <div className="talent-table-container">
          <table className="leadership-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Employee</th>
                <th>Topic</th>
                <th>Dates</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentRecords.length > 0 ? (
                currentRecords.map(item => (
                  <tr key={item._id}>
                    <td><strong>{item.employee?.userAccount?.userid || "N/A"}</strong></td>
                    <td>{item.employee?.userAccount?.firstname} {item.employee?.userAccount?.lastname}</td>
                    <td>{item.trainingType?.topic || "—"}</td>
                    <td>{formatDate(item.coachingScheduleStartMonth)} - {formatDate(item.coachingScheduleEndMonth)}</td>
                    <td><span className={`badge ${item.remark}`}>{item.remark}</span></td>
                    <td>
                      <button className="action-icon-btn edit" onClick={() => handleEdit(item)}><FiEdit3 /></button>
                      <button className="action-icon-btn delete" onClick={() => deleteCoachingRecord(item._id).then(loadData)}><FiTrash2 /></button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan="6" style={{ textAlign: 'center', padding: '30px' }}>No records found.</td></tr>
              )}
            </tbody>
          </table>
        </div>

        {/* PAGINATION FOOTER */}
        {totalPages > 1 && (
          <div className="pagination-footer">
            <button 
              className="page-btn" 
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))} 
              disabled={currentPage === 1}
            >
              <FiChevronLeft /> Prev
            </button>
            <span className="page-info">Page {currentPage} of {totalPages}</span>
            <button 
              className="page-btn" 
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} 
              disabled={currentPage === totalPages}
            >
              Next <FiChevronRight />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}