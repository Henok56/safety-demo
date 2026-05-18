import React, { useEffect, useState, useMemo, useCallback } from "react";
import * as FdmHandlingApi from "../../api/FdmHandlingApi";
import { FiAlertCircle, FiShield, FiLock, FiInfo, FiDatabase, FiExternalLink } from "react-icons/fi";
import "../../styles/FdmRelatedPage.css";

export default function FdmDashboard() {
  const [viewMode, setViewMode] = useState("summary");

  const [summaryData, setSummaryData] = useState([]);
  const [events, setEvents] = useState([]);

  const [fleets, setFleets] = useState([]);
  const [selectedFleet, setSelectedFleet] = useState("ALL");
  const [overduePages, setOverduePages] = useState({});

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showDataNotice, setShowDataNotice] = useState(true);

  const [filters, setFilters] = useState({
    from: "",
    to: "",
  });

  const OVERDUE_PAGE_SIZE = 5;

  const getErrorMessage = (err) => {
    if (typeof err === "string") return err;
    return err?.message || "Error loading FDM handling data";
  };

  const formatAssignedUsers = (users) => {
    const list = Array.isArray(users) ? users : [users];
    const uniqueUsers = [
      ...new Set(list.filter((user) => user && user !== "Unassigned")),
    ];

    return uniqueUsers.length ? uniqueUsers.join(" and ") : "Unassigned";
  };

  // ================= LOAD =================
  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const res =
        viewMode === "summary"
          ? await FdmHandlingApi.getDashboardSummary(filters)
          : await FdmHandlingApi.getOverdueEvents(filters);

      const data = Array.isArray(res.data) ? res.data : [];

      if (viewMode === "summary") {
        setSummaryData(data);
        setFleets([...new Set(data.map((d) => d.fleetType))]);
      } else {
        const reportableEvents = data.filter((event) =>
          ["HIGH", "MEDIUM"].includes(event.severity)
        );

        setEvents(reportableEvents);
        setFleets([...new Set(reportableEvents.map((d) => d.fleetFamily))]);
      }
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [viewMode, filters]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    if (selectedFleet !== "ALL" && !fleets.includes(selectedFleet)) {
      setSelectedFleet("ALL");
    }
  }, [fleets, selectedFleet]);

  useEffect(() => {
    setOverduePages({});
  }, [events, selectedFleet]);

  // ================= GROUP OVERDUE =================
  const groupedOverdue = useMemo(() => {
    if (viewMode !== "overdue") return {};

    const filtered =
      selectedFleet === "ALL"
        ? events
        : events.filter((e) => e.fleetFamily === selectedFleet);

    const map = {};

    filtered.forEach((e) => {
      const fleet = e.fleetFamily;
      const user = formatAssignedUsers(e.assignedUsers || e.assignedUser);

      if (!map[fleet]) map[fleet] = {};
      if (!map[fleet][user]) map[fleet][user] = [];

      map[fleet][user].push(e);
    });

    return map;
  }, [events, selectedFleet, viewMode]);

  return (
    <div className="fdm-page">
      {/* ================= SENSITIVE DATA NOTICE ================= */}
      {showDataNotice && (
        <div className="sensitive-data-notice">
          <div className="notice-header">
            <FiShield className="notice-icon" />
            <FiLock className="notice-icon" />
            <h3>⚠️ Confidential Integration Notice</h3>
            <button 
              className="notice-close"
              onClick={() => setShowDataNotice(false)}
              aria-label="Dismiss notice"
            >
              ×
            </button>
          </div>
          
          <div className="notice-content">
            <p>
              <strong>This module is integrated with our external partner's system (Cassiopée - French Aerospace Safety System).</strong>
            </p>
            
            <div className="notice-details">
              <div className="notice-section">
                <FiDatabase />
                <div>
                  <strong>Data Source:</strong>
                  <span>Cassiopée Safety Management System (Provided by French Aviation Authority)</span>
                </div>
              </div>
              
              <div className="notice-section">
                <FiExternalLink />
                <div>
                  <strong>Integration Type:</strong>
                  <span>Real-time API synchronization with external safety database</span>
                </div>
              </div>
              
              <div className="notice-section">
                <FiAlertCircle />
                <div>
                  <strong>For Demonstration Only:</strong>
                  <span>The data shown below is simulated/mock data for presentation purposes. Live data requires active Cassiopée API credentials.</span>
                </div>
              </div>
            </div>
            
            <div className="notice-warning">
              <FiInfo />
              <p>
                <strong>Note:</strong> In production, this dashboard would display live FDM (Flight Data Monitoring) events 
                from the Cassiopée system, including real-time safety alerts, fleet performance metrics, 
                and overdue investigation items. Currently showing mock data to demonstrate functionality.
              </p>
            </div>
          </div>
        </div>
      )}

      <h1 className="title">
        FDM Dashboard
        <span className="integration-badge">Cassiopée Integration</span>
      </h1>

      {/* ERROR */}
      {error && <div className="error-box">{error}</div>}

      {/* FILTERS */}
      <div className="filters">
        <input
          type="date"
          value={filters.from}
          onChange={(e) =>
            setFilters({ ...filters, from: e.target.value })
          }
        />

        <input
          type="date"
          value={filters.to}
          onChange={(e) =>
            setFilters({ ...filters, to: e.target.value })
          }
        />

        <button onClick={loadData} disabled={loading}>
          Apply
        </button>
      </div>

      {/* VIEW SWITCH */}
      <div className="toggle">
        <button
          className={viewMode === "summary" ? "active" : ""}
          onClick={() => setViewMode("summary")}
        >
          Summary
        </button>

        <button
          className={viewMode === "overdue" ? "active" : ""}
          onClick={() => setViewMode("overdue")}
        >
          Overdue
        </button>
      </div>

      {loading && <div className="status-box">Loading FDM data from Cassiopée system...</div>}

      {/* ================= SUMMARY ================= */}
      {viewMode === "summary" && !loading && summaryData.length === 0 && (
        <div className="status-box">
          <FiInfo />
          <span>No summary data found for this period. (Mock data mode)</span>
        </div>
      )}

      {viewMode === "summary" && !loading && summaryData.length > 0 && (
        <>
          <div className="mock-data-badge">
            <FiAlertCircle size={14} />
            <span>Displaying simulated data for demonstration</span>
          </div>
          
          <table className="table">
            <thead>
              <tr>
                <th>Fleet</th>
                <th>High</th>
                <th>Medium</th>
                <th>Total</th>
                <th>Assigned User</th>
              </tr>
            </thead>

            <tbody>
              {summaryData.map((r, i) => (
                <tr key={i}>
                  <td>{r.fleetType}</td>
                  <td>{r.highNotChecked}</td>
                  <td>{r.mediumNotChecked}</td>
                  <td>{r.totalPending}</td>
                  <td>{formatAssignedUsers(r.assignedUsers || r.assignedUser)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}

      {/* ================= OVERDUE ================= */}
      {viewMode === "overdue" && !loading && events.length === 0 && (
        <div className="status-box">
          <FiInfo />
          <span>No overdue events found for this period. (Mock data mode)</span>
        </div>
      )}

      {viewMode === "overdue" && !loading && events.length > 0 && (
        <>
          <div className="mock-data-badge">
            <FiAlertCircle size={14} />
            <span>Displaying simulated data for demonstration</span>
          </div>

          {/* FLEET BUTTONS */}
          <div className="fleet-buttons">
            <button
              className={selectedFleet === "ALL" ? "active" : ""}
              onClick={() => setSelectedFleet("ALL")}
            >
              ALL
            </button>

            {fleets.map((f) => (
              <button
                key={f}
                className={selectedFleet === f ? "active" : ""}
                onClick={() => setSelectedFleet(f)}
              >
                {f}
              </button>
            ))}
          </div>

          {/* FLEET GROUPS */}
          {Object.entries(groupedOverdue).map(([fleet, usersObj]) => {
            const allUsers = Object.keys(usersObj);
            const fleetEvents = Object.values(usersObj).flat();
            const currentPage = overduePages[fleet] || 1;
            const totalPages = Math.max(
              1,
              Math.ceil(fleetEvents.length / OVERDUE_PAGE_SIZE)
            );
            const visibleEvents = fleetEvents.slice(
              (currentPage - 1) * OVERDUE_PAGE_SIZE,
              currentPage * OVERDUE_PAGE_SIZE
            );

            const setFleetPage = (page) => {
              setOverduePages((prev) => ({
                ...prev,
                [fleet]: Math.min(Math.max(page, 1), totalPages),
              }));
            };

            return (
              <div key={fleet} className="fleet-block">
                <h2 className="fleet-title">{fleet}</h2>

                <p className="assigned-users">
                  Assigned Users:{" "}
                  <strong>{formatAssignedUsers(allUsers)}</strong>
                </p>

                <table className="table">
                  <thead>
                    <tr>
                      <th>Event</th>
                      <th>Severity</th>
                      <th>Date</th>
                    </tr>
                  </thead>

                  <tbody>
                    {visibleEvents.map((e, i) => (
                      <tr key={`${e.recordId || e.event?.eventName}-${i}`}>
                        <td>{e.event?.eventName}</td>
                        <td>
                          <span className={`badge ${e.severity}`}>
                            {e.severity}
                          </span>
                        </td>
                        <td>
                          {new Date(
                            e.qarDataIngestionDate
                          ).toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {totalPages > 1 && (
                  <div className="pagination">
                    <button
                      onClick={() => setFleetPage(currentPage - 1)}
                      disabled={currentPage === 1}
                    >
                      Previous
                    </button>

                    <span>
                      Page {currentPage} of {totalPages}
                    </span>

                    <button
                      onClick={() => setFleetPage(currentPage + 1)}
                      disabled={currentPage === totalPages}
                    >
                      Next
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </>
      )}
    </div>
  );
}