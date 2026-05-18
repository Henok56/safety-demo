import React from "react";
import { FiInfo, FiShield, FiTrendingUp, FiUsers, FiTarget, FiBookOpen } from "react-icons/fi";
import "../styles/About.css";

const AboutPage = () => {
  return (
    <div className="about-container">
      <div className="about-header">
        <FiInfo className="header-icon" />
        <h1 className="about-title">Flight Operations Safety Office</h1>
      </div>

      <div className="page-description-card">
        <p>
          This page provides an overview of the <strong>Flight Operations Safety Office</strong> - 
          its purpose, key functions, and how it contributes to aviation safety.
        </p>
      </div>

      <div className="info-grid">
        <div className="info-card">
          <FiShield className="card-icon" />
          <h3>What is this page about?</h3>
          <p>This page describes the role and responsibilities of the Flight Operations Safety Office in maintaining aviation safety standards.</p>
        </div>

        <div className="info-card">
          <FiTrendingUp className="card-icon" />
          <h3>Flight Data Monitoring (FDM)</h3>
          <p>This section would explain how flight data is analyzed to identify trends, deviations, and potential safety risks in flight operations.</p>
          <ul>
            <li>Data analysis processes</li>
            <li>Trend identification</li>
            <li>Preventive measures</li>
          </ul>
        </div>

        <div className="info-card">
          <FiBookOpen className="card-icon" />
          <h3>Safety Management System (SMS)</h3>
          <p>This section covers the organization's approach to safety reporting, assurance, promotion, and regulatory compliance.</p>
          <ul>
            <li>Safety reporting</li>
            <li>Safety assurance</li>
            <li>Regulatory compliance</li>
          </ul>
        </div>

        <div className="info-card">
          <FiTarget className="card-icon" />
          <h3>Safety Risk Management (SRM)</h3>
          <p>This section explains how hazards are identified, risks are assessed, and corrective actions are implemented.</p>
          <ul>
            <li>Hazard identification</li>
            <li>Risk assessment</li>
            <li>Corrective actions</li>
          </ul>
        </div>

        <div className="info-card">
          <FiUsers className="card-icon" />
          <h3>Coordination & Collaboration</h3>
          <p>This section describes how the Safety Office works with other departments to integrate safety into operational decisions.</p>
          <ul>
            <li>Cross-departmental coordination</li>
            <li>Safety integration</li>
            <li>Operational support</li>
          </ul>
        </div>
      </div>

      <div className="demo-notice">
        <p>
          <strong>Note:</strong> This is a demonstration version. The actual page would contain 
          detailed information about the Flight Operations Safety Office's specific functions, 
          processes, and safety initiatives.
        </p>
      </div>
    </div>
  );
};

export default AboutPage;