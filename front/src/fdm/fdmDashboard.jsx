/* eslint-disable */
import React, { useEffect, useState, useMemo } from "react";
import "../styles/fdmDashboard.css";
import fdmApi from "../api/fdmApi";
import { 
  Download, FileText, BarChart2, Activity, 
  Plane, Search, Filter, Edit2, Trash2, X, ChevronLeft, ChevronRight, Mail
} from "lucide-react";

const FdmDashboard = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFleet, setSelectedFleet] = useState("All");
  const [editingEvent, setEditingEvent] = useState(null);
  const [editFormData, setEditFormData] = useState({});
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 10;

  // Use local fallback if IP is unreachable on VPN
  const SERVER_URL = "http://10.0.68.42:000"; 

  useEffect(() => {
    fetchFdmData();
  }, []);

  const fetchFdmData = async () => {
    try {
      const res = await fdmApi.getAllEvents();
      // res.data.data follows your controller's structure: { success: true, count: X, data: [] }
      const rawData = res.data?.data || res.data || [];
      setEvents(Array.isArray(rawData) ? rawData : []);
      setLoading(false);
    } catch (err) {
      console.error("FDM Fetch Error:", err);
      setLoading(false);
    }
  };

  // --- LOGIC: Filtering based on your Mongoose Schema ---
  const filtered = useMemo(() => {
    return events.filter(e => {
      const searchStr = `${e.tailNumber || ''} ${e.eventName || ''} ${e.syncTag || ''}`.toLowerCase();
      const matchesSearch = searchStr.includes(searchTerm.toLowerCase());
      const matchesFleet = selectedFleet === "All" || e.fleetType === selectedFleet;
      return matchesSearch && matchesFleet;
    });
  }, [events, searchTerm, selectedFleet]);

  // --- LOGIC: Stats for Dashboard Cards ---
  const stats = useMemo(() => {
    const total = filtered.length;
    const closedCount = filtered.filter(e => e.status?.startsWith("Closed")).length;
    const autoSyncedCount = filtered.filter(e => e.status === "AUTO-SYNCED").length;
    return {
      total,
      pending: total - closedCount,
      autoSynced: autoSyncedCount,
      rate: total > 0 ? Math.round((closedCount / total) * 100) : 0
    };
  }, [filtered]);

  // --- LOGIC: Pagination ---
  const totalPages = Math.ceil(filtered.length / recordsPerPage);
  const currentRecords = filtered.slice((currentPage - 1) * recordsPerPage, currentPage * recordsPerPage);

  const handleDelete = async (id) => {
    if (window.confirm("❗ Permanent Action: Delete this safety record?")) {
      try {
        await fdmApi.deleteEvent(id);
        setEvents(prev => prev.filter(e => e._id !== id));
      } catch (err) { alert("Delete failed."); }
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      await fdmApi.updateEvent(editingEvent._id, editFormData);
      setEvents(prev => prev.map(ev => ev._id === editingEvent._id ? { ...ev, ...editFormData } : ev));
      setEditingEvent(null);
    } catch (err) { alert("Update failed."); }
  };

  const fleetTypes = ["All", ...new Set(events.map(e => e.fleetType).filter(Boolean))];

  if (loading) return <div className="fdm-loader">📡 Syncing Fleet Intelligence...</div>;

  return (
    <div className="fdm-dashboard-premium">
      <header className="dash-header">
        <div className="brand-box">
          <Plane className="ethiopian-icon" />
          <div>
            <h1>FDM Intelligence Command</h1>
            <p>Ethiopian Airlines Safety Monitoring</p>
          </div>
        </div>
        
        <div className="header-actions">
          <div className="search-pill">
            <Search size={18} />
            <input 
              placeholder="Search Tag, Tail or Event..." 
              value={searchTerm}
              onChange={(e) => {setSearchTerm(e.target.value); setCurrentPage(1);}} 
            />
          </div>
          <div className="filter-pill">
            <Filter size={18} />
            <select value={selectedFleet} onChange={(e) => {setSelectedFleet(e.target.value); setCurrentPage(1);}}>
              {fleetTypes.map(f => <option key={f} value={f}>{f}</option>)}
            </select>
          </div>
          <button className="btn-export">
            <Download size={18} /> Export CSV
          </button>
        </div>
      </header>

      <div className="metrics-grid">
        <div className="m-card">
          <div className="m-icon total"><Activity /></div>
          <div className="m-info"><span>Total Records</span><h3>{stats.total}</h3></div>
        </div>
        <div className="m-card sync-card">
          <div className="m-icon sync"><Mail /></div>
          <div className="m-info"><span>Auto-Synced</span><h3>{stats.autoSynced}</h3></div>
        </div>
        <div className="m-card velocity-card">
           <div className="velocity-header">
             <span>Resolution Rate</span>
             <span className="velocity-val">{stats.rate}%</span>
           </div>
           <div className="velocity-bar"><div className="fill" style={{width: `${stats.rate}%`}}></div></div>
        </div>
      </div>

      <div className="table-surface">
        <table className="modern-fdm-table">
          <thead>
            <tr>
              <th>Tag / Date</th>
              <th>Fleet / Tail</th>
              <th>Sector (ICAO)</th>
              <th>Event Name</th>
              <th>Status</th>
              <th>Reports</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {currentRecords.map(event => (
              <tr key={event._id}>
                <td>
                  <div className="tag-cell">
                    <span className="tag-id">{event.syncTag || "MANUAL"}</span>
                    <span className="date-sub">{new Date(event.occurrenceDate).toLocaleDateString('en-GB')}</span>
                  </div>
                </td>
                <td><span className="fleet-badge">{event.fleetType}</span> <strong>{event.tailNumber}</strong></td>
                <td>
                   <div className="sector-pill">
                    {event.departureAirport} → {event.arrivalAirport}
                   </div>
                </td>
                <td>
                  <div className="event-desc">
                    <strong className="ev-name">{event.eventName}</strong>
                    <span className="spi-subtext">{event.spi || "No SPI Tagged"}</span>
                  </div>
                </td>
                <td>
                  <span className={`status-pill ${event.status?.replace(':', '').replace(' ', '-').toLowerCase()}`}>
                    {event.status}
                  </span>
                </td>
                <td>
                  <div className="attachment-icons">
                    {event.attachments?.length > 0 ? (
                      <a href={`${SERVER_URL}/uploads/${event.attachments[0].filePath}`} target="_blank" className="report-link">
                        <FileText size={16} />
                      </a>
                    ) : <span className="no-file">None</span>}
                    {event.discussionHistory?.length > 0 && <Mail size={16} className="mail-indicator" title="Has Email History" />}
                  </div>
                </td>
                <td className="actions-cell">
                  <button className="act-btn edit" onClick={() => {setEditingEvent(event); setEditFormData({...event});}}><Edit2 size={14} /></button>
                  <button className="act-btn delete" onClick={() => handleDelete(event._id)}><Trash2 size={14} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="pagination-footer">
          <p>Showing {currentRecords.length} of {filtered.length} FDM events</p>
          <div className="pag-controls">
            <button disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)}><ChevronLeft size={18}/></button>
            <span className="page-num">{currentPage} / {totalPages || 1}</span>
            <button disabled={currentPage >= totalPages} onClick={() => setCurrentPage(p => p + 1)}><ChevronRight size={18}/></button>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      {editingEvent && (
        <div className="modal-overlay">
          <div className="modal-content animate-slide-up">
            <div className="modal-header">
              <div>
                <h2>Update Safety Action</h2>
                <small>Reference: {editingEvent.syncTag}</small>
              </div>
              <button className="close-modal" onClick={() => setEditingEvent(null)}><X /></button>
            </div>
            <form onSubmit={handleEditSubmit}>
               <div className="form-grid">
                  <div className="form-group">
                    <label>Action Status</label>
                    <select 
                      value={editFormData.status} 
                      onChange={(e) => setEditFormData({...editFormData, status: e.target.value})}
                      className="modal-select"
                    >
                      <option value="AUTO-SYNCED">AUTO-SYNCED</option>
                      <option value="Pending">Pending</option>
                      <option value="Closed: Briefing">Closed: Briefing</option>
                      <option value="Closed: Training">Closed: Training</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Safety Remarks (Final Review)</label>
                    <textarea 
                      rows="4" 
                      value={editFormData.remarks || ""} 
                      onChange={(e) => setEditFormData({...editFormData, remarks: e.target.value})} 
                      placeholder="Enter findings or pilot briefing notes..."
                    />
                  </div>
               </div>
              <button type="submit" className="save-btn">Save Safety Action</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default FdmDashboard;