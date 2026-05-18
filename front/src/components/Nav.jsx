// C:\Users\HenokGs\Desktop\demoproject\front\src\components\Nav.jsx
import React, { useState, useEffect } from "react";
import { NavLink, useNavigate, Link } from "react-router-dom";
import { BookOpen } from "lucide-react";
import { FaChartLine } from "react-icons/fa";
import { FiAlertTriangle, FiGrid, FiList } from "react-icons/fi"; // Added relevant icons
import api from "../api";
import "../styles/Nav.css";

export default function Nav() {
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showSmsDropdown, setShowSmsDropdown] = useState(false); // Controlled drop-down state
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dropdownNode, setDropdownNode] = useState(null);

  // --- CLICK OUTSIDE TO CLOSE DROPDOWN ---
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownNode && !dropdownNode.contains(e.target)) {
        setShowSmsDropdown(false);
      }
    };
    if (showSmsDropdown) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showSmsDropdown, dropdownNode]);

  // --- AUTH CHECK ---
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await api.get("/auth/me");
        const role = res.data.data.role; 

        const privilegedRoles = [
          "superadmin", "manager", "team_leader", "fdm_officer", "scheduler", "user"
        ];
        
        setIsAdmin(privilegedRoles.includes(role));
      } catch (err) {
        console.error("Auth check failed:", err);
        navigate("/login", { replace: true });
      } finally {
        setLoading(false);
      }
    };
    checkAuth();
  }, [navigate]);

  // --- LOGOUT ---
  const handleLogout = async () => {
    try {
      await api.post("/auth/logout");
    } catch (err) {
      console.error("Logout failed:", err);
    } finally {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("user");
      navigate("/login", { replace: true });
    }
  };

  if (loading) return <p className="nav-loading">Loading...</p>;

  return (
    <header className="home-nav">
      <div className="nav-left">
        <button className="nav-btn" onClick={() => navigate("/dashboard")}>← Back</button>
        <button className="nav-btn mobile-toggle" onClick={() => setMobileMenuOpen(prev => !prev)}>
          ☰
        </button>
      </div>

      <h1 className="home-title">
        Ethiopian Airlines Flight Ops Safety Office
      </h1>

      <nav className={`nav-right ${mobileMenuOpen ? "open" : ""}`}>
       <NavLink to="/kpi/sms/form" className={({ isActive }) => isActive ? "nav-btn main-btn active" : "nav-btn main-btn"}>
         Register Hazard
        </NavLink>


        <NavLink to="/schedule" className={({ isActive }) => isActive ? "nav-btn main-btn active" : "nav-btn main-btn"}>
          Schedule List
        </NavLink>

        <NavLink to="/scheduletrend" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>
          <span className="link-text">Schedule Trend</span>
          <FaChartLine size={20} />
        </NavLink>

        {/* My Training Link */}
        <Link to="/talent/my-training" className="nav-button-link">
          <button className="my-training-btn">
            <BookOpen size={18} />
            My Training
          </button>
        </Link>

        {isAdmin && (
          <NavLink to="/admin" className={({ isActive }) => isActive ? "nav-btn main-btn active" : "nav-btn main-btn"}>
            Admin Dashboard
          </NavLink>
        )}

        <button className="nav-btn logout-btn" onClick={handleLogout} style={{ backgroundColor: "#dc2626" }}>
          Logout
        </button>
      </nav>
    </header>
  );
}