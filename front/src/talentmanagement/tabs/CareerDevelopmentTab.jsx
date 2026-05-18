/* eslint-disable */
import React, { useState, useEffect } from "react";
import { 
  FiTrash2, FiEdit3, FiDownload, FiChevronLeft, FiChevronRight, FiSearch, FiCalendar 
} from "react-icons/fi";
import {
  getCareerRecords,
  createCareerRecord,
  updateCareerRecord,
  deleteCareerRecord,
  getTopicsByCategory
} from "../../api/talentApi";

import EmployeeSelector from "../../components/EmployeeSelector";
import "../../styles/CareerDevelopmentTab.css";

const initialFormState = {
  employee: "", 
  userid: "", 
  firstName: "",
  lastName: "",
  costCenter: "",
  category: "Career Development",
  topic: "",
  lastPromotionDate: "",
  nextPromotionDate: "",
  tentativeScheduleMonth: "",
  remark: "pending",
};

export default function CareerDevelopmentTab() {
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
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      const [topicRes, recordRes] = await Promise.all([
        getTopicsByCategory("Career Development"),
        getCareerRecords()
      ]);
      setTopics(topicRes.data.data || []);
      setSavedRecords(recordRes.data.data || []);
    } catch (err) {
      console.error("❌ Fetch error:", err);
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
        costCenter: data.costCenter
      }));
    } else {
      setFormData(prev => ({ ...prev, ...initialFormState }));
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = { ...formData, category: "Career Development" };
      if (editingId) {
        await updateCareerRecord(editingId, payload);
        setStatus({ type: "success", message: "✅ Career plan updated!" });
      } else {
        await createCareerRecord(payload);
        setStatus({ type: "success", message: "✅ Career plan saved!" });
      }
      setFormData(initialFormState);
      setEditingId(null);
      fetchInitialData();
    } catch (error) {
      setStatus({ type: "error", message: "❌ Failed to save record." });
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
      topic: item.topic || "",
      lastPromotionDate: item.lastPromotionDate ? item.lastPromotionDate.split('T')[0] : "",
      nextPromotionDate: item.nextPromotionDate ? item.nextPromotionDate.split('T')[0] : "",
      tentativeScheduleMonth: item.tentativeScheduleMonth || "",
      remark: item.remark || "pending"
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this career development record?")) return;
    try {
      await deleteCareerRecord(id);
      fetchInitialData();
      setStatus({ type: "success", message: "🗑️ Record deleted" });
    } catch (err) { 
      setStatus({ type: "error", message: "❌ Delete failed" });
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "—";
    const d = new Date(dateStr);
    return isNaN(d.getTime()) ? "—" : d.toLocaleDateString('en-GB', { month: 'short', year: 'numeric' });
  };

  // --- FILTERING, SORTING & PAGINATION LOGIC ---
  const filteredRecords = savedRecords
    .filter(r => {
      const matchesSearch = 
        r.employee?.userAccount?.firstname?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.employee?.userAccount?.lastname?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.employee?.userAccount?.userid?.includes(searchTerm);

      const nextDate = r.nextPromotionDate ? new Date(r.nextPromotionDate) : null;
      const fromDate = dateFilter.from ? new Date(dateFilter.from) : null;
      const toDate = dateFilter.to ? new Date(dateFilter.to) : null;

      let matchesDate = true;
      if (fromDate && (!nextDate || nextDate < fromDate)) matchesDate = false;
      if (toDate && (!nextDate || nextDate > toDate)) matchesDate = false;

      return matchesSearch && matchesDate;
    })
    .sort((a, b) => new Date(b.createdAt || b.nextPromotionDate) - new Date(a.createdAt || a.nextPromotionDate));

  const totalPages = Math.ceil(filteredRecords.length / recordsPerPage);
  const currentRecords = filteredRecords.slice((currentPage - 1) * recordsPerPage, currentPage * recordsPerPage);

  // --- EXPORT LOGIC ---
  const exportToCSV = () => {
    if (filteredRecords.length === 0) return alert("No data to export");
    const headers = ["Staff ID,Employee,Topic,Schedule,Last Promo,Next Promo,Status"];
    const dataRows = filteredRecords.map(item => [
      item.employee?.userAccount?.userid || "N/A",
      `${item.employee?.userAccount?.firstname || ""} ${item.employee?.userAccount?.lastname || ""}`,
      `"${item.topic || ""}"`,
      item.tentativeScheduleMonth || "TBD",
      item.lastPromotionDate ? new Date(item.lastPromotionDate).toLocaleDateString() : "—",
      item.nextPromotionDate ? new Date(item.nextPromotionDate).toLocaleDateString() : "—",
      item.remark
    ].join(","));

    const csvContent = [headers, ...dataRows].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `Career_Plan_Export_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  return (
    <div className="tab-content-container">
      {status.message && <div className={`status-alert ${status.type}`}>{status.message}</div>}

      <form onSubmit={handleSubmit} className="talent-form">
        <h3 className="form-title">{editingId ? "Modify Career Plan" : "New Career Development Entry"}</h3>
        
        <div className="form-grid-row">
          <div className="talent-form-row">
            <EmployeeSelector onEmployeeSelected={handleEmployeeAutoFill} selectedId={formData.employee} />
          </div>
          <div className="talent-form-row">
            <label>User ID (Staff ID)</label>
            <input type="text" value={formData.userid} readOnly className="readonly-input" />
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
            <label>Cost Center</label>
            <input type="text" value={formData.costCenter} readOnly className="readonly-input" />
          </div>
          <div className="talent-form-row">
            <label>Development Topic</label>
            <select name="topic" value={formData.topic} onChange={handleInputChange} required>
              <option value="">-- Choose from Master List --</option>
              {topics.map(t => <option key={t._id} value={t.topic}>{t.topic}</option>)}
            </select>
          </div>
        </div>

        <div className="form-grid-row">
          <div className="talent-form-row">
            <label>Last Promotion</label>
            <input type="date" name="lastPromotionDate" value={formData.lastPromotionDate} onChange={handleInputChange} />
          </div>
          <div className="talent-form-row">
            <label>Next Eligibility</label>
            <input type="date" name="nextPromotionDate" value={formData.nextPromotionDate} onChange={handleInputChange} />
          </div>
        </div>

        <div className="form-grid-row">
          <div className="talent-form-row">
            <label>Schedule Month</label>
            <input type="month" name="tentativeScheduleMonth" value={formData.tentativeScheduleMonth} onChange={handleInputChange} />
          </div>
          <div className="talent-form-row">
            <label>Current Status</label>
            <select name="remark" value={formData.remark} onChange={handleInputChange}>
              <option value="pending">Pending</option>
              <option value="taken">Completed (Taken)</option>
            </select>
          </div>
        </div>

        <div className="form-action-group">
          <button type="submit" className="talent-form-submit" disabled={loading}>
            {loading ? "Saving..." : editingId ? "Update Plan" : "Save Career Plan"}
          </button>
          {editingId && (
            <button type="button" className="cancel-btn" onClick={() => {setEditingId(null); setFormData(initialFormState);}}>
              Cancel
            </button>
          )}
        </div>
      </form>

      {/* SEARCH & DATE FILTERS */}
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
          />
          <span>to</span>
          <input 
            type="date" 
            value={dateFilter.to} 
            onChange={(e) => {setDateFilter({...dateFilter, to: e.target.value}); setCurrentPage(1);}} 
          />
          <button className="export-btn-small" onClick={exportToCSV} title="Export CSV">
             <FiDownload />
          </button>
        </div>
      </div>

      <div className="table-section-wrapper">
        <div className="talent-table-container">
          <table className="leadership-table">
            <thead>
              <tr>
                <th>Staff ID</th>
                <th>Employee</th>
                <th>Topic</th>
                <th>Schedule</th>
                <th>Promotion Window</th>
                <th>Status</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentRecords.map((item) => (
                <tr key={item._id}>
                  <td className="id-cell">{item.employee?.userAccount?.userid || "N/A"}</td>
                  <td className="name-cell">
                    <strong>{`${item.employee?.userAccount?.firstname || ""} ${item.employee?.userAccount?.lastname || ""}`}</strong>
                  </td>
                  <td className="focus-text">{item.topic}</td>
                  <td>{item.tentativeScheduleMonth || "TBD"}</td>
                  <td>
                    <div className="promo-dates">
                      <span><b>Last promotion:</b> {formatDate(item.lastPromotionDate)}</span>
                      <span><b>New promotion:</b> {formatDate(item.nextPromotionDate)}</span>
                    </div>
                  </td>
                  <td>
                    <span className={`badge ${item.remark}`}>
                      {item.remark === "taken" ? "Completed" : "Pending"}
                    </span>
                  </td>
                  <td className="text-right">
                    <div className="action-cluster">
                      <button className="action-icon-btn edit" onClick={() => handleEdit(item)}><FiEdit3 /></button>
                      <button className="action-icon-btn delete" onClick={() => handleDelete(item._id)}><FiTrash2 /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {currentRecords.length === 0 && (
                <tr><td colSpan="7" className="empty-state">No matching records found.</td></tr>
              )}
            </tbody>
          </table>
        </div>

        {/* PAGINATION FOOTER */}
        {totalPages > 1 && (
          <div className="pagination-footer">
            <div className="page-controls">
              <button onClick={() => setCurrentPage(p => Math.max(p - 1, 1))} disabled={currentPage === 1}>
                <FiChevronLeft /> Prev
              </button>
              <span className="current-page">Page {currentPage} of {totalPages}</span>
              <button onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))} disabled={currentPage >= totalPages}>
                Next <FiChevronRight />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}