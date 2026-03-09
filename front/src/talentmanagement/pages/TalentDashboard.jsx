/* eslint-disable */
import React, { useEffect, useState, useMemo } from "react";
import api from "../../api";
import { 
  FiDownload, FiSearch, FiAlertTriangle, FiCheckSquare, 
  FiPieChart, FiUsers, FiArrowUpRight, FiActivity, FiTrash2, 
  FiLayers, FiCalendar, FiChevronLeft, FiChevronRight 
} from "react-icons/fi";
import "../../styles/TalentDashboard.css";

const DASHBOARD_MAPPING = {
  "career": {
    label: "Career Development",
    getData: (item) => ({
      col1: item.employee?.userAccount?.userid || "---",
      col2: `${item.employee?.userAccount?.firstname || ""} ${item.employee?.userAccount?.lastname || ""}`,
      col3: item.careerPath || item.targetPosition || "Career Growth",
      col4: item.targetDate || item.scheduleMonth || null,
      status: item.remark
    })
  },
  "coaching": {
    label: "Executive Coaching",
    getData: (item) => ({
      col1: item.employee?.userAccount?.userid || "---",
      col2: `${item.employee?.userAccount?.firstname || ""} ${item.employee?.userAccount?.lastname || ""}`,
      col3: item.topic || item.coachingGoal || "Leadership Coaching",
      col4: item.sessionDate || item.scheduleMonth || null,
      status: item.remark
    })
  },
  "leadership": {
    label: "Leadership Development",
    getData: (item) => ({
      col1: item.employee?.userAccount?.userid || "---",
      col2: `${item.employee?.userAccount?.firstname || ""} ${item.employee?.userAccount?.lastname || ""}`,
      col3: item.programName || item.leadershipFocus || "Executive Track",
      col4: item.expectedCompletion || item.scheduleMonth || null,
      status: item.remark
    })
  },
  "recurrent-training": {
    label: "Recurrent Training",
    getData: (item) => ({
      col1: item.employee?.userAccount?.userid || "---",
      col2: `${item.employee?.userAccount?.firstname || ""} ${item.employee?.userAccount?.lastname || ""}`,
      col3: item.courseName || "Mandatory Training",
      col4: item.expiryDate || item.scheduleMonth || null,
      status: item.remark
    })
  },
  "succession": {
    label: "Succession Planning",
    getData: (item) => ({
      col1: item.employee?.userAccount?.userid || "---",
      col2: `${item.employee?.userAccount?.firstname || ""} ${item.employee?.userAccount?.lastname || ""}`,
      col3: item.groomedForPosition || "Future Leader",
      col4: item.readinessTimeline || item.actingAssignment?.scheduleMonth || null,
      status: item.remark
    })
  }
};

const MODULE_KEYS = Object.keys(DASHBOARD_MAPPING);

