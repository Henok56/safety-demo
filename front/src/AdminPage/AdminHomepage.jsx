import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import "../styles/AdminHomepage.css";

export default function AdminHomepage() {
  const navigate = useNavigate();

  // Auth checks are handled by AdminRoute wrapping this component
  // useEffect(() => { ... }, []);

  return (
    <div className="admin-homepage">
      <header className="admin-hero">
        <h1>Welcome, Admin!</h1>
        <h2>Manage your system efficiently and responsibly.</h2>
      </header>

      <section className="admin-guidelines">
        <div className="guideline-card">
          <h3>✅ What You Can Do</h3>
          <ul>
            <li>View and manage all registered users.</li>
            <li>Promote users to admin or remove users when necessary.</li>
            <li>Create, update, and monitor schedules.</li>
            <li>Access audit logs to review user activity and changes.</li>
            <li>Ensure system integrity, security, and compliance.</li>
            <li>Manage Talent Management System.</li>
          </ul>
        </div>

        <div className="guideline-card">
          <h3>❌ What You Should Not Do</h3>
          <ul>
            <li>Make changes that could disrupt system functionality.</li>
            <li>Bypass security measures or authentication.</li>
            <li>Use admin privileges for personal gain.</li>
          </ul>
        </div>
      </section>
    </div>
  );
}
