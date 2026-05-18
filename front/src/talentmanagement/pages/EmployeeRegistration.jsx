// C:\Users\HenokGs\Desktop\office_projects\front\src\talentmanagement\pages\EmployeeRegistration.jsx
import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import api from "../../api";
import "../../styles/EmployeeRegistration.css"; 

const EmployeeRegistration = ({ onSuccess, isModal = false, onClose, preSelectedUser }) => {
  const [searchParams] = useSearchParams();
  const preSelectedUserId = searchParams.get("userId");

  const [formData, setFormData] = useState({
    userAccount: "", 
    costCenter: "",
    currentPosition: "",
    department: "",
    dateOfJoining: "",
    status: "active",
  });

  const [availableUsers, setAvailableUsers] = useState([]); 
  const [selectedUser, setSelectedUser] = useState(null); 
  const [loading, setLoading] = useState(false);
  const [fetchingUsers, setFetchingUsers] = useState(true);
  const [message, setMessage] = useState({ type: "", text: "" });

  const fetchUsers = async () => {
    setFetchingUsers(true);
    try {
      const response = await api.get("/employees/available-users");
      if (response.data.success) {
        setAvailableUsers(response.data.data);
        
        // If preSelectedUser is provided, auto-select them after users are loaded
        if (preSelectedUser && !formData.userAccount) {
          const matchedUser = response.data.data.find(u => u._id === preSelectedUser._id);
          if (matchedUser) {
            setFormData(prev => ({ ...prev, userAccount: matchedUser._id }));
            setSelectedUser(matchedUser);
          }
        }

        // If the route has a query userId, try to pre-select it
        if (preSelectedUserId && !formData.userAccount) {
          const matchedUserById = response.data.data.find(u => u._id === preSelectedUserId);
          if (matchedUserById) {
            setFormData(prev => ({ ...prev, userAccount: matchedUserById._id }));
            setSelectedUser(matchedUserById);
          }
        }
      }
    } catch (err) {
      console.error("Error fetching available users:", err);
      setMessage({
        type: "error",
        text: err.response?.data?.message || "Unable to load available staff.",
      });
    } finally {
      setFetchingUsers(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Handle preSelectedUser when it changes
  useEffect(() => {
    if (preSelectedUser && availableUsers.length > 0 && !formData.userAccount) {
      const matchedUser = availableUsers.find(u => u._id === preSelectedUser._id);
      if (matchedUser) {
        setFormData(prev => ({ ...prev, userAccount: matchedUser._id }));
        setSelectedUser(matchedUser);
      }
    }
  }, [preSelectedUser, availableUsers]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name === "userAccount") {
      // Find the user object in the list
      const user = availableUsers.find(u => u._id === value);
      
      setFormData((prev) => ({ ...prev, userAccount: value }));
      
      // 🚩 IMPORTANT: Use 'firstname' and 'lastname' exactly as they appear in your JSON
      setSelectedUser(user || null);
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    setLoading(true);
    setMessage({ type: "", text: "" });
    try {
      const response = await api.post("/employees", formData);
      setMessage({
        type: "success",
        text: response.data?.message || "Employee onboarded successfully.",
      });
      setFormData({
        userAccount: "",
        costCenter: "",
        currentPosition: "",
        department: "",
        dateOfJoining: "",
        status: "active",
      });
      setSelectedUser(null);
      await fetchUsers();
      
      // ✅ Call onSuccess callback if provided (for modal usage)
      if (onSuccess && typeof onSuccess === 'function') {
        // Small delay to show success message before closing
        setTimeout(() => {
          onSuccess(response.data);
        }, 1500);
      }
    } catch (err) {
      console.error("Server Response Error:", err.response?.data);
      setMessage({ 
        type: "error", 
        text: err.response?.data?.message || "Employee Registration failed." 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`registration-container ${isModal ? 'modal-version' : ''}`}>
      <div className="registration-card">
        <header className="registration-header">
          <h2>Register Employee</h2>
          {isModal && onClose && (
            <button className="modal-close-btn-custom" onClick={onClose}>×</button>
          )}
        </header>

        {message.text && (
          <div className={`alert ${message.type}`}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit} className="registration-form">
          <div className="form-group full-width">
            <label>Select Staff ID (Reg No.)*</label>
            <select 
              name="userAccount" 
              value={formData.userAccount} 
              onChange={handleChange} 
              required
              disabled={fetchingUsers || (preSelectedUser && formData.userAccount)}
              className="user-select"
            >
              <option value="">{fetchingUsers ? "Loading Staff..." : "-- Choose Staff ID --"}</option>
              {availableUsers.map((user) => (
                <option key={user._id} value={user._id}>
                  {user.userid} - {user.firstname} {user.lastname}
                </option>
              ))}
            </select>
            {preSelectedUser && formData.userAccount && (
              <small className="hint-text">Staff ID pre-selected for registration</small>
            )}
          </div>

          {/* PREVIEW BOX: Displays firstname/lastname from User table JSON */}
          {selectedUser && (
            <div className="staff-preview-box">
              <div className="form-row">
                <div className="form-group">
                  <label>First Name (from User Table)</label>
                  <input 
                    type="text" 
                    value={selectedUser.firstname} 
                    readOnly 
                    className="read-only-input" 
                  />
                </div>
                <div className="form-group">
                  <label>Last Name (from User Table)</label>
                  <input 
                    type="text" 
                    value={selectedUser.lastname} 
                    readOnly 
                    className="read-only-input" 
                  />
                </div>
              </div>
              <small className="info-text">Identity managed by Security Database</small>
            </div>
          )}

          <div className="form-row">
            <div className="form-group">
              <label>Department</label>
              <input type="text" name="department" value={formData.department} onChange={handleChange} placeholder="e.g. Flight Ops" />
            </div>
            <div className="form-group">
              <label>Current Position</label>
              <input type="text" name="currentPosition" value={formData.currentPosition} onChange={handleChange} placeholder="e.g. flight data analyst" />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Cost Center</label>
              <input type="text" name="costCenter" value={formData.costCenter} onChange={handleChange} placeholder="CC-101" />
            </div>
            <div className="form-group">
              <label>Date of Joining</label>
              <input type="date" name="dateOfJoining" value={formData.dateOfJoining} onChange={handleChange} />
            </div>
          </div>

          <div className="form-group">
            <label>Status</label>
            <select name="status" value={formData.status} onChange={handleChange}>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="on-leave">On Leave</option>
            </select>
          </div>

          <button type="submit" className="submit-btn" disabled={loading || !formData.userAccount}>
            {loading ? "Linking..." : "Register"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default EmployeeRegistration;