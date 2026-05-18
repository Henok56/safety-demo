// src/kpi/smsRelated/hazardAlertBox.jsx
import React from "react";
import { FiAlertCircle, FiX, FiUser, FiCalendar, FiClock } from "react-icons/fi";
import "../../styles/hazardalertbox.css";

export default function HazardAlertBox({ duplicateData, onClose }) {
  const formatDate = (date) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  return (
    <div className="alert-box-overlay">
      <div className="alert-box">
        <div className="alert-box-header">
          <FiAlertCircle className="alert-icon" />
          <h3>Duplicate Hazard Detected!</h3>
          <button className="alert-close" onClick={onClose}>
            <FiX />
          </button>
        </div>
        
        <div className="alert-box-body">
          <p className="alert-message">{duplicateData?.message}</p>
          
          <div className="alert-details">
            <h4>Existing Hazard Details:</h4>
            
            <div className="detail-row">
              <div className="detail-icon">
                <FiAlertCircle />
              </div>
              <div className="detail-content">
                <span className="detail-label">Hazard ID:</span>
                <strong className="detail-value">{duplicateData?.data?.hazardId}</strong>
              </div>
            </div>
            
            <div className="detail-row">
              <div className="detail-icon">
                <FiUser />
              </div>
              <div className="detail-content">
                <span className="detail-label">Logged By:</span>
                <span className="detail-value">
                  {duplicateData?.data?.loggedBy?.firstname} {duplicateData?.data?.loggedBy?.lastname}
                </span>
              </div>
            </div>
            
            <div className="detail-row">
              <div className="detail-icon">
                <FiCalendar />
              </div>
              <div className="detail-content">
                <span className="detail-label">Submitted Date:</span>
                <span className="detail-value">
                  {formatDate(duplicateData?.data?.submittedAt)}
                </span>
              </div>
            </div>
            
            <div className="detail-row">
              <div className="detail-icon">
                <FiClock />
              </div>
              <div className="detail-content">
                <span className="detail-label">Recorded On:</span>
                <span className="detail-value">
                  {formatDate(duplicateData?.data?.createdAt)}
                </span>
              </div>
            </div>
          </div>
          
          <div className="alert-actions">
            <button className="btn-primary" onClick={onClose}>
              I Understand
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}