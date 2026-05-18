import React, { useMemo } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import {
  FaUsers,
  FaClipboardList,
  FaCalendarAlt,
  FaPlus,
  FaTachometerAlt,
  FaUserPlus,
  FaPlane,
  FaClock,
  FaHandshake,
  FaSync,
  FaExclamationTriangle,
  FaChartLine,
  FaList,
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
        <div className="nav-divider">Talent Related Pages</div>
        
        {/* Talent Management */}
        {hasAccess(["superadmin", "manager", "team_leader", "user"]) && (
          <NavLink 
            to="/admin/talent/dashboard" 
            className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}
          >
            <span className="link-text">Talent Management</span>
            <FaUsers size={20} />
          </NavLink>
        )}

        {/* Employee Registration - Superadmin Only */}
        {hasAccess(["superadmin", "user"]) && (
          <NavLink 
            to="/admin/talent/register" 
            className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}
          >
            <span className="link-text">Register Employee Profile</span>
            <FaUserPlus size={20} />
          </NavLink>
        )}

        {/* ==================== ACCOUNT RELATED PAGES ==================== */}
        {hasAccess(["superadmin", "manager", "team_leader", "user"]) && (
          <>
            <div className="nav-divider">Account Related Pages</div>

            {/* User Management - Superadmin Only */}
            {hasAccess(["superadmin", "user"]) && (
              <NavLink 
                to="/admin/users" 
                className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}
              >
                <span className="link-text">User Control</span>
                <FaUsers size={20} />
              </NavLink>
            )}

            {/* User Registration (Register.jsx) - Superadmin Only */}
            {hasAccess(["superadmin", "user"]) && (
              <NavLink 
                to="/admin/register-user" 
                className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}
              >
                <span className="link-text">Register User Account</span>
                <FaUserPlus size={20} />
              </NavLink>
            )}
          </>
        )}

        {/* ==================== KPI & OPERATIONS ==================== */}
        {hasAccess(["superadmin", "manager", "team_leader", "user"]) && (
          <>
            <div className="nav-divider">KPI Related Pages</div>

            <NavLink
              to="/kpi/fleet-assignment"
              className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}
            >
              <span className="link-text">Fleet Assignment</span>
              <FaPlane size={20} />
            </NavLink>

            <NavLink
              to="/kpi/unproductive-time"
              className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}
            >
              <span className="link-text">Unproductive Time</span>
              <FaClock size={20} />
            </NavLink>

            {/* FDM Monitoring (Synced Events) */}
            <NavLink
              to="/admin/fdm-monitoring"
              className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}
            >
              <span className="link-text">FDM Monitoring</span>
              <FaSync size={20} />
            </NavLink>

            {/* Corporate Culture Compliance */}
            <NavLink
              to="/kpi/corporate-culture"
              className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}
            >
              <span className="link-text">Corporate Culture</span>
              <FaHandshake size={20} />
            </NavLink>

            
            {/* SMS Dashboard (Main) */}
            <NavLink
              to="/kpi/sms/dashboard"
              className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}
            >
              <span className="link-text">SMS Dashboard</span>
              <FaChartLine size={20} />
            </NavLink>
          </>
        )}

        {/* Schedule Management */}
        {hasAccess(["superadmin", "manager", "scheduler", "team_leader", "user"]) && (
          <>
            <div className="nav-divider">Schedules</div>
            <NavLink 
              to="/admin/schedules/create" 
              className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}
            >
              <span className="link-text">Create Schedule</span>
              <FaPlus size={20} />
            </NavLink>

            <NavLink 
              to="/admin/schedulelist" 
              className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}
            >
              <span className="link-text">Update Schedule</span>
              <FaCalendarAlt size={20} />
            </NavLink>
          </>
        )}

        {/* Audit Logs 
        {hasAccess(["superadmin", "manager", "team_leader", "user"]) && (
          <NavLink 
            to="/admin/audit" 
            className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}
          >
            <span className="link-text">Audit Logs</span>
            <FaClipboardList size={20} />
          </NavLink>
        )}*/}
      </nav>
    </aside>
  );
}