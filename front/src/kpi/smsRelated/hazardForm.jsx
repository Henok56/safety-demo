// src/kpi/smsRelated/hazardForm.jsx
import React, { useState, useEffect } from "react";
import { 
  FiPlus, FiAlertCircle, FiCheckCircle, FiX, FiCalendar, FiInfo, FiUser,
  FiList, FiEye, FiClock, FiHash
} from "react-icons/fi";
import hazardTrackingApi from "../../api/hazardTrackingApi";
import "../../styles/hazardForm.css";

export default function HazardForm({ onSuccess, user }) {
  const [formData, setFormData] = useState({
    sequentialNumber: "",
    submittedAt: new Date().toISOString().split("T")[0]
  });
  const [submitting, setSubmitting] = useState(false);
  const [duplicateAlert, setDuplicateAlert] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [validationError, setValidationError] = useState(null);
  const [generatedHazardId, setGeneratedHazardId] = useState("");
  const [currentUser, setCurrentUser] = useState(null);
  
  // Modal state
  const [showHazardsModal, setShowHazardsModal] = useState(false);
  const [myHazards, setMyHazards] = useState([]);
  const [loadingHazards, setLoadingHazards] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      try {
        const decoded = JSON.parse(atob(token.split(".")[1]));
        setCurrentUser(decoded);
      } catch (e) {
        console.error("Error decoding token:", e);
      }
    }
  }, []);

  const getCurrentMonthYear = () => {
    const now = new Date();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const year = now.getFullYear();
    return `${month}${year}`;
  };

  const generateHazardId = (sequentialNumber) => {
    if (!sequentialNumber || sequentialNumber.trim() === "") return "";
    const currentMMYYYY = getCurrentMonthYear();
    return `HAZ-FLT-${sequentialNumber}-${currentMMYYYY}`;
  };

  const handleSequentialNumberChange = (e) => {
    const value = e.target.value.replace(/[^0-9]/g, '');
    setFormData(prev => ({ ...prev, sequentialNumber: value }));
    
    if (value && value.length > 0) {
      setGeneratedHazardId(generateHazardId(value));
      setValidationError(null);
    } else {
      setGeneratedHazardId("");
    }
  };

  const loadMyHazards = async () => {
    setLoadingHazards(true);
    try {
      const response = await hazardTrackingApi.getMyHistory();
      if (response?.success) {
        setMyHazards(response.data?.all || []);
      }
    } catch (error) {
      console.error("Error loading hazards:", error);
    } finally {
      setLoadingHazards(false);
    }
  };

  const openHazardsModal = () => {
    loadMyHazards();
    setShowHazardsModal(true);
  };

  const closeHazardsModal = () => {
    setShowHazardsModal(false);
  };

  const formatDate = (date) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric"
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.sequentialNumber.trim()) {
      setValidationError("Please enter the Hazard Sequential Number");
      return;
    }
    
    if (!/^\d+$/.test(formData.sequentialNumber)) {
      setValidationError("Sequential number must contain only digits");
      return;
    }
    
    setSubmitting(true);
    setDuplicateAlert(null);
    setValidationError(null);
    
    try {
      const response = await hazardTrackingApi.logHazard({
        sequentialNumber: formData.sequentialNumber,
        submittedAt: formData.submittedAt
      });
      
      if (response.success) {
        setSuccessMessage(response.message);
        setFormData({
          sequentialNumber: "",
          submittedAt: new Date().toISOString().split("T")[0]
        });
        setGeneratedHazardId("");
        
        if (onSuccess) onSuccess();
        
        setTimeout(() => setSuccessMessage(null), 5000);
      }
    } catch (error) {
      console.error("Submit error:", error);
      if (error.response?.status === 409) {
        setDuplicateAlert(error.response.data);
      } else if (error.response?.status === 400) {
        setValidationError(error.response?.data?.message || "Invalid format. Please check your input.");
      } else {
        setValidationError(error.response?.data?.message || "Failed to log hazard. Please try again.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const displayName = currentUser ? `${currentUser.firstname || ''} ${currentUser.lastname || ''}`.trim() : (user?.firstname || 'User');

  return (
    <>
      <div className="hazard-form-container">
        <div className="form-header">
          <FiPlus />
          <h3>Report New Hazard</h3>
          <button className="my-hazards-btn" onClick={openHazardsModal}>
            <FiList /> My Hazards
          </button>
        </div>

        <div className="user-info-badge">
          <FiUser />
          <span>Reporting as: <strong>{displayName || 'Employee'}</strong></span>
        </div>

        <div className="info-box">
          <FiInfo />
          <div>
            <strong>How it works:</strong>
            <p>Enter only the sequential number. The system will auto-generate the full Hazard ID.</p>
            <div className="format-example">
              <span>You enter:</span>
              <code>3773</code>
              <span>→ Generates:</span>
              <code>HAZ-FLT-3773-{getCurrentMonthYear()}</code>
            </div>
          </div>
        </div>

        {successMessage && (
          <div className="form-success">
            <FiCheckCircle />
            <span>{successMessage}</span>
            <button onClick={() => setSuccessMessage(null)}><FiX /></button>
          </div>
        )}

        {validationError && (
          <div className="form-error">
            <FiAlertCircle />
            <span>{validationError}</span>
            <button onClick={() => setValidationError(null)}><FiX /></button>
          </div>
        )}

        {duplicateAlert && (
          <div className="duplicate-alert-box">
            <div className="alert-header">
              <FiAlertCircle />
              <h4>Duplicate Hazard Detected!</h4>
              <button onClick={() => setDuplicateAlert(null)}><FiX /></button>
            </div>
            <div className="alert-body">
              <p>{duplicateAlert.message}</p>
              <div className="duplicate-info">
                <div className="info-row">
                  <span>Hazard ID:</span>
                  <strong>{duplicateAlert.data?.hazardId}</strong>
                </div>
                <div className="info-row">
                  <span>Logged By:</span>
                  <strong>{duplicateAlert.data?.loggedBy?.firstname} {duplicateAlert.data?.loggedBy?.lastname}</strong>
                </div>
                <div className="info-row">
                  <span>Date:</span>
                  <strong>{new Date(duplicateAlert.data?.submittedAt).toLocaleDateString()}</strong>
                </div>
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="hazard-form">
          <div className="form-group">
            <label>Hazard Sequential Number *</label>
            <input
              type="text"
              value={formData.sequentialNumber}
              onChange={handleSequentialNumberChange}
              placeholder="Enter sequential number (e.g., 3773)"
              className="sequential-input"
              autoFocus
            />
            <small>Enter only numbers. The system will add HAZ-FLT prefix and current month/year</small>
          </div>

          {generatedHazardId && (
            <div className="generated-id-box">
              <label>Generated Hazard ID:</label>
              <div className="generated-id">{generatedHazardId}</div>
            </div>
          )}

          <div className="form-group">
            <label>Submission Date</label>
            <input
              type="date"
              name="submittedAt"
              value={formData.submittedAt}
              onChange={(e) => setFormData(prev => ({ ...prev, submittedAt: e.target.value }))}
              className="date-input"
            />
          </div>

          <button 
            type="submit" 
            className="submit-btn"
            disabled={submitting || !formData.sequentialNumber}
          >
            {submitting ? (
              <>
                <div className="spinner-small"></div>
                Reporting Hazard...
              </>
            ) : (
              <>
                <FiPlus /> Report Hazard
              </>
            )}
          </button>
        </form>
      </div>

      {/* Hazards List Modal */}
      {showHazardsModal && (
        <div className="modal-overlay" onClick={closeHazardsModal}>
          <div className="hazards-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>
                <FiList /> My Hazard Reports
              </h3>
              <button className="modal-close" onClick={closeHazardsModal}>
                <FiX />
              </button>
            </div>
            <div className="modal-body">
              {loadingHazards ? (
                <div className="loading-hazards">
                  <div className="spinner-small"></div>
                  <p>Loading your hazards...</p>
                </div>
              ) : myHazards.length === 0 ? (
                <div className="empty-hazards">
                  <FiAlertCircle size={48} />
                  <p>No hazards reported yet</p>
                  <span>Use the form above to report your first hazard</span>
                </div>
              ) : (
                <div className="hazards-list">
                  <div className="hazards-stats">
                    <div className="stat-badge">
                      <FiHash />
                      <span>Total: {myHazards.length}</span>
                    </div>
                  </div>
                  <div className="hazards-table-wrapper">
                    <table className="hazards-table">
                      <thead>
                        <tr>
                          <th>Hazard ID</th>
                          <th>Submitted Date</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {myHazards.map((hazard) => (
                          <tr key={hazard._id}>
                            <td className="hazard-id">
                              <span className="hazard-id-tag">{hazard.hazardId}</span>
                            </td>
                            <td className="date">
                              <FiClock size={12} />
                              {formatDate(hazard.submittedAt)}
                            </td>
                            <td>
                              <span className={`status-badge ${hazard.status === 'active' ? 'active' : 'archived'}`}>
                                {hazard.status || 'active'}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button className="close-modal-btn" onClick={closeHazardsModal}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}