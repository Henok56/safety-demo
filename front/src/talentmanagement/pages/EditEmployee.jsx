/* eslint-disable */
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../api";
import "../../styles/EditEmployee.css";

export default function EditEmployee() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    regNo: "",
    department: "",
    remark: "pending",
    status: "active",
  });

  useEffect(() => {
    const fetchEmployee = async () => {
      try {
        const res = await api.get(`/employees/${id}`);
        const emp = res.data.data;
        
        // Mapping nested userAccount data to the form fields
        setFormData({
          firstName: emp.userAccount?.firstname || "",
          lastName: emp.userAccount?.lastname || "",
          regNo: emp.userAccount?.userid || "", 
          department: emp.department || "",
          remark: emp.remark || "pending",
          status: emp.status || "active",
        });
      } catch (err) {
        console.error("Fetch Error:", err);
        alert("Employee records could not be retrieved.");
        navigate("/admin/talent/list");
      } finally {
        setLoading(false);
      }
    };
    fetchEmployee();
  }, [id, navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.put(`/employees/${id}`, formData);
      alert("Employee record updated successfully!");
      navigate("/admin/talent/list");
    } catch (err) {
      alert("Update failed: " + (err.response?.data?.message || "Server Error"));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return (
    <div className="edit-loader-container">
      <div className="spinner"></div>
      <p>Retrieving Staff Records...</p>
    </div>
  );

  return (
    <div className="edit-employee-page">
      <div className="edit-card">
        <div className="edit-header">
          <h2>Update Employee Profile</h2>
          <p>Editing: <strong>{formData.firstName} {formData.lastName}</strong></p>
        </div>

        <form onSubmit={handleSubmit} className="edit-form">
          <div className="form-grid">
            <div className="form-group">
              <label>First Name</label>
              <input type="text" name="firstName" value={formData.firstName} onChange={handleChange} required />
            </div>

            <div className="form-group">
              <label>Last Name</label>
              <input type="text" name="lastName" value={formData.lastName} onChange={handleChange} required />
            </div>

            <div className="form-group">
              <label>Staff ID (Reg No)</label>
              <input type="text" name="regNo" value={formData.regNo} onChange={handleChange} required />
            </div>

            <div className="form-group">
              <label>Department</label>
              <input type="text" name="department" value={formData.department} onChange={handleChange} />
            </div>

            <div className="form-group">
              <label>Employment Status</label>
              <select name="status" value={formData.status} onChange={handleChange}>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="on-leave">On Leave</option>
              </select>
            </div>

           
          </div>

          <div className="form-actions">
            <button type="button" className="cancel-btn" onClick={() => navigate("/admin/talent/list")}>
              Discard Changes
            </button>
            <button type="submit" className="save-btn" disabled={submitting}>
              {submitting ? "Processing..." : "Commit Updates"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
