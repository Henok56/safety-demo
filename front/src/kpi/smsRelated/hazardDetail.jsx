// src/kpi/smsRelated/hazardDetail.jsx
import React from "react";
import { 
  FiX, FiUser, FiCalendar, FiClock, FiInfo, 
  FiCheckCircle, FiAlertCircle, FiEdit2
} from "react-icons/fi";
import "../../styles/hazardDetail.css";

export default function HazardDetail({ hazard, onClose, onEdit }) {
  const formatDate = (date) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  const getStatusBadge = (status) => {
    if (status === 'active') {
      return { icon: <FiCheckCircle />, class: 'status-active', text: 'Active' };
    }
    return { icon: <FiAlertCircle />, class: 'status-archived', text: 'Archived' };
  };

  const status = getStatusBadge(hazard?.status);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="detail-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Hazard Details</h3>
          <button className="modal-close" onClick={onClose}>
            <FiX />
          </button>
        </div>
        
        <div className="modal-body">
          <div className="detail-header">
            <div className="hazard-id-large">{hazard?.hazardId}</div>
            <div className={`status-badge ${status.class}`}>
              {status.icon} {status.text}
            </div>
          </div>

          <div className="detail-section">
            <h4>Submission Information</h4>
            <div className="detail-grid">
              <div className="detail-item">
                <FiUser />
                <div>
                  <label>Submitted By</label>
                  <span>{hazard?.loggedBy || "System User"}</span>
                </div>
              </div>
              <div className="detail-item">
                <FiCalendar />
                <div>
                  <label>Submission Date</label>
                  <span>{formatDate(hazard?.submittedAt)}</span>
                </div>
              </div>
              <div className="detail-item">
                <FiClock />
                <div>
                  <label>Logged On</label>
                  <span>{formatDate(hazard?.createdAt)}</span>
                </div>
              </div>
              <div className="detail-item">
                <FiInfo />
                <div>
                  <label>Month/Year</label>
                  <span>{hazard?.monthYear}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="detail-section">
            <h4>Sequential Information</h4>
            <div className="detail-grid">
              <div className="detail-item">
                <FiInfo />
                <div>
                  <label>Sequential Number</label>
                  <span>{hazard?.sequentialNumber || "N/A"}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="detail-section">
            <h4>Audit Trail</h4>
            <div className="detail-grid">
              <div className="detail-item">
                <FiClock />
                <div>
                  <label>Last Updated</label>
                  <span>{formatDate(hazard?.updatedAt)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn-secondary" onClick={onClose}>
            Close
          </button>
          {onEdit && (
            <button className="btn-primary" onClick={() => onEdit(hazard)}>
              <FiEdit2 /> Edit
            </button>
          )}
        </div>
      </div>
    </div>
  );
}