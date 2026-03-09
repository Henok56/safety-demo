import React, { useState, useEffect } from "react";
// ✅ Added Link to the destructured object
import { NavLink, useNavigate, Link } from "react-router-dom"; 
// ✅ Added Lucide icon import
import { BookOpen } from "lucide-react"; 
import api from "../api";
import "../styles/Nav.css";

export default function Nav() {
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showOccurrenceDropdown, setShowOccurrenceDropdown] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dropdownNode, setDropdownNode] = useState(null);

  // --- CLICK OUTSIDE TO CLOSE DROPDOWN ---
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownNode && !dropdownNode.contains(e.target)) {
        setShowOccurrenceDropdown(false);
      }
    };
    if (showOccurrenceDropdown) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showOccurrenceDropdown, dropdownNode]);

  // --- AUTH CHECK ---
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await api.get("/auth/me");
        const role = res.data.data.role; 

        const privilegedRoles = [
          "superadmin", "manager", "team_leader", "fdm_officer", "scheduler"
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
        <button className="nav-btn" onClick={() => navigate(-1)}>← Back</button>
        <button className="nav-btn mobile-toggle" onClick={() => setMobileMenuOpen(prev => !prev)}>
          ☰
        </button>
      </div>

      <h1 className="home-title">
        Ethiopian Airlines Flight Ops Safety Office
      </h1>

      <nav className={`nav-right ${mobileMenuOpen ? "open" : ""}`}>
        {/* Occurrence Dropdown */}
        <div className="dropdown" ref={(node) => setDropdownNode(node)}>
          <button
            className={`nav-btn main-btn ${showOccurrenceDropdown ? "active" : ""}`}
            onClick={() => setShowOccurrenceDropdown((prev) => !prev)}
          >
            Occurrence ▼
          </button>

          {showOccurrenceDropdown && (
            <ul className="dropdown-content">
              <li><NavLink to="/form" onClick={() => setShowOccurrenceDropdown(false)}>Form</NavLink></li>
              <li><NavLink to="/list" onClick={() => setShowOccurrenceDropdown(false)}>List</NavLink></li>
              <li><NavLink to="/trends" onClick={() => setShowOccurrenceDropdown(false)}>Trend</NavLink></li>
            </ul>
          )}
        </div>

        <NavLink to="/schedule" className={({ isActive }) => isActive ? "nav-btn main-btn active" : "nav-btn main-btn"}>
          Schedule List
        </NavLink>

        {isAdmin && (
          <NavLink to="/admin" className={({ isActive }) => isActive ? "nav-btn main-btn active" : "nav-btn main-btn"}>
            Admin Dashboard
          </NavLink>
        )}

        {/* ✅ My Training Link works now that Link and BookOpen are imported */}
        <Link to="/talent/my-training" className="nav-button-link">
          <button className="my-training-btn">
            <BookOpen size={18} />
            My Training
          </button>
        </Link>

        <button className="nav-btn logout-btn" onClick={handleLogout} style={{ backgroundColor: "#dc2626" }}>
          Logout
        </button>
      </nav>
    </header>
  );
}