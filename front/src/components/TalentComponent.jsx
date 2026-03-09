import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import "../styles/TalentComponent.css";

export default function TalentComponent() {
  const [open, setOpen] = useState(false);

  const toggleDropdown = () => {
    setOpen(!open);
  };

  const closeDropdown = () => {
    setOpen(false);
  };

  return (
    <div className="talent-nav-wrapper">
      <div className="talent-nav">
        <NavLink to="/admin" className="talent-link">Admin Home Page</NavLink>
        <NavLink to="/talent/dashboard" className="talent-link">Talent Dashboard</NavLink>
        <NavLink to="/talent/trainingmanager" className="talent-link">Training Manager</NavLink>
        <NavLink to="/talent/register" className="talent-link">Employee Registration</NavLink>
        <NavLink to="/talent/list" className="talent-link">Employee List</NavLink>
        <NavLink to="/talent/assign" className="talent-link">Assign Training & Growth Initiatives </NavLink>
      </div>
    </div>
  );
}
