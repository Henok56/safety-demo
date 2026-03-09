import React from "react";
import "../styles/About.css";

const AboutPage = () => {
  return (
    <div className="about-container">
      <h1 className="about-title">
        Flight Operations Safety Office – Overview
      </h1>

      <p className="about-intro">
        The Flight Operations Safety Office is responsible for ensuring the safe
        conduct of flight operations across the organization. Its primary role
        is to identify safety hazards, assess operational risks, and promote
        continuous improvement in aviation safety.
      </p>

      <section className="about-section">
        <h2>Key Responsibilities</h2>

        <div className="about-card">
          <h3>Flight Data Monitoring (FDM) / Flight Data Analysis</h3>
          <ul>
            <li>
              Includes a dedicated Flight Data Analysis Team responsible for
              monitoring and analyzing flight data.
            </li>
            <li>
              Identifies trends, deviations, and potential safety risks in
              flight operations.
            </li>
            <li>
              Uses findings to prevent incidents and enhance operational
              procedures.
            </li>
          </ul>
        </div>

        <div className="about-card">
          <h3>Safety Management System (SMS)</h3>
          <ul>
            <li>
              Manages and supports the organization’s Safety Management System.
            </li>
            <li>
              Covers safety reporting, safety assurance, safety promotion, and
              regulatory compliance.
            </li>
            <li>
              Promotes a proactive, non-punitive safety culture.
            </li>
          </ul>
        </div>

        <div className="about-card">
          <h3>Safety Risk Management (SRM)</h3>
          <ul>
            <li>Conducts hazard identification and risk assessments.</li>
            <li>
              Evaluates and mitigates risks through corrective and preventive
              actions.
            </li>
            <li>
              Tracks safety recommendations to ensure effectiveness.
            </li>
          </ul>
        </div>

        <div className="about-card">
          <h3>Coordination and Collaboration</h3>
          <ul>
            <li>
              Works closely with Flight Operations, Corporate Offices, and other
              operational and support departments.
            </li>
            <li>
              Ensures safety considerations are integrated into all operational
              and organizational decisions.
            </li>
          </ul>
        </div>
      </section>
    </div>
  );
};

export default AboutPage;
