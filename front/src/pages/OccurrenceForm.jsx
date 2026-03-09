// OccurrenceForm.jsx
import React, { useState, useEffect } from "react";
import Select from "react-select";
import api from "../api";
import "../styles/OccurrenceForm.css";
import { tailNumbers, airports, spiOptions, flightPhaseOptionsList } from "../constants/occurrenceConstants";

const initialState = {
  spi: "",
  taxonomyCategoryL4: "",
  taxonomyName: "",
  occurrenceDate: "",
  aircraftModel: "",
  departureAirport: "",
  arrivalAirport: "",
  occurrenceLocation: "",
  aircraftRegistrationNumber: "",
  flightPhase: "",
  reportSource: "",
  riskScore: "",
  riskRating: "",
  eventDescription: "",
  investigationTitle: "",
  closureStatus: "",
  responsibleSection: "",
};


export default function OccurrenceLogging({ initialData, onUpdateSuccess, onCancel }) {
  const [formData, setFormData] = useState(initialState);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (initialData) {
      const sanitized = {};
      Object.keys(initialState).forEach(key => {
        sanitized[key] = initialData[key] ?? initialState[key];
      });
      if (initialData.occurrenceDate) {
        sanitized.occurrenceDate = initialData.occurrenceDate.split("T")[0];
      }
      setFormData(sanitized);
    } else {
      setFormData(initialState);
    }
  }, [initialData]);

  const handleChange = (name, value) => {
    if (name === "reportSource" && value.target && value.target.files) {
      setFormData(prev => ({ ...prev, reportSource: value.target.files[0] }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);

    const data = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      if (key.startsWith("_") && key !== "_id") return;
      if (value !== null && value !== undefined) data.append(key, value);
    });

    try {
      if (initialData && initialData._id) {
        await api.put(`/occurrences/${initialData._id}`, data, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        alert("Occurrence updated.");
        if (onUpdateSuccess) onUpdateSuccess();
      } else {
        await api.post("/occurrences", data, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        alert("Occurrence information logged.");
        setFormData(initialState);
        const fileInput = document.querySelector('input[type="file"]');
        if (fileInput) fileInput.value = "";
      }
    } catch (error) {
      console.error("Submission error:", error);
      alert(error.response?.data?.message || "Submission failed.");
    } finally {
      setLoading(false);
    }
  };

  /* Helper for react-select options */
  const toSelectOptions = arr => arr.map(item => ({ label: item, value: item }));

  return (
    <div className="occurrence-page">
      <div className="occurrence-form-container">
        <h1>Occurrence Information Logging</h1>
        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            {/* SPI */}
            <label>
              SPI
              <Select
                options={toSelectOptions(spiOptions)}
                value={toSelectOptions(spiOptions).find(o => o.value === formData.spi) || null}
                onChange={opt => handleChange("spi", opt ? opt.value : "")}
                isClearable
              />
            </label>

            <label>
              Taxonomy Category L4
              <input
                value={formData.taxonomyCategoryL4}
                onChange={e => handleChange("taxonomyCategoryL4", e.target.value)}
              />
            </label>

            <label>
              Taxonomy Name
              <input
                value={formData.taxonomyName}
                onChange={e => handleChange("taxonomyName", e.target.value)}
              />
            </label>

            <label>
              Occurrence Date
              <input
                type="date"
                value={formData.occurrenceDate}
                onChange={e => handleChange("occurrenceDate", e.target.value)}
              />
            </label>

            {/* Aircraft Model */}
            <label>
              Aircraft Model
              <Select
                options={toSelectOptions(Object.keys(tailNumbers))}
                value={toSelectOptions(Object.keys(tailNumbers)).find(o => o.value === formData.aircraftModel) || null}
                onChange={opt => {
                  handleChange("aircraftModel", opt ? opt.value : "");
                  handleChange("aircraftRegistrationNumber", ""); // Reset tail number
                }}
                isClearable
              />
            </label>

            {/* Tail Number */}
            <label>
              Aircraft Registration Number
              <Select
                options={formData.aircraftModel ? toSelectOptions(tailNumbers[formData.aircraftModel]) : []}
                value={formData.aircraftRegistrationNumber ? { label: formData.aircraftRegistrationNumber, value: formData.aircraftRegistrationNumber } : null}
                onChange={opt => handleChange("aircraftRegistrationNumber", opt ? opt.value : "")}
                isClearable
                isDisabled={!formData.aircraftModel}
              />
            </label>

            {/* Airports */}
            <label>
              Departure Airport
              <Select
                options={toSelectOptions(airports)}
                value={toSelectOptions(airports).find(o => o.value === formData.departureAirport) || null}
                onChange={opt => handleChange("departureAirport", opt ? opt.value : "")}
                isClearable
              />
            </label>

            <label>
              Arrival Airport
              <Select
                options={toSelectOptions(airports)}
                value={toSelectOptions(airports).find(o => o.value === formData.arrivalAirport) || null}
                onChange={opt => handleChange("arrivalAirport", opt ? opt.value : "")}
                isClearable
              />
            </label>

            <label>
              Occurrence Location
              <input
                value={formData.occurrenceLocation}
                onChange={e => handleChange("occurrenceLocation", e.target.value)}
              />
            </label>

            {/* Flight Phase */}
            <label>
              Flight Phase
              <Select
                options={toSelectOptions(flightPhaseOptionsList)}
                value={toSelectOptions(flightPhaseOptionsList).find(o => o.value === formData.flightPhase) || null}
                onChange={opt => handleChange("flightPhase", opt ? opt.value : "")}
                isClearable
              />
            </label>

            {/* Report Source */}
            <label>
              Report Source
              <input type="file" onChange={e => handleChange("reportSource", e)} />
            </label>

            <label>
              Risk Score
              <input
                value={formData.riskScore}
                onChange={e => handleChange("riskScore", e.target.value)}
              />
            </label>

            <label>
              Event Description
              <textarea
                value={formData.eventDescription}
                onChange={e => handleChange("eventDescription", e.target.value)}
              />
            </label>
          </div>

          <div className="form-actions" style={{ display: 'flex', gap: '10px' }}>
            <button type="submit" disabled={loading}>
              {loading ? "Submitting..." : (initialData ? "Update Occurrence" : "Submit Occurrence")}
            </button>
            {onCancel && (
              <button type="button" onClick={onCancel} className="cancel-btn">
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
