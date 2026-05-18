import React from "react";
import { NavLink } from "react-router-dom";
import "../styles/UnproductiveTimeNav.css";

export default function UnproductiveTimeNav() {
  return (
    <div className="ut-page-nav">
      <NavLink to="/kpi/unproductive-time" end>
        Overview
      </NavLink>
      <NavLink to="/kpi/unproductive-time/dashboard">
        Dashboard
      </NavLink>
      <NavLink to="/kpi/unproductive-time/timer">
        Start Timer
      </NavLink>
      <NavLink to="/kpi/unproductive-time/list">
        Records
      </NavLink>
      <NavLink to="/kpi/unproductive-time/approval">
        Approval
      </NavLink>
    </div>
  );
}
