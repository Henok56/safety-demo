/* eslint-disable */
import React, { useState, useEffect } from "react";
import { 
  FiTrash2, FiEdit3, FiChevronLeft, FiChevronRight, 
  FiSearch, FiUserPlus, FiCalendar, FiX, FiDownload 
} from "react-icons/fi";
import {
  getSuccessionRecords,
  createSuccessionRecord,
  updateSuccessionRecord,
  deleteSuccessionRecord
} from "../../api/talentApi";

import EmployeeSelector from "../../components/EmployeeSelector";
import "../../styles/SuccessionPlanningTab.css";

const initialFormState = {
  employee: "",
  userid: "",
  firstName: "",
  lastName: "",
  costCenter: "",
  currentPosition: "",
  department: "",
  groomedForPosition: "",
  actingAssignmentDetail: "",
  actingAssignmentDate: "",
  projectAssignmentDetail: "",
  projectAssignmentDate: "",
  exposureOpportunityDetail: "",
  exposureOpportunityDate: "",
  remark: "pending",
};

export default function SuccessionPlanningTab() {
  const [savedRecords, setSavedRecords] = useState([]);
  const [formData, setFormData] = useState(initialFormState);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState({ type: "", message: "" });

  // Filter & Pagination State
  const [searchTerm, setSearchTerm] = useState("");
  const [dateRange, setDateRange] = useState({ from: "", to: "" });
  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 5;

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const res = await getSuccessionRecords();
      setSavedRecords(res.data.data || []);
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
        costCenter: data.costCenter,
        currentPosition: data.designation || "",
        department: data.department || ""
      }));
    } else {
      setFormData(initialFormState);
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
      const payload = {
        employee: formData.employee,
        costCenter: formData.costCenter,
        currentPosition: formData.currentPosition,
        department: formData.department,
        groomedForPosition: formData.groomedForPosition,
        actingAssignment: {
          detail: formData.actingAssignmentDetail,
          scheduleMonth: formData.actingAssignmentDate || null
        },
        projectAssignments: {
          detail: formData.projectAssignmentDetail,
          scheduleMonth: formData.projectAssignmentDate || null
        },
        exposureOpportunities: {
          detail: formData.exposureOpportunityDetail,
          scheduleMonth: formData.exposureOpportunityDate || null
        },
        remark: formData.remark
      };

      if (editingId) {
        await updateSuccessionRecord(editingId, payload);
        setStatus({ type: "success", message: "✅ Succession plan updated!" });
      } else {
        await createSuccessionRecord(payload);
        setStatus({ type: "success", message: "✅ New succession record created!" });
      }

      setFormData(initialFormState);
      setEditingId(null);
      fetchData();
    } catch (err) {
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
      currentPosition: item.currentPosition || "",
      department: item.department || "",
      groomedForPosition: item.groomedForPosition || "",
      actingAssignmentDetail: item.actingAssignment?.detail || "",
      actingAssignmentDate: item.actingAssignment?.scheduleMonth?.split('T')[0] || "",
      projectAssignmentDetail: item.projectAssignments?.detail || "",
      projectAssignmentDate: item.projectAssignments?.scheduleMonth?.split('T')[0] || "",
      exposureOpportunityDetail: item.exposureOpportunities?.detail || "",
      exposureOpportunityDate: item.exposureOpportunities?.scheduleMonth?.split('T')[0] || "",
      remark: item.remark || "pending"
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this succession record?")) return;
    try {
      await deleteSuccessionRecord(id);
      fetchData();
      setStatus({ type: "success", message: "🗑️ Record deleted" });
    } catch (err) {
      setStatus({ type: "error", message: "❌ Delete failed" });
    }
  };

  // --- Secure CSV Export Logic ---
  const exportToCSV = () => {
    if (filteredRecords.length === 0) return alert("No records to export");

    const headers = ["Staff ID", "Employee Name", "Current Position", "Target Role", "Acting Date", "Project Date", "Status"];
    const rows = filteredRecords.map(r => [
      `"${r.employee?.userAccount?.userid || "N/A"}"`,
      `"${r.employee?.userAccount?.firstname} ${r.employee?.userAccount?.lastname}"`,
      `"${r.currentPosition || "N/A"}"`,
      `"${r.groomedForPosition || "N/A"}"`,
      `"${r.actingAssignment?.scheduleMonth?.split('T')[0] || "N/A"}"`,
      `"${r.projectAssignments?.scheduleMonth?.split('T')[0] || "N/A"}"`,
      `"${r.remark === "taken" ? "Ready" : "Developing"}"`
    ].join(","));

    const csvString = [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `Succession_Report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // --- Filtering & Sorting Logic ---
  const filteredRecords = savedRecords
    .filter(r => {
      const user = r.employee?.userAccount || {};
      const searchString = `${user.firstname} ${user.lastname} ${user.userid} ${r.groomedForPosition}`.toLowerCase();
      const matchesSearch = searchString.includes(searchTerm.toLowerCase());

      const from = dateRange.from ? new Date(dateRange.from) : null;
      const to = dateRange.to ? new Date(dateRange.to) : null;
      
      let matchesDate = true;
      if (from || to) {
        const dates = [
          r.actingAssignment?.scheduleMonth,
          r.projectAssignments?.scheduleMonth,
          r.exposureOpportunities?.scheduleMonth
        ].map(d => d ? new Date(d) : null).filter(d => d !== null);

        matchesDate = dates.length > 0 && dates.some(d => {
          const afterFrom = from ? d >= from : true;
          const beforeTo = to ? d <= to : true;
          return afterFrom && beforeTo;
        });
      }
      return matchesSearch && matchesDate;
    })
    .sort((a, b) => b._id.localeCompare(a._id)); // Most recent on top

  const currentRecords = filteredRecords.slice((currentPage - 1) * recordsPerPage, currentPage * recordsPerPage);
  const totalPages = Math.ceil(filteredRecords.length / recordsPerPage);

  const formatDate = (dateStr) => {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleDateString('en-GB');
  };

  return (
    <div className="tab-content-container">
      {status.message && <div className={`status-alert ${status.type}`}>{status.message}</div>}

      <form onSubmit={handleSubmit} className="talent-form">
        <h3 className="form-title">
          <FiUserPlus style={{ marginRight: '8px' }} />
          {editingId ? "Update Succession Plan" : "Assign Succession Planning"}
        </h3>

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
            <label>Current Position</label>
            <input type="text" name="currentPosition" value={formData.currentPosition} onChange={handleInputChange} required />
          </div>
          <div className="talent-form-row">
            <label>Target Position (Groomed For)</label>
            <input type="text" name="groomedForPosition" value={formData.groomedForPosition} onChange={handleInputChange} required />
          </div>
        </div>

        <div className="form-grid-row">
          <div className="talent-form-row">
            <label>Acting Start Date</label>
            <input type="date" name="actingAssignmentDate" value={formData.actingAssignmentDate} onChange={handleInputChange} />
          </div>
          <div className="talent-form-row">
            <label>Project Start Date</label>
            <input type="date" name="projectAssignmentDate" value={formData.projectAssignmentDate} onChange={handleInputChange} />
          </div>
        </div>

        <div className="form-action-group">
          <button type="submit" className="talent-form-submit" disabled={loading}>
            {loading ? "Processing..." : editingId ? "Update Plan" : "Save Plan"}
          </button>
          {editingId && (
            <button type="button" className="cancel-btn" onClick={() => { setEditingId(null); setFormData(initialFormState); }}>
              Cancel
            </button>
          )}
        </div>
      </form>

      {/* TABLE CONTROLS */}
      <div className="table-controls-row">
        <div className="search-input-wrapper">
          <FiSearch />
          <input 
            type="text" 
            placeholder="Search Staff ID, Name or Role..." 
            value={searchTerm} 
            onChange={e => {setSearchTerm(e.target.value); setCurrentPage(1);}} 
          />
        </div>

        <div className="date-filter-group">
          <FiCalendar />
          <input type="date" value={dateRange.from} onChange={e => {setDateRange({...dateRange, from: e.target.value}); setCurrentPage(1);}} />
          <span>to</span>
          <input type="date" value={dateRange.to} onChange={e => {setDateRange({...dateRange, to: e.target.value}); setCurrentPage(1);}} />
          <button className="export-btn-small" onClick={exportToCSV} title="Export CSV">
            <FiDownload />
          </button>
        </div>
      </div>

      <div className="talent-table-container">
        <table className="leadership-table">
          <thead>
            <tr>
              <th>User ID</th>
              <th>Employee Name</th>
              <th>Current Position</th>
              <th>Target Role</th>
              <th>Duration (From - To)</th>
              <th>Status</th>
              <th className="text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {currentRecords.map((item) => (
              <tr key={item._id}>
                <td><strong>{item.employee?.userAccount?.userid || "N/A"}</strong></td>
                <td>{item.employee?.userAccount?.firstname} {item.employee?.userAccount?.lastname}</td>
                <td>{item.currentPosition || "—"}</td>
                <td><div className="topic-badge">{item.groomedForPosition}</div></td>
                <td>
                    <div className="duration-cell">
                        <small>Act: {formatDate(item.actingAssignment?.scheduleMonth)}</small>
                        <small>Proj: {formatDate(item.projectAssignments?.scheduleMonth)}</small>
                    </div>
                </td>
                <td>
                  <span className={`badge ${item.remark}`}>
                    {item.remark === "taken" ? "Ready" : "Developing"}
                  </span>
                </td>
                <td className="text-right">
                  <button className="action-icon-btn edit" onClick={() => handleEdit(item)}><FiEdit3 /></button>
                  <button className="action-icon-btn delete" onClick={() => handleDelete(item._id)}><FiTrash2 /></button>
                </td>
              </tr>
            ))}
            {currentRecords.length === 0 && (
                <tr><td colSpan="7" className="empty-state-cell">No succession records found.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="pagination-footer">
        <div className="page-info">Showing {currentRecords.length} of {filteredRecords.length} records</div>
        <div className="page-controls">
          <button onClick={() => setCurrentPage(p => Math.max(p - 1, 1))} disabled={currentPage === 1}><FiChevronLeft /></button>
          <span className="current-page">{currentPage} / {totalPages || 1}</span>
          <button onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))} disabled={currentPage >= totalPages || totalPages === 0}><FiChevronRight /></button>
        </div>
      </div>
    </div>
  );
}