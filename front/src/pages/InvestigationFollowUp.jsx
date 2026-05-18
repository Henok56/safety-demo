// InvestigationFollowUp.jsx
import React, { useState, useEffect } from "react";
import api from "../api";
import "../styles/InvestigationFollowUp.css";

// --- Fields for the original Occurrence (Context) ---
const occurrenceInitialState = {
  occurrenceDate: "",
  location: "", // Keep for legacy/UI, but backend uses occurrenceLocation? Check mapping.
  occurrenceLocation: "", // Add this to match schema
  flightNumber: "",
  aircraftModel: "", // Required
  aircraftType: "", // Keep if used, but model is the required one
  aircraftRegistrationNumber: "", // Was 'registration', fixed to match schema
  flightPhase: "", // Required
  reportSource: "", // Required
  riskScore: "", // Named riskRating in schema? Schema says riskRating. Form says riskScore. Let's support both or fix. 
  riskRating: "", // Schema name
  eventTitle: "",
  eventDescription: "",
  spi: "",
};

// --- Fields for Investigation Follow Up ---
const investigationInitialState = {
  responsibleDivision: "",
  responsibleSection: "",
  statusCategory: "",
  documentationStatus: "",
  remarksEvidenceFileId: "",
  investigationReportReference: "",
  investigationTitle: "",
  investigationCompletionDate: "",
  primaryCauses: "",
  contributingFactors: "",
  findings: "",
  numberOfRecommendations: "",
  recommendationsList: "",
  releaseDate: "",
  recommendationDueDate: "",
  closureStatus: "",
  closedDate: "",
  effectivenessReviewDate: "",
  effectivenessStatus: "",
};

const TEXTAREA_FIELDS = [
  "primaryCauses",
  "contributingFactors",
  "findings",
  "recommendationsList",
  "eventDescription", // Added description as textarea
];

// Helper: format date for input type="date"
const formatDateForInput = (date) => {
  if (!date) return "";
  const d = new Date(date);
  if (isNaN(d.getTime())) return "";
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  const year = d.getFullYear();
  return `${year}-${month}-${day}`;
};

// Helper: label formatting
const toLabel = (key) =>
  key.replace(/([A-Z])/g, " $1").replace(/^./, (str) => str.toUpperCase());

export default function InvestigationFollowUp({ initialData, occurrenceId, onBack }) {
  // We keep occurrence fields and investigation fields in one state object for simplicity,
  // or separate them. Merging them makes submission easier since we send everything.
  const [formData, setFormData] = useState({
    ...occurrenceInitialState,
    ...investigationInitialState,
  });

  const [loading, setLoading] = useState(false);

  // Pre-fill form
  useEffect(() => {
    if (initialData) {
      setFormData({
        ...occurrenceInitialState,
        ...investigationInitialState,
        ...initialData,
        // Map potential mismatched keys from initialData if they exist
        aircraftRegistrationNumber: initialData.aircraftRegistrationNumber || initialData.registration || "",
        occurrenceLocation: initialData.occurrenceLocation || initialData.location || "",
        riskRating: initialData.riskRating || initialData.riskScore || "",
        // Format Dates
        occurrenceDate: formatDateForInput(initialData.occurrenceDate),
        investigationCompletionDate: formatDateForInput(initialData.investigationCompletionDate),
        releaseDate: formatDateForInput(initialData.releaseDate),
        recommendationDueDate: formatDateForInput(initialData.recommendationDueDate),
        closedDate: formatDateForInput(initialData.closedDate),
        effectivenessReviewDate: formatDateForInput(initialData.effectivenessReviewDate),
      });
    }
  }, [initialData]);

  const handleChange = (name, value) => {
    if (name === "reportSource" && value.target && value.target.files) {
      setFormData((prev) => ({ ...prev, reportSource: value.target.files[0] }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const data = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
        // Special handling for dates
        const dateFields = [
          "occurrenceDate",
          "investigationCompletionDate",
          "releaseDate",
          "recommendationDueDate",
          "closedDate",
          "effectivenessReviewDate"
        ];
        if (dateFields.includes(key) && value) {
          data.append(key, new Date(value).toISOString());
        } else if (key === "reportSource" && typeof value === "string") {
          // If it's a string, it's an existing file path, don't append it to FormData 
          // unless you want to preserve it. Multipurpose: if value is File, append it.
          // If it's a string, we can send it or the backend can ignore if no req.file.
          data.append(key, value);
        } else {
          data.append(key, value);
        }
      }
    });

    try {
      await api.put(`/occurrences/${occurrenceId}`, data, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      alert("Investigation & Occurrence details submitted successfully!");
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || err.message || "Submission failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="occurrence-page">
      <div className="occurrence-form-container premium-form">
        <div className="form-header">
          <button type="button" onClick={onBack} className="back-btn">
            ← Back
          </button>
          <h1>📝 Investigation & Follow-up</h1>
        </div>

        <form onSubmit={handleSubmit}>
          {/* --- SECTION 1: OCCURRENCE DETAILS (EDITABLE) --- */}
          <section className="form-section context-section">
            <h3 className="section-title">Occurrence Details (Context)</h3>
            <div className="form-grid">
              {Object.keys(occurrenceInitialState).map((key) => (
                <FormField
                  key={key}
                  name={key}
                  label={toLabel(key)}
                  type={key.includes("Date") ? "date" : "text"}
                  value={formData[key]}
                  onChange={(e) => handleChange(key, e.target.value)}
                  textarea={TEXTAREA_FIELDS.includes(key)}
                />
              ))}
            </div>
          </section>

          {/* --- SECTION 2: INVESTIGATION DETAILS --- */}
          <section className="form-section investigation-section">
            <h3 className="section-title">Investigation Data</h3>
            <div className="form-grid">
              {Object.keys(investigationInitialState).map((key) => (
                <FormField
                  key={key}
                  name={key}
                  label={toLabel(key)}
                  type={
                    key.toLowerCase().includes("date")
                      ? "date"
                      : key === "numberOfRecommendations"
                        ? "number"
                        : "text"
                  }
                  value={formData[key]}
                  onChange={(e) => handleChange(key, e.target.value)}
                  textarea={TEXTAREA_FIELDS.includes(key)}
                />
              ))}
            </div>
          </section>

          <div className="form-actions">
            <button type="submit" disabled={loading} className="submit-btn primary-btn">
              {loading ? "Submitting..." : "Save All Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// FormField component
const FormField = ({ label, name, type, value, onChange, textarea }) => (
  <div className="form-field">
    <label>{label}</label>
    {textarea ? (
      <textarea
        name={name}
        value={value || ""}
        onChange={onChange}
        placeholder={`Enter ${label}`}
        rows={4}
      />
    ) : name === "reportSource" ? (
      <div className="file-upload-wrapper">
        <input
          type="file"
          name={name}
          onChange={onChange}
        />
        {typeof value === "string" && value.startsWith("/uploads/") && (
          <span className="current-file">
            Current file: <a href={`http://${window.location.hostname}:4000${value}`} target="_blank" rel="noopener noreferrer">View</a>
          </span>
        )}
      </div>
    ) : (
      <input
        type={type}
        name={name}
        value={value || ""}
        onChange={onChange}
        placeholder={`Enter ${label}`}
      />
    )}
  </div>
);
