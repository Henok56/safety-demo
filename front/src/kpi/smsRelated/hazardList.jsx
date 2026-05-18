// src/kpi/smsRelated/hazardList.jsx
import React, { useState } from "react";
import { 
  FiSearch, FiTrash2, FiEdit2, FiEye, FiChevronLeft, 
  FiChevronRight, FiCalendar, FiAlertCircle
} from "react-icons/fi";
import "../../styles/hazardList.css";

export default function HazardList({ hazards = [], loading = false, onEdit, onDelete, onView }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const formatDate = (date) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric"
    });
  };

  const hazardsArray = Array.isArray(hazards) ? hazards : [];
  
  const filteredHazards = hazardsArray.filter(hazard =>
    hazard?.hazardId?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredHazards.length / itemsPerPage) || 1;
  const paginatedHazards = filteredHazards.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  if (loading) {
    return (
      <div className="hazard-list-loading">
        <div className="spinner"></div>
        <p>Loading hazards...</p>
      </div>
    );
  }

  return (
    <div className="hazard-list-container">
      <div className="list-header">
        <h3>My Hazard History</h3>
        <div className="search-box">
          <FiSearch />
          <input
            type="text"
            placeholder="Search by Hazard ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {filteredHazards.length === 0 ? (
        <div className="empty-state">
          <div className="empty-content">
            <FiAlertCircle size={48} />
            <p>No hazards found</p>
            <span>Start by logging your first hazard using the form above</span>
          </div>
        </div>
      ) : (
        <>
          <div className="table-wrapper">
            <table className="hazard-table">
              <thead>
                <tr>
                  <th>Hazard ID</th>
                  <th>Sequential #</th>
                  <th>Submitted Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedHazards.map((hazard) => (
                  <tr key={hazard._id || hazard.hazardId} className="hazard-row">
                    <td className="hazard-id-cell">
                      <span className="hazard-id-badge">{hazard.hazardId}</span>
                    </td>
                    <td className="sequential-cell">
                      {hazard.sequentialNumber || 'N/A'}
                    </td>
                    <td className="date-cell">
                      <FiCalendar size={12} />
                      {formatDate(hazard.submittedAt)}
                    </td>
                    <td className="actions-cell">
                      {onView && (
                        <button 
                          className="action-btn view-btn"
                          onClick={() => onView(hazard)}
                          title="View Details"
                        >
                          <FiEye /> View
                        </button>
                      )}
                      {onEdit && (
                        <button 
                          className="action-btn edit-btn"
                          onClick={() => onEdit(hazard)}
                          title="Edit"
                        >
                          <FiEdit2 /> Edit
                        </button>
                      )}
                      {onDelete && (
                        <button 
                          className="action-btn delete-btn"
                          onClick={() => onDelete(hazard._id, hazard.hazardId)}
                          title="Delete"
                        >
                          <FiTrash2 /> Delete
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="pagination">
              <div className="pagination-info">
                Showing {(currentPage - 1) * itemsPerPage + 1} - {Math.min(currentPage * itemsPerPage, filteredHazards.length)} of {filteredHazards.length}
              </div>
              <div className="pagination-controls">
                <button 
                  disabled={currentPage === 1} 
                  onClick={() => setCurrentPage(p => p - 1)}
                >
                  <FiChevronLeft /> Previous
                </button>
                <span className="page-number">{currentPage} / {totalPages}</span>
                <button 
                  disabled={currentPage === totalPages} 
                  onClick={() => setCurrentPage(p => p + 1)}
                >
                  Next <FiChevronRight />
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}