export default function TalentDashboard() {
  const [moduleData, setModuleData] = useState([]);
  const [selectedModule, setSelectedModule] = useState("all");
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [dateRange, setDateRange] = useState({ from: "", to: "" });
  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 10;

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        if (selectedModule === "all") {
          const requests = MODULE_KEYS.map(key => 
            api.get(`/${key}`).then(res => 
              (res.data.data || []).map(item => ({ ...item, sourceModule: key }))
            )
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
        setModuleData([]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [selectedModule]);

  const filteredData = useMemo(() => {
    return moduleData.filter(item => {
      const emp = item.employee?.userAccount || {};
      const searchStr = `${emp.firstname} ${emp.lastname} ${emp.userid}`.toLowerCase();
      const matchesSearch = searchStr.includes(searchTerm.toLowerCase());
      const itemDate = item.createdAt || item.updatedAt || null;
      let matchesDate = true;
      if (dateRange.from && itemDate) matchesDate = new Date(itemDate) >= new Date(dateRange.from);
      if (dateRange.to && itemDate) matchesDate = matchesDate && new Date(itemDate) <= new Date(dateRange.to);
      return matchesSearch && matchesDate;
    });
  }, [moduleData, searchTerm, dateRange]);

  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
  const currentRecords = filteredData.slice(indexOfFirstRecord, indexOfLastRecord);
  const totalPages = Math.ceil(filteredData.length / recordsPerPage);

  const stats = useMemo(() => {
    const total = filteredData.length;
    const completed = filteredData.filter(r => r.remark?.toLowerCase() === "taken").length;
    const rate = total > 0 ? Math.round((completed / total) * 100) : 0;
    return { total, completed, pending: total - completed, rate };
  }, [filteredData]);

  return (
    <div className="executive-dashboard">
      <header className="dashboard-header">
        <div>
          <h1>Talent Intelligence</h1>
          <p>Management overview of organizational development</p>
        </div>
        <div className="stat-summary-pill">
           <span>{stats.rate}% Completion Rate</span>
        </div>
      </header>

      <div className="analytics-grid">
        <div className="stat-card">
          <div className="stat-label">Total Talent Records</div>
          <div className="stat-value">{stats.total}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Operational Status</div>
          <div className="progress-flex">
             <div className="stacked-bar-container">
                <div className="bar-fill achieved" style={{width: `${stats.rate}%`}}></div>
             </div>
             <div className="bar-legend">
                <span className="leg-achieved">Achieved: {stats.completed}</span>
                <span className="leg-pending">Pending: {stats.pending}</span>
             </div>
          </div>
        </div>
      </div>

      <div className="management-controls">
        <div className="module-tabs">
          <button className={selectedModule === "all" ? "active" : ""} onClick={() => setSelectedModule("all")}>All Modules</button>
          {MODULE_KEYS.map(k => (
            <button key={k} className={selectedModule === k ? "active" : ""} onClick={() => setSelectedModule(k)}>
              {DASHBOARD_MAPPING[k].label}
            </button>
          ))}
        </div>

        <div className="filter-shelf">
          <div className="search-box">
            <FiSearch />
            <input type="text" placeholder="Search staff..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
          </div>
          <div className="date-picker-group">
            <FiCalendar />
            <input type="date" value={dateRange.from} onChange={e => setDateRange({...dateRange, from: e.target.value})} />
            <span>to</span>
            <input type="date" value={dateRange.to} onChange={e => setDateRange({...dateRange, to: e.target.value})} />
          </div>
        </div>
      </div>

      <div className="table-wrapper">
        <table className="executive-table">
          <thead>
            <tr>
              <th>Staff ID</th>
              <th>Employee Name</th>
              <th>Core Focus</th>
              <th>Timeline</th>
              {selectedModule === 'all' && <th>Module</th>}
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {loading ? <tr><td colSpan="6" className="loading-state">Updating Data...</td></tr> : 
              currentRecords.map(item => {
                const mKey = item.sourceModule || selectedModule;
                const config = DASHBOARD_MAPPING[mKey];
                
                // 🔥 THE FIX: Safety check to prevent 'col1' error
                const row = config ? config.getData(item) : {
                  col1: "N/A", col2: "Unknown", col3: "N/A", col4: null, status: "N/A"
                };

                return (
                  <tr key={item._id}>
                    <td className="id-cell">{row.col1}</td>
                    <td className="emp-cell">{row.col2}</td>
                    <td><span className="focus-badge">{row.col3}</span></td>
                    <td className="date-cell">{row.col4 ? new Date(row.col4).toLocaleDateString() : "Ongoing"}</td>
                    {selectedModule === 'all' && <td><span className="cat-tag">{mKey}</span></td>}
                    <td>
                      <div className={`status-pill ${row.status === 'taken' ? 'achieved' : 'pending'}`}>
                        {row.status === 'taken' ? 'Achieved' : 'Pending'}
                      </div>
                    </td>
                  </tr>
                );
            })}
          </tbody>
        </table>

        <div className="pagination-shelf">
          <p>Showing {indexOfFirstRecord + 1} - {Math.min(indexOfLastRecord, filteredData.length)} of {filteredData.length}</p>
          <div className="page-btns">
            <button disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)}><FiChevronLeft /></button>
            <span className="page-counter">{currentPage} / {totalPages || 1}</span>
            <button disabled={currentPage >= totalPages} onClick={() => setCurrentPage(p => p + 1)}><FiChevronRight /></button>
          </div>
        </div>
      </div>
    </div>
  );
}