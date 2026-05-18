import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../../api"; // Your axios instance
import "../../styles/EmployeeList.css";

const EmployeeList = () => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const res = await api.get("/employees");
      if (res.data.success) {
        // The data comes back with 'userAccount' populated
        setEmployees(res.data.data);
      }
    } catch (err) {
      setError("Failed to fetch employee records.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this record?")) return;
    try {
      const res = await api.delete(`/employees/${id}`);
      if (res.data.success) {
        setEmployees(employees.filter((emp) => emp._id !== id));
        alert(res.data.message);
      }
    } catch (err) {
      alert(err.response?.data?.message || "Delete failed");
    }
  };

  if (loading) return <div className="loading">Updating Staff List...</div>;
  if (error) return <div className="error-msg">{error}</div>;

  return (
    <div className="list-container">
      <div className="list-header">
        <h2>Employee Directory</h2>
        <Link to="/admin/talent/register" className="btn-add">
          Onboard New Staff
        </Link>
      </div>

      <div className="table-responsive">
        <table className="employee-table">
          <thead>
            <tr>
              {/* userid acts as the Registration Number */}
              <th>Staff ID (userid)</th>
              <th>First Name</th>
              <th>Last Name</th>
              <th>Department</th>
              <th>Position</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {employees.length > 0 ? (
              employees.map((emp) => (
                <tr key={emp._id}>
                  {/* 🚩 DATA PULL: Pulling userid from the linked User table */}
                  <td>
                    <strong>{emp.userAccount?.userid || "N/A"}</strong>
                  </td>

                  {/* 🚩 DATA PULL: Pulling common attributes from User table */}
                  <td>{emp.userAccount?.firstname || "—"}</td>
                  <td>{emp.userAccount?.lastname || "—"}</td>

                  <td>{emp.department}</td>
                  <td>{emp.currentPosition}</td>
                  <td>
                    <span className={`status-badge ${emp.status?.toLowerCase()}`}>
                      {emp.status}
                    </span>
                  </td>
                  <td className="actions-cell">
                    <Link to={`/admin/talent/edit/${emp._id}`} className="btn-edit">
                      Edit
                    </Link>
                    <button
                      onClick={() => handleDelete(emp._id)}
                      className="btn-delete"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" className="text-center">
                  No employee records found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default EmployeeList;
