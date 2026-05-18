import React, { useEffect, useState } from "react";
import {
  approveEntry,
  getEntries,
  rejectEntry,
} from "../../api/unproductiveTimeApi";
import UnproductiveTimeNav from "../../components/UnproductiveTimeNav";
import { 
  FiCheckCircle, FiXCircle, FiClock, FiUser, FiTag, 
  FiCalendar, FiAlertCircle, FiRefreshCw, FiEye
} from "react-icons/fi";
import "../../styles/UnproductiveTimeApproval.css";

const getEmployeeName = (employee) =>
  employee?.name ||
  [employee?.firstname, employee?.lastname].filter(Boolean).join(" ") ||
  employee?.regNo ||
  "-";

const formatHours = (value) => Number(value || 0).toFixed(2);

export default function UnproductiveTimeApproval({ refreshKey = 0, showNav = true }) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [processingId, setProcessingId] = useState(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [showRejectModal, setShowRejectModal] = useState(null);

  const fetchReadyForApproval = async () => {
    setLoading(true);
    try {
      const [stoppedRes, autoStoppedRes] = await Promise.all([
        getEntries({ status: "stopped" }),
        getEntries({ status: "auto_stopped" }),
      ]);
      setData([
        ...(stoppedRes.data?.data || []),
        ...(autoStoppedRes.data?.data || []),
      ]);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to load approval records");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReadyForApproval();
  }, [refreshKey]);

  const approve = async (id) => {
    setProcessingId(id);
    try {
      await approveEntry(id);
      await fetchReadyForApproval();
    } catch (err) {
      alert(err.response?.data?.message || "Approve failed");
    } finally {
      setProcessingId(null);
    }
  };

  const reject = async (id) => {
    if (!rejectionReason.trim()) {
      alert("Please provide a rejection reason");
      return;
    }
    
    setProcessingId(id);
    try {
      await rejectEntry(id, { reason: rejectionReason });
      setShowRejectModal(null);
      setRejectionReason("");
      await fetchReadyForApproval();
    } catch (err) {
      alert(err.response?.data?.message || "Reject failed");
    } finally {
      setProcessingId(null);
    }
  };

  const openRejectModal = (id) => {
    setShowRejectModal(id);
    setRejectionReason("");
  };

  const cancelReject = () => {
    setShowRejectModal(null);
    setRejectionReason("");
  };

  // Calculate stats
  const totalEntries = data.length;
  const totalHours = data.reduce((sum, item) => sum + (item.finalHoursLost || 0), 0);

  return (
    <div className="approval-dashboard">
      {showNav && <UnproductiveTimeNav />}

      {/* Header */}
      <div className="approval-header">
        <div className="header-left">
          <div className="header-icon">✓</div>
          <div>
            <h1>Approval Panel</h1>
            <p>Review and validate unproductive time entries</p>
          </div>
        </div>
        <button className="refresh-btn" onClick={fetchReadyForApproval}>
          <FiRefreshCw /> Refresh
        </button>
      </div>

      {/* Stats Cards */}
      <div className="approval-stats">
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#e0f2fe' }}>
            <FiClock />
          </div>
          <div className="stat-content">
            <span className="stat-label">Pending Approval</span>
            <span className="stat-value">{totalEntries}</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#fef3c7' }}>
            <FiAlertCircle />
          </div>
          <div className="stat-content">
            <span className="stat-label">Total Hours</span>
            <span className="stat-value">{formatHours(totalHours)}h</span>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading approval requests...</p>
        </div>
      )}

      {/* Approval Cards Grid */}
      {!loading && (
        <div className="approval-grid">
          {data.length === 0 ? (
            <div className="empty-state">
              <div className="empty-content">
                <FiCheckCircle size={64} />
                <h3>All Caught Up!</h3>
                <p>No pending approval requests at this time</p>
              </div>
            </div>
          ) : (
            data.map((item) => (
              <div key={item._id} className="approval-card">
                <div className="card-status-badge">
                  <span className={`status-badge status-${item.status}`}>
                    {item.status === 'stopped' ? 'Manual Stop' : 'Auto Stop'}
                  </span>
                </div>
                
                <div className="card-content">
                  <div className="employee-section">
                    <div className="employee-avatar">
                      <FiUser size={24} />
                    </div>
                    <div className="employee-info">
                      <h3>{getEmployeeName(item.employee)}</h3>
                      <span className="employee-type">{item.type}</span>
                    </div>
                  </div>

                  <div className="details-grid">
                    <div className="detail-item">
                      <FiCalendar className="detail-icon" />
                      <div className="detail-info">
                        <span className="detail-label">Start Time</span>
                        <span className="detail-value">
                          {new Date(item.startTime).toLocaleString()}
                        </span>
                      </div>
                    </div>
                    
                    <div className="detail-item">
                      <FiClock className="detail-icon" />
                      <div className="detail-info">
                        <span className="detail-label">End Time</span>
                        <span className="detail-value">
                          {item.endTime ? new Date(item.endTime).toLocaleString() : '-'}
                        </span>
                      </div>
                    </div>
                    
                    <div className="detail-item highlight">
                      <FiAlertCircle className="detail-icon" />
                      <div className="detail-info">
                        <span className="detail-label">Total Hours Lost</span>
                        <span className="detail-value hours">
                          {formatHours(item.finalHoursLost)} hours
                        </span>
                      </div>
                    </div>
                  </div>

                  {item.reason && (
                    <div className="reason-section">
                      <label>Reason Provided:</label>
                      <p>{item.reason}</p>
                    </div>
                  )}
                </div>

                <div className="card-actions">
                  <button 
                    className="approve-btn"
                    onClick={() => approve(item._id)}
                    disabled={processingId === item._id}
                  >
                    {processingId === item._id ? (
                      <div className="btn-spinner"></div>
                    ) : (
                      <>
                        <FiCheckCircle /> Approve
                      </>
                    )}
                  </button>
                  <button 
                    className="reject-btn"
                    onClick={() => openRejectModal(item._id)}
                    disabled={processingId === item._id}
                  >
                    <FiXCircle /> Reject
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="modal-overlay" onClick={cancelReject}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Reject Entry</h3>
              <button className="modal-close" onClick={cancelReject}>×</button>
            </div>
            <div className="modal-body">
              <label>Rejection Reason</label>
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Please provide a reason for rejection..."
                rows={4}
                autoFocus
              />
            </div>
            <div className="modal-footer">
              <button className="cancel-modal-btn" onClick={cancelReject}>
                Cancel
              </button>
              <button 
                className="confirm-reject-btn"
                onClick={() => reject(showRejectModal)}
                disabled={!rejectionReason.trim()}
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}