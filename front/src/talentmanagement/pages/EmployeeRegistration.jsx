import React, { useState, useEffect } from "react";
import api from "../../api"; 
import "../../styles/EmployeeRegistration.css"; 

const EmployeeRegistration = () => {
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

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await api.get("/employees/available-users");
        if (response.data.success) {
          setAvailableUsers(response.data.data);
        }
      } catch (err) {
        console.error("Error fetching available users:", err);
      } finally {
        setFetchingUsers(false);
      }
    };
    fetchUsers();
  }, []);

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
  
  // LOG THE DATA BEFORE SENDING
  console.log("Data being sent to server:", formData);

  setLoading(true);
  try {
    const response = await api.post("/employees", formData);
    // ... rest of your code
  } catch (err) {
    // LOG THE SPECIFIC SERVER ERROR
    console.error("Server Response Error:", err.response?.data);
    setMessage({ 
      type: "error", 
      text: err.response?.data?.message || "Check console for details" 
    });
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="registration-container">
      <div className="registration-card">
        <header className="registration-header">
          <h2>Employee Onboarding</h2>
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
              value={formData.userid} 
              onChange={handleChange} 
              required
              disabled={fetchingUsers}
              className="user-select"
            >
              <option value="">{fetchingUsers ? "Loading Staff..." : "-- Choose Staff ID --"}</option>
              {availableUsers.map((user) => (
                <option key={user._id} value={user._id}>
                  {user.userid}
                </option>
              ))}
            </select>
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
              <input type="text" name="currentPosition" value={formData.currentPosition} onChange={handleChange} placeholder="e.g. flight data anlyst" />
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
            {loading ? "Linking..." : "Authorise & Onboard"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default EmployeeRegistration;