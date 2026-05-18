import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getEntry } from "../../api/unproductiveTimeApi";
import UnproductiveTimeNav from "../../components/UnproductiveTimeNav";
import "../../styles/UnproductiveTimeDetails.css";

const getEmployeeName = (employee) =>
  employee?.name ||
  [employee?.firstname, employee?.lastname].filter(Boolean).join(" ") ||
  employee?.regNo ||
  "-";

const formatHours = (value) => Number(value || 0).toFixed(2);

const getPersonName = (employee) =>
  [employee?.firstname, employee?.lastname].filter(Boolean).join(" ") ||
  employee?.name ||
  "-";

export default function UnproductiveTimeDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await getEntry(id);
      setData(res.data?.data || null);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to load record");
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  if (loading) return <p>Loading...</p>;
  if (!data) return <p>No data found</p>;

  return (
    <div className="ut-details-container">
      <UnproductiveTimeNav />
      <button onClick={() => navigate("/kpi/unproductive-time/list")}>Back</button>
      <h2>Unproductive Time Details</h2>

      <div className="details-card">
        <div className="row">
          <span>Employee:</span>
          <b>{getEmployeeName(data.employee)}</b>
        </div>

        <div className="row">
          <span>Type:</span>
          <b>{data.type}</b>
        </div>

        <div className="row">
          <span>Reason:</span>
          <b>{data.reason || "-"}</b>
        </div>

        <div className="row">
          <span>Start Time:</span>
          <b>{new Date(data.startTime).toLocaleString()}</b>
        </div>

        <div className="row">
          <span>End Time:</span>
          <b>{data.endTime ? new Date(data.endTime).toLocaleString() : "Not ended"}</b>
        </div>

        <div className="row">
          <span>Raw Hours Lost:</span>
          <b>{formatHours(data.rawHoursLost)}</b>
        </div>

        <div className="row">
          <span>Final Hours Lost:</span>
          <b>{formatHours(data.finalHoursLost)}</b>
        </div>

        <div className="row">
          <span>Status:</span>
          <b className={`status ${data.status}`}>{data.status}</b>
        </div>

        <div className="row">
          <span>Recorded By:</span>
          <b>{getPersonName(data.recordedBy)}</b>
        </div>

        <div className="row">
          <span>Approved By:</span>
          <b>{getPersonName(data.approvedBy)}</b>
        </div>

        <div className="row">
          <span>Rejection Reason:</span>
          <b>{data.rejectionReason || "-"}</b>
        </div>

        <div className="row">
          <span>Created At:</span>
          <b>{new Date(data.createdAt).toLocaleString()}</b>
        </div>
      </div>
    </div>
  );
}
