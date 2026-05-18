import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import "../styles/TalentComponent.css";

export default function TalentComponent() {
  const [open, setOpen] = useState(false);
  const token = localStorage.getItem("accessToken");
  let role = "";

  try {
    role = token ? jwtDecode(token).role?.toLowerCase() || "" : "";
  } catch {
    role = "";
  }

  const canRegisterEmployees = role === "superadmin" || role === "manager" || role === "user";

  return (
    <div className="talent-nav-wrapper">
      <div className="talent-nav">


        <NavLink to="/admin/talent/dashboard" className="talent-link">
          Talent Dashboard
        </NavLink>

        <NavLink to="/admin/talent/trainingmanager" className="talent-link">
          Register Training
        </NavLink>

       

        <NavLink to="/admin/talent/assign" className="talent-link">
          Assign Training & Growth Initiatives
        </NavLink>
         <NavLink to="/admin/talent/list" className="talent-link">
          Assigned Employee List
        </NavLink>

      </div>
    </div>
  );
}
