import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";
import "../styles/OccurrenceTrend.css";

import {
  ComposedChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  LabelList,
  Scatter,
  Legend,
} from "recharts";

import html2canvas from "html2canvas";

export default function OccurrenceTrend() {
  const navigate = useNavigate();
  const chartRef = useRef();

  const [occurrences, setOccurrences] = useState([]);
  const [mode, setMode] = useState("month");
  const [reductionTarget, setReductionTarget] = useState(25);
  const [validationError, setValidationError] = useState("");

  const [filters, setFilters] = useState({
    month1: "",
    month2: "",
    range1Start: "",
    range1End: "",
    range2Start: "",
    range2End: "",
  });

  /* ---------------- FETCH DATA ---------------- */
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get("/occurrences");
        setOccurrences(res.data.data || []);
      } catch (err) {
        console.error(err);
        navigate("/login");
      }
    };
    fetchData();
  }, [navigate]);

  /* ---------------- UTILS ---------------- */
  const normalize = (d) => {
    if (!d) return null;
    const date = new Date(d);
    return isNaN(date.getTime()) ? null : date.toISOString().split("T")[0];
  };

  const formatMonth = (m) => {
    if (!m) return "";
    const [y, mo] = m.split("-");
    const date = new Date(y, mo - 1);
    return date.toLocaleString("default", { month: "long", year: "numeric" });
  };

  /* ---------------- VALIDATION ---------------- */
  useEffect(() => {
    setValidationError("");

    if (mode === "month") {
      if (!filters.month1 || !filters.month2) {
        setValidationError("Please select both months.");
      } else if (filters.month1 === filters.month2) {
        setValidationError("First and second month must be different.");
      }
    }

    if (mode === "date") {
      const { range1Start, range1End, range2Start, range2End } = filters;

      if (!range1Start || !range1End || !range2Start || !range2End) {
        setValidationError("Please select all date ranges.");
      } else if (range1End < range1Start) {
        setValidationError("Range 1 end date must be after start date.");
      } else if (range2End < range2Start) {
        setValidationError("Range 2 end date must be after start date.");
      }
    }
  }, [filters, mode]);

  /* ---------------- PROCESS DATA ---------------- */
  const range1Data = {};
  const range2Data = {};

  if (!validationError) {
    occurrences.forEach((o) => {
      if (!o.spi || !o.occurrenceDate) return;

      const occ = normalize(o.occurrenceDate);
      if (!occ) return;

      if (mode === "month") {
        const d = new Date(o.occurrenceDate);
        const [y1, m1] = filters.month1.split("-").map(Number);
        const [y2, m2] = filters.month2.split("-").map(Number);

        if (d.getFullYear() === y1 && d.getMonth() + 1 === m1) {
          range1Data[o.spi] = (range1Data[o.spi] || 0) + 1;
        }
        if (d.getFullYear() === y2 && d.getMonth() + 1 === m2) {
          range2Data[o.spi] = (range2Data[o.spi] || 0) + 1;
        }
      }

      if (mode === "date") {
        const r1s = normalize(filters.range1Start);
        const r1e = normalize(filters.range1End);
        const r2s = normalize(filters.range2Start);
        const r2e = normalize(filters.range2End);

        if (occ >= r1s && occ <= r1e) {
          range1Data[o.spi] = (range1Data[o.spi] || 0) + 1;
        }
        if (occ >= r2s && occ <= r2e) {
          range2Data[o.spi] = (range2Data[o.spi] || 0) + 1;
        }
      }
    });
  }

  const chartData = Array.from(
    new Set([...Object.keys(range1Data), ...Object.keys(range2Data)])
  ).map((spi) => {
    const r1 = range1Data[spi] || 0;
    const r2 = range2Data[spi] || 0;
    const expected = Math.max(0, r1 * (1 - reductionTarget / 100)); // Target Value

    return {
      spi,
      first: r1,
      second: r2,
      limit: expected, // The horizontal line level
      notReduced: r1 > 0 && r2 > expected, // Flag for failure
      percent: r1 === 0 ? "" : `${(((r2 - r1) / r1) * 100).toFixed(1)}%`,
    };
  });

  /* ---------------- CUSTOM SHAPE FOR HORIZONTAL LINE ---------------- */
  const TargetLineShape = (props) => {
    const { cx, cy, payload } = props;
    if (!cx || !cy) return null;

    // Only show the red spike line if target is NOT met (notReduced is true)
    if (!payload.notReduced) return null;

    const width = 60; // Approximate bar width
    return (
      <g>
        <line
          x1={cx - width / 2}
          y1={cy}
          x2={cx + width / 2}
          y2={cy}
          stroke="#dc2626"
          strokeWidth={4}
        />
        <text x={cx} y={cy - 10} textAnchor="middle" fill="#dc2626" fontSize={12} fontWeight="bold">
          Target ({Math.round(payload.limit)})
        </text>
      </g>
    );
  };

  /* ---------------- EXPORT PNG ---------------- */
  const exportPNG = async () => {
    const canvas = await html2canvas(chartRef.current);
    const link = document.createElement("a");
    link.download = "occurrence-trend.png";
    link.href = canvas.toDataURL();
    link.click();
  };

  const label1 =
    mode === "month"
      ? formatMonth(filters.month1)
      : `${filters.range1Start} → ${filters.range1End}`;
  const label2 =
    mode === "month"
      ? formatMonth(filters.month2)
      : `${filters.range2Start} → ${filters.range2End}`;

  return (
    <div className="occurrence-trend-page">
      <div className="page-header">
        <h2>Occurrence Trend Analysis</h2>

        <div className="header-actions">
          <select value={mode} onChange={(e) => setMode(e.target.value)}>
            <option value="month">Month</option>
            <option value="date">Date Range</option>
          </select>

          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <label style={{ fontSize: '13px', fontWeight: '500' }}>Target Reduction %:</label>
            <input
              type="number"
              min="1"
              max="100"
              value={reductionTarget}
              onChange={(e) => setReductionTarget(+e.target.value)}
              title="Reduction Target (%)"
              style={{ width: '60px' }}
            />
          </div>

          <button onClick={exportPNG}>Download PNG</button>
        </div>
      </div>

      {/* FILTERS */}
      <div className="filters-card compact">
        {mode === "month" ? (
          <>
            <div className="filter-group">
              <label>Period 1:</label>
              <input
                type="month"
                value={filters.month1}
                onChange={(e) =>
                  setFilters({ ...filters, month1: e.target.value })
                }
              />
            </div>
            <div className="filter-group">
              <label>Period 2:</label>
              <input
                type="month"
                value={filters.month2}
                onChange={(e) =>
                  setFilters({ ...filters, month2: e.target.value })
                }
              />
            </div>
          </>
        ) : (
          <>
            <div className="filter-group">
              <label>Range 1 Start:</label>
              <input
                type="date"
                value={filters.range1Start}
                onChange={(e) =>
                  setFilters({ ...filters, range1Start: e.target.value })
                }
              />
            </div>
            <div className="filter-group">
              <label>Range 1 End:</label>
              <input
                type="date"
                value={filters.range1End}
                onChange={(e) =>
                  setFilters({ ...filters, range1End: e.target.value })
                }
              />
            </div>
            <div className="filter-group">
              <label>Range 2 Start:</label>
              <input
                type="date"
                value={filters.range2Start}
                onChange={(e) =>
                  setFilters({ ...filters, range2Start: e.target.value })
                }
              />
            </div>
            <div className="filter-group">
              <label>Range 2 End:</label>
              <input
                type="date"
                value={filters.range2End}
                onChange={(e) =>
                  setFilters({ ...filters, range2End: e.target.value })
                }
              />
            </div>
          </>
        )}
      </div>

      {/* VALIDATION MESSAGE */}
      {validationError && (
        <div className="validation-error">{validationError}</div>
      )}

      {/* CHART */}
      {!validationError && (
        <>
          <div className="legend">
            <span className="legend-item blue">{label1 || "Period 1"}</span>
            <span className="legend-item orange">{label2 || "Period 2"}</span>
            <span className="legend-item red-line">
              Horizontal Line = Target Cap (If Exceeded)
            </span>
          </div>

          <div ref={chartRef} className="chart-wrapper">
            <ResponsiveContainer width="100%" height={500}>
              <ComposedChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <XAxis dataKey="spi" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Legend />

                <Bar dataKey="first" name="Period 1" fill="#2563eb" barSize={50} />
                <Bar dataKey="second" name="Period 2" fill="#f59e0b" barSize={50}>
                  <LabelList dataKey="percent" position="top" />
                </Bar>

                <Scatter
                  dataKey="limit"
                  name="Target Limit"
                  shape={<TargetLineShape />}
                  legendType="none"
                  tooltipType="none"
                />

              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </>
      )}
    </div>
  );
}
