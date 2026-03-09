import React, { useEffect, useState } from "react";
import api from "../api"; 
import { jwtDecode } from "jwt-decode";
import "../styles/AdminUsers.css";

let usersCache = null;

export default function AdminUsers() {
  const [users, setUsers] = useState(usersCache || []);
  const [loading, setLoading] = useState(!usersCache);
  const [currentAdminId, setCurrentAdminId] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      const decoded = jwtDecode(token);
      setCurrentAdminId(decoded.id); // Get own ID to prevent self-lockout
    }
    
    if (usersCache) fetchUsers(true); 
    else fetchUsers(false);
  }, []);

  const fetchUsers = async (isBackground = false) => {
    if (!isBackground) setLoading(true);
    try {
      const res = await api.get("/admin/users");
      const fetchedData = res.data?.data || [];
      setUsers(fetchedData);
      usersCache = fetchedData;
    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      // Optimistic UI Update
      const updated = users.map(u => u._id === userId ? { ...u, role: newRole } : u);
      setUsers(updated);
      
      await api.put(`/admin/users/${userId}/role`, { role: newRole });
    } catch (err) {
      alert("Failed to update role. Reverting...");
      fetchUsers();
    }
  };

  const deleteUser = async (username) => {
    if (!window.confirm(`Permanently delete ${username}?`)) return;
    try {
      setUsers(users.filter(u => u.username !== username));
      await api.delete(`/admin/users/${username}`);
    } catch (err) {
      alert("Delete failed.");
      fetchUsers();
    }
  };

  const roles = ["user", "superadmin", "manager", "team_leader", "fdm_officer", "scheduler"];

  return (
    <div className="admin-users-page">
      <div className="header-section">
        <h2>User Control Panel</h2>
        <p>Manage system access levels and permissions</p>
      </div>

      {loading && !users.length ? (
        <div className="loader-container">
          <div className="spinner"></div>
          <p>Fetching Personnel Data...</p>
        </div>
      ) : (
        <div className="table-container">
          <table className="users-table">
            <thead>
              <tr>
                <th>Personnel (ID/Username)</th>
                <th>Role Assignment</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user._id}>
                  <td className="user-info">
                    <strong>{user.username}</strong>
                    <span>{user.email || "No email provided"}</span>
                  </td>
                  <td>
                    <select 
                      className={`role-select select-${user.role}`}
                      value={user.role}
                      onChange={(e) => handleRoleChange(user._id, e.target.value)}
                      disabled={user._id === currentAdminId}
                    >
                      {roles.map(r => (
                        <option key={r} value={r}>{r.toUpperCase()}</option>
                      ))}
                    </select>
                  </td>
                  <td>
                    <span className={`status-pill ${user.role}`}>
                      {user.role}
                    </span>
                  </td>
                  <td>
                    <button 
                      onClick={() => deleteUser(user.username)} 
                      className="delete-icon-btn"
                      disabled={user._id === currentAdminId}
                      title="Delete User"
                    >
                      🗑️
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}