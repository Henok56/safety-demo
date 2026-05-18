import React from "react";
import { FiInfo, FiShield, FiUsers, FiClock, FiCheckCircle } from "react-icons/fi";
import "../styles/Sla.css";

const RolesPage = () => {
  return (
    <div className="roles-container">
      <div className="page-header">
        <FiInfo className="header-icon" />
        <h1>Roles & Responsibilities</h1>
      </div>

      <div className="page-description-card">
        <p>
          This page serves as a reference document that defines the <strong>roles, responsibilities, 
          and accountability</strong> of various departments and positions within the organization's 
          safety management structure.
        </p>
      </div>

      <div className="info-grid">
        <div className="info-card">
          <FiShield className="card-icon" />
          <h3>What is displayed here?</h3>
          <p>In a production environment, this page would show:</p>
          <ul>
            <li>Department-specific responsibilities</li>
            <li>Key performance indicators (KPIs)</li>
            <li>Service Level Agreement (SLA) targets</li>
            <li>Escalation paths and reporting lines</li>
          </ul>
        </div>

        <div className="info-card">
          <FiUsers className="card-icon" />
          <h3>Who is responsible for what?</h3>
          <p>This page defines accountability for:</p>
          <ul>
            <li>Flight Data Monitoring (FDM) processes</li>
            <li>Safety Management System (SMS) compliance</li>
            <li>Incident investigation coordination</li>
            <li>Data quality and integrity management</li>
          </ul>
        </div>

        <div className="info-card">
          <FiClock className="card-icon" />
          <h3>Service Level Expectations</h3>
          <p>This page sets expectations for:</p>
          <ul>
            <li>Response times for data requests</li>
            <li>Data delivery deadlines</li>
            <li>Investigation support timelines</li>
            <li>Quality assurance metrics</li>
          </ul>
        </div>

        <div className="info-card">
          <FiCheckCircle className="card-icon" />
          <h3>Why this page exists</h3>
          <p>To ensure:</p>
          <ul>
            <li>Clear understanding of duties across departments</li>
            <li>No gaps or overlaps in responsibilities</li>
            <li>Accountability for safety-related tasks</li>
            <li>Efficient cross-functional coordination</li>
          </ul>
        </div>
      </div>

      <div className="demo-notice">
        <p>
          <strong>Note:</strong> This is a demonstration version. The actual page would contain 
          detailed role definitions and responsibilities specific to each department.
        </p>
      </div>
    </div>
  );
};

export default RolesPage;