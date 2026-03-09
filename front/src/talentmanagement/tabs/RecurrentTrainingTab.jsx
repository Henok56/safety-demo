/* eslint-disable */
import React, { useState, useEffect } from "react";
import { 
  FiTrash2, FiEdit3, FiSearch, FiX, FiChevronLeft, FiChevronRight, FiCalendar, FiDownload 
} from "react-icons/fi";
import { 
  getRecurrentRecords, 
  createRecurrentRecord, 
  updateRecurrentRecord,
  deleteRecurrentRecord,
  getTopicsByCategory 
} from "../../api/talentApi";

import EmployeeSelector from "../../components/EmployeeSelector";
import "../../styles/RecurrentTrainingTab.css";

export default function RecurrentTrainingTab() {
  const [records, setRecords] = useState([]);
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState(null);
  
  // --- FILTER, SORT & PAGINATION STATE ---
  const [searchTerm, setSearchTerm] = useState("");
  const [dateFilter, setDateFilter] = useState({ from: "", to: "" });
  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 5;

  const initialFormState = {
    employee: "",
    userid: "",               
    firstName: "",            
    lastName: "",             
    costCenter: "",           
    trainingType: "",         
    tentativeScheduleDate: "", 
    remark: "pending",        
    category: "Recurrent Training"
  };

  const [formData, setFormData] = useState(initialFormState);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [topicRes, recordRes] = await Promise.all([
        getTopicsByCategory("Recurrent Training"), 
        getRecurrentRecords() 
      ]);
      setTopics(topicRes.data.data || []);
      setRecords(recordRes.data.data || []);
    } catch (err) {
      console.error("Fetch error:", err);
    }
  };

  const handleEdit = (item) => {
    setEditingId(item._id);
    setFormData({
      employee: item.employee?._id || "",
      userid: item.employee?.userAccount?.userid || "",
      firstName: item.employee?.userAccount?.firstname || "",
      lastName: item.employee?.userAccount?.lastname || "",
      costCenter: item.costCenter || item.employee?.costCenter || "",
      trainingType: item.trainingType?._id || "", 
      tentativeScheduleDate: item.tentativeScheduleDate ? item.tentativeScheduleDate.split('T')[0] : "",
      remark: item.remark || "pending",
      category: item.category || "Recurrent Training"
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setFormData(initialFormState);
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
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const payload = { ...formData, tentativeScheduleDate: formData.tentativeScheduleDate || null };

    try {
      if (editingId) {
        await updateRecurrentRecord(editingId, payload);
      } else {
        await createRecurrentRecord(payload);
      }
      handleCancelEdit();
      loadData();
    } catch (err) {
      console.error("Submission Error:", err.response?.data);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this record?")) return;
    try {
      await deleteRecurrentRecord(id);
      loadData();
    } catch (err) {
      console.error("Delete failed");
    }
  };

  // --- CSV EXPORT LOGIC ---
  const exportToCSV = () => {
    if (filteredRecords.length === 0) return alert("No data to export");
    const headers = ["Staff ID,Employee,Topic,Schedule,Status"];
    const rows = filteredRecords.map(item => [
      item.employee?.userAccount?.userid || "N/A",
      `${item.employee?.userAccount?.firstname || ""} ${item.employee?.userAccount?.lastname || ""}`,
      item.trainingType?.topic || "—",
      item.tentativeScheduleDate ? new Date(item.tentativeScheduleDate).toLocaleDateString() : "TBD",
      item.remark
    ].join(","));

    const csvContent = "data:text/csv;charset=utf-8," + [headers, ...rows].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Recurrent_Training_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // --- FILTERING, SORTING & PAGINATION LOGIC ---
  const filteredRecords = records
    .filter(r => {
      const matchesSearch = 
        r.employee?.userAccount?.firstname?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.employee?.userAccount?.userid?.includes(searchTerm);

      const recordDate = r.tentativeScheduleDate ? new Date(r.tentativeScheduleDate) : null;
      const from = dateFilter.from ? new Date(dateFilter.from) : null;
      const to = dateFilter.to ? new Date(dateFilter.to) : null;

      let matchesDate = true;
      if (from && recordDate < from) matchesDate = false;
      if (to && recordDate > to) matchesDate = false;

      return matchesSearch && matchesDate;
    })
    .sort((a, b) => new Date(b.tentativeScheduleDate || 0) - new Date(a.tentativeScheduleDate || 0));

  const totalPages = Math.ceil(filteredRecords.length / recordsPerPage);
  const currentRecords = filteredRecords.slice((currentPage - 1) * recordsPerPage, currentPage * recordsPerPage);

  return (
    <div className="tab-content-container">
      <form onSubmit={handleSubmit} className="talent-form">
        <h3 className="form-title">{editingId ? "Update Recurrent Training" : "New Recurrent Entry"}</h3>
        <div className="form-grid-row">
          <div className="talent-form-row">
            <EmployeeSelector onEmployeeSelected={handleEmployeeAutoFill} selectedId={formData.employee} />
          </div>
          <div className="talent-form-row">
            <label>Staff ID</label>
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
            <label>Training Topic</label>
            <select value={formData.trainingType} onChange={(e) => setFormData({...formData, trainingType: e.target.value})} required>
              <option value="">-- Select --</option>
              {topics.map(t => <option key={t._id} value={t._id}>{t.topic}</option>)}
            </select>
          </div>
          <div className="talent-form-row">
            <label>Tentative Date</label>
            <input type="date" value={formData.tentativeScheduleDate} onChange={(e) => setFormData({...formData, tentativeScheduleDate: e.target.value})} />
          </div>
        </div>
        <div className="form-grid-row">
          <div className="talent-form-row">
            <label>Status</label>
            <select value={formData.remark} onChange={(e) => setFormData({...formData, remark: e.target.value})}>
              <option value="pending">Pending</option>
              <option value="taken">Completed</option>
            </select>
          </div>
          <div className="talent-form-row">
            <label>Cost Center</label>
            <input type="text" value={formData.costCenter} readOnly className="readonly-input" />
          </div>
        </div>
        <div className="form-action-group">
          <button type="submit" className="talent-form-submit" disabled={loading}>
            {loading ? "Processing..." : editingId ? "Update Record" : "Save Record"}
          </button>
          {editingId && <button type="button" className="cancel-btn" onClick={handleCancelEdit}><FiX /> Cancel</button>}
        </div>
      </form>

      {/* --- TABLE CONTROLS --- */}
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
          <input type="date" value={dateFilter.from} onChange={(e) => {setDateFilter({...dateFilter, from: e.target.value}); setCurrentPage(1);}} />
          <span>to</span>
          <input type="date" value={dateFilter.to} onChange={(e) => {setDateFilter({...dateFilter, to: e.target.value}); setCurrentPage(1);}} />
          <button className="export-btn-small" onClick={exportToCSV} title="Export CSV"><FiDownload /></button>
        </div>
      </div>

      <div className="talent-table-container">
        <table className="leadership-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Employee</th>
              <th>Topic</th>
              <th>Schedule</th>
              <th>Status</th>
              <th className="text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {currentRecords.map((item) => (
              <tr key={item._id}>
                <td><strong>{item.employee?.userAccount?.userid || "N/A"}</strong></td>
                <td>{item.employee?.userAccount?.firstname} {item.employee?.userAccount?.lastname}</td>
                <td>{item.trainingType?.topic || "—"}</td>
                <td>{item.tentativeScheduleDate ? new Date(item.tentativeScheduleDate).toLocaleDateString('en-GB') : "—"}</td>
                <td><span className={`badge ${item.remark}`}>{item.remark}</span></td>
                <td className="text-right">
                  <button className="action-icon-btn edit" onClick={() => handleEdit(item)}><FiEdit3 /></button>
                  <button className="action-icon-btn delete" onClick={() => handleDelete(item._id)}><FiTrash2 /></button>
                </td>
              </tr>
            ))}
            {currentRecords.length === 0 && (
              <tr><td colSpan="6" className="text-center">No records found.</td></tr>
            )}
          </tbody>
        </table>

        {/* --- PAGINATION FOOTER --- */}
        {totalPages > 1 && (
          <div className="pagination-footer">
            <button className="page-btn" disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)}><FiChevronLeft /> Previous</button>
            <span className="page-info">Page {currentPage} of {totalPages}</span>
            <button className="page-btn" disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)}>Next <FiChevronRight /></button>
          </div>
        )}
      </div>
    </div>
  );
}