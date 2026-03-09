import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api"; // fixed api.js import
import "../styles/OccurrenceList.css";
import OccurrenceForm from "../pages/OccurrenceForm";
import * as XLSX from "xlsx";

const OccurrenceList = () => {
  const navigate = useNavigate();
  const [list, setList] = useState([]);
  const [filteredList, setFilteredList] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [editingOccurrence, setEditingOccurrence] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  // ------------------- FETCH DATA -------------------
  const fetchOccurrences = async () => {
    setLoading(true);
    setError("");
    try {
      // ✅ Correct endpoint
      const res = await api.get("/occurrences");

      const data = Array.isArray(res.data?.data)
        ? res.data.data
        : Array.isArray(res.data)
          ? res.data
          : [];
      setList(data);
      setFilteredList(data);
    } catch (err) {
      console.error("Failed to fetch occurrences:", err);
      if (err.response?.status === 401) {
        alert("Unauthorized. Please login.");
        navigate("/login");
      } else {
        setError(err.response?.data?.message || "Failed to fetch occurrences");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOccurrences();
  }, []);

  // ------------------- HANDLE UPDATE -------------------
  const handleUpdateSuccess = (updatedOccurrence) => {
    setList(prev =>
      prev.map(o => (o._id === updatedOccurrence._id ? updatedOccurrence : o))
    );
    setEditingOccurrence(null);
    setShowForm(false);
    fetchOccurrences();
  };

  // ------------------- HANDLE DELETE -------------------
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this occurrence?")) return;
    try {
      await api.delete(`/occurrences/${id}`);
      setList(prev => prev.filter(o => o._id !== id));
      setFilteredList(prev => prev.filter(o => o._id !== id));
    } catch (err) {
      console.error("Failed to delete occurrence:", err);
      alert(err.response?.data?.message || "Failed to delete occurrence");
    }
  };

  // ------------------- FILTER -------------------
  const handleFilter = () => {
    const from = dateFrom ? new Date(dateFrom) : null;
    const to = dateTo ? new Date(dateTo) : null;

    const filtered = list.filter(o => {
      if (!o.occurrenceDate) return false;
      const occDate = new Date(o.occurrenceDate);
      if (from && occDate < from) return false;
      if (to && occDate > to) return false;
      return true;
    });

    setFilteredList(filtered);
    setCurrentPage(1);
  };

  // ------------------- EXPORT -------------------
  const handleExport = () => {
    if (!Array.isArray(filteredList) || filteredList.length === 0) {
      alert("No data to export!");
      return;
    }

    // Map data for a comprehensive export including all schema fields
    const exportData = filteredList.map(o => {
      return {
        "SPI": o.spi || "-",
        "Taxonomy Category L4": o.taxonomyCategoryL4 || "-",
        "Taxonomy Name": o.taxonomyName || "-",
        "Occurrence Date": o.occurrenceDate ? o.occurrenceDate.split("T")[0] : "-",
        "Aircraft Model": o.aircraftModel || "-",
        "Registration #": o.aircraftRegistrationNumber || "-",
        "Departure": o.departureAirport || "-",
        "Arrival": o.arrivalAirport || "-",
        "Location": o.occurrenceLocation || "-",
        "Event Description": o.eventDescription || "-",
        "Flight Phase": o.flightPhase || "-",
        "Source (Link)": o.reportSource && o.reportSource.startsWith("/uploads/")
          ? `http://${window.location.hostname}:5000${o.reportSource}`
          : (o.reportSource || "-"),
        "Risk Rating": o.riskRating || "-",
        "Responsible Division": o.responsibleDivision || "-",
        "Responsible Section": o.responsibleSection || "-",
        "Status Category": o.statusCategory || "-",
        "Documentation Status": o.documentationStatus || "-",
        "Remarks/Evidence": o.remarksEvidence || "-",
        "Investigation Title": o.investigationTitle || "-",
        "Investigation Completion Date": o.investigationCompletionDate ? o.investigationCompletionDate.split("T")[0] : "-",
        "Primary Causes": o.primaryCauses || "-",
        "Contributing Factors": o.contributingFactors || "-",
        "Findings": o.findings || "-",
        "# of Recommendations": o.numberOfRecommendations || 0,
        "Recommendations List": o.recommendationsList || "-",
        "Release Date": o.releaseDate ? o.releaseDate.split("T")[0] : "-",
        "Recommendation Due Date": o.recommendationDueDate ? o.recommendationDueDate.split("T")[0] : "-",
        "Closure Status": o.closureStatus || "-",
        "Closed Date": o.closedDate ? o.closedDate.split("T")[0] : "-",
        "Effectiveness Review Date": o.effectivenessReviewDate ? o.effectivenessReviewDate.split("T")[0] : "-",
        "Effectiveness Status": o.effectivenessStatus || "-",
        "# of Occurrences": o.numberOfOccurrence || 1,
      };
    });

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Occurrences");
    XLSX.writeFile(wb, "occurrences.xlsx");
  };

  // ------------------- PAGINATION -------------------
  const indexOfLast = currentPage * itemsPerPage;
  const indexOfFirst = indexOfLast - itemsPerPage;
  const currentItems = filteredList.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filteredList.length / itemsPerPage) || 1;

  return (
    <div className="occurrence-list-container">
      <h1>Occurrences</h1>

      {showForm && (
        <OccurrenceForm
          initialData={editingOccurrence}
          onUpdateSuccess={handleUpdateSuccess}
          onCancel={() => setShowForm(false)}
        />
      )}

      <div className="filter-container">
        <label>
          From: <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} />
        </label>
        <label>
          To: <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} />
        </label>
        <button onClick={handleFilter}>Filter</button>
        <button onClick={handleExport}>Export to Excel</button>
      </div>

      {loading && <p>Loading...</p>}
      {error && <p className="error">{error}</p>}

      <div className="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>Occurrence Date</th>
              <th>SPI</th>
              <th>Aircraft Model</th>
              <th>Registration #</th>
              <th>Departure</th>
              <th>Arrival</th>
              <th>Flight Phase</th>
              <th>Source</th>
              <th>Risk Score</th>
              <th>Event Description</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {currentItems.length > 0 ? (
              currentItems.map(o => (
                <tr key={o._id}>
                  <td>{o.occurrenceDate ? o.occurrenceDate.split("T")[0] : "-"}</td>
                  <td>{o.spi || "-"}</td>
                  <td>{o.aircraftModel || "-"}</td>
                  <td>{o.aircraftRegistrationNumber || "-"}</td>
                  <td>{o.departureAirport || "-"}</td>
                  <td>{o.arrivalAirport || "-"}</td>
                  <td>{o.flightPhase || "-"}</td>
                  <td>
                    {o.reportSource && o.reportSource.startsWith("/uploads/") ? (
                      <a href={`http://${window.location.hostname}:5000${o.reportSource}`} target="_blank" rel="noopener noreferrer">
                        View
                      </a>
                    ) : (
                      o.reportSource || "-"
                    )}
                  </td>
                  <td>{o.riskScore || "-"}</td>
                  <td className="description-cell">{o.eventDescription || "-"}</td>
                  <td>
                    <div className="action-buttons">
                      <button
                        onClick={() =>
                          navigate("/investigationfollowup", { state: { occurrence: o } })
                        }
                      >
                        Go to Investigation part
                      </button>
                      <button className="delete-btn" onClick={() => handleDelete(o._id)}>Delete</button>
                    </div>
                  </td>

                </tr>
              ))
            ) : !loading ? (
              <tr>
                <td colSpan="7">No occurrences found.</td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>

      {filteredList.length > itemsPerPage && (
        <div className="pagination">
          <button
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
          >
            Previous
          </button>
          <span>
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default OccurrenceList;
