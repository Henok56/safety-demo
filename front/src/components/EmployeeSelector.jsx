/* eslint-disable */
import React, { useState, useEffect } from "react";
import { getEmployees } from "../api/talentApi"; // Adjust path as needed

export default function EmployeeSelector({ onEmployeeSelected, selectedId }) {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchEmployees = async () => {
      setLoading(true);
      try {
        const res = await getEmployees();
        setEmployees(res.data.data || []);
      } catch (err) {
        console.error("Error fetching employees for selector:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchEmployees();
  }, []);

  const handleChange = (e) => {
    const val = e.target.value;
    if (!val) {
      onEmployeeSelected(null);
      return;
    }

    const emp = employees.find((item) => item._id === val);
    if (emp) {
      onEmployeeSelected({
        employeeId: emp._id,
        firstName: emp.userAccount?.firstname || "",
        lastName: emp.userAccount?.lastname || "",
        staffId: emp.userAccount?.userid || "",
        costCenter: emp.costCenter || "",
      });
    }
  };

  return (
    <>
      <label>Select Staff Member</label>
      <select 
        className="talent-form-select" // Use standard string class names
        value={selectedId || ""} 
        onChange={handleChange} 
        required
      >
        <option value="">{loading ? "Loading..." : "-- Choose Name --"}</option>
        {employees.map((emp) => (
          <option key={emp._id} value={emp._id}>
            {emp.userAccount?.firstname} {emp.userAccount?.lastname} ({emp.userAccount?.userid})
          </option>
        ))}
      </select>
    </>
  );
}