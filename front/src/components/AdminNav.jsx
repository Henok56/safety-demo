import React, { useMemo } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import {
  FaUsers,
  FaClipboardList,
  FaCalendarAlt,
  FaPlus,
  FaChartLine,
  FaTachometerAlt
} from "react-icons/fa";
import "../styles/AdminNav.css";

export default function AdminNav() {
  const navigate = useNavigate();
  const token = localStorage.getItem("accessToken");

  const userRole = useMemo(() => {
    if (!token) return null;
    try {
      const decoded = jwtDecode(token);
      return decoded.role?.toLowerCase();
    } catch (err) {
      return null;
    }
  }, [token]);

  const hasAccess = (allowedRoles) => allowedRoles.includes(userRole);

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <aside className="admin-nav">
      <div className="admin-nav-header">
        <button className="home-btn" onClick={() => navigate("/admin")}>
          <FaTachometerAlt style={{ marginRight: "5px" }} /> Admin Panel
        </button>
      </div>

      <button className="home-btn" onClick={() => navigate("/dashboard")}>
        🏠 Back to Home
      </button>

      <button
        className="home-btn"
        style={{ marginTop: "10px", backgroundColor: "#dc2626" }}
        onClick={handleLogout}
      >
        🚪 Logout
      </button>

      <nav className="admin-nav-links">
        
        {/* FDM Followup: Superadmin, Manager, FDM Officer
        {hasAccess(["superadmin", "manager", "fdm_officer"]) && (
          <NavLink to="/fdm" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>
            <span className="link-text">FDM Followup</span>
            <FaUsers size={20} />
          </NavLink>
        )} */}

        {/* Talent Management: Scheduler REMOVED (Strictly Management Roles) */}
        {hasAccess(["superadmin", "manager", "team_leader"]) && (
          <NavLink to="/talent/dashboard" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>
            <span className="link-text">Talent Management</span>
            <FaUsers size={20} />
          </NavLink>
        )}

        {/* User Management: Superadmin ONLY */}
        {hasAccess(["superadmin"]) && (
          <NavLink to="/admin/users" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>
            <span className="link-text">User Control</span>
            <FaUsers size={20} />
          </NavLink>
        )}

        {/* Schedule Management: Includes Scheduler */}
        {hasAccess(["superadmin", "manager", "scheduler", "team_leader"]) && (
          <>
            <div className="nav-divider">Schedules</div>
            <NavLink to="/admin/schedules/create" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>
              <span className="link-text">Create Schedule</span>
              <FaPlus size={20} />
            </NavLink>

            <NavLink to="/admin/schedulelist" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>
              <span className="link-text">Update Schedule</span>
              <FaCalendarAlt size={20} />
            </NavLink>

            <NavLink to="/admin/scheduletrend" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>
              <span className="link-text">Schedule Trend</span>
              <FaChartLine size={20} />
            </NavLink>
          </>
        )}

        {/* Audit Logs: Management visibility only */}
        {hasAccess(["superadmin", "manager", "team_leader"]) && (
          <NavLink to="/admin/audit" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>
            <span className="link-text">Audit Logs</span>
            <FaClipboardList size={20} />
          </NavLink>
        )}

      </nav>
    </aside>
  );
}