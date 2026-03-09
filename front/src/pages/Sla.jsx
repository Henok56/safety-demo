import React from "react";
import '../styles/Sla.css';

const RolesPage = () => {
  return (
    <div className="roles-container">
      <h1>Roles and Responsibilities</h1>

      <section>
        <h2>Flight Operations Safety Office</h2>
        <ul>
          <li>Oversee the implementation of safety protocols.</li>
          <li>Provide training and resources for safety compliance.</li>
          <li>Provide documents, procedures, manuals etc. for ongoing investigation.</li>
          <li>Avail personnel for accident/incident investigation.</li>
          <li>Provide FDA results, associated data, and reports as needed.</li>
        </ul>
      </section>

      <section>
        <h2>Manager MRO QMS & SMS</h2>
        <ul>
          <li>Communicate with MRO team for required data and provide to investigation team.</li>
          <li>Handle hazard and safety reports not recorded in MLB on SMS within timeframe.</li>
        </ul>
      </section>

      <section>
        <h2>Director LMT (Manager Line Maintenance)</h2>
        <ul>
          <li>Download CVR, DFDR, QAR data for FDM within 12 hours of occurrence.</li>
          <li>Ensure downloaded data is fully delivered to MCC.</li>
          <li>Mitigate data loss due to human negligence.</li>
          <li>Provide updates on design/procedural changes affecting the data server.</li>
          <li>Respond promptly to all data quality–related queries.</li>
        </ul>
      </section>

      <section>
        <h2>Director LMT (Manager MCC)</h2>
        <ul>
          <li>Upload DFDR data to MRO server for analysis and notify Manager ASE.</li>
          <li>Ensure downloaded data is fully delivered from Line Maintenance.</li>
          <li>Mitigate data loss due to human negligence.</li>
          <li>Provide updates on design/procedural changes affecting the data server.</li>
          <li>Respond promptly to all data quality–related queries.</li>
        </ul>
      </section>

      <section>
        <h2>Director ASE (Manager Systems Engineering)</h2>
        <ul>
          <li>Perform DFDR analysis and provide analysis data.</li>
          <li>Ensure downloaded data is fully delivered from MCC.</li>
          <li>Mitigate data loss due to human negligence.</li>
          <li>Provide updates on design/procedural changes affecting the data server.</li>
          <li>Respond promptly to all data quality–related queries.</li>
        </ul>
      </section>
    </div>
  );
};

export default RolesPage;
