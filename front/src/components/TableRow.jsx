import React from "react";
import {
  approveEntry,
  rejectEntry,
  deleteEntry,
} from "../api/unproductiveTimeApi";
import "../styles/TableRow.css";

export default function TableRow({ item, onRefresh, onView }) {
  const handleApprove = async () => {
    try {
      await approveEntry(item._id);
      onRefresh();
    } catch (err) {
      console.error(err);
      alert("Failed to approve");
    }
  };

  const handleReject = async () => {
    const reason = prompt("Enter rejection reason:");
    if (!reason) return;

    try {
      await rejectEntry(item._id, { reason });
      onRefresh();
    } catch (err) {
      console.error(err);
      alert("Failed to reject");
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Delete this record?")) return;

    try {
      await deleteEntry(item._id);
      onRefresh();
    } catch (err) {
      console.error(err);
      alert("Failed to delete");
    }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case "approved":
        return "status approved";
      case "rejected":
        return "status rejected";
      case "pending":
        return "status pending";
      case "stopped":
        return "status stopped";
      default:
        return "status";
    }
  };

  return (
    <tr>

      <td>
        {item.employee?.name ||
          [item.employee?.firstname, item.employee?.lastname]
            .filter(Boolean)
            .join(" ") ||
          "N/A"}
      </td>
      <td className="capitalize">{item.type}</td>

      <td>
        {item.startTime
          ? new Date(item.startTime).toLocaleString()
          : "-"}
      </td>

      <td>
        {item.endTime
          ? new Date(item.endTime).toLocaleString()
          : "-"}
      </td>

      <td>{item.finalHoursLost || 0}</td>

      <td>
        <span className={getStatusClass(item.status)}>
          {item.status}
        </span>
      </td>

      <td className="actions">

        <button className="view" onClick={() => onView(item)}>
          View
        </button>

        {item.endTime && !["approved", "rejected"].includes(item.status) && (
          <>
            <button className="approve" onClick={handleApprove}>
              Approve
            </button>

            <button className="reject" onClick={handleReject}>
              Reject
            </button>
          </>
        )}

        <button className="delete" onClick={handleDelete}>
          Delete
        </button>

      </td>
    </tr>
  );
}
