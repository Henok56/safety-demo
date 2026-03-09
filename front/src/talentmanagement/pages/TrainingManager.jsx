/* eslint-disable */
import React, { useState, useEffect, useCallback } from "react";
import api from "../../api";
import "../../styles/TrainingManager.css";

export default function TrainingManager() {
  const [formData, setFormData] = useState({ category: "", topic: "" });
  const [list, setList] = useState([]);
  const [filterCategory, setFilterCategory] = useState("All");
  const [loading, setLoading] = useState(false);

  // ✅ Updated categories list
  const categories = [
    "Recurrent Training", 
    "Career Development", 
    "Coaching", 
    "Leadership Development"
  ];

  const fetchTrainings = useCallback(async () => {
    try {
      const url = filterCategory === "All" 
        ? "/trainings" 
        : `/trainings?category=${encodeURIComponent(filterCategory)}`;
      const res = await api.get(url);
      if (res?.data?.success) {
        setList(res.data.data);
      }
    } catch (err) {
      console.error("Error fetching technical list:", err);
    }
  }, [filterCategory]);

  useEffect(() => {
    fetchTrainings();
  }, [fetchTrainings]);

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to remove this training topic?")) {
      try {
        const res = await api.delete(`/trainings/${id}`);
        if (res.data.success) {
          setList(prev => prev.filter(item => item._id !== id));
        }
      } catch (err) {
        alert(err.response?.data?.message || "Failed to delete topic.");
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post("/trainings", formData);
      setFormData({ ...formData, topic: "" }); 
      await fetchTrainings();
    } catch (err) {
      alert(err.response?.data?.message || "Error saving record.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="manager-container">
      <div className="manager-header">
        <h2>Training & Development Master List</h2>
        <p>Manage topics for all Talent Management modules.</p>
      </div>

      <div className="manager-grid">
        <div className="card add-section">
          <form className="manager-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Training Category</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                required
              >
                <option value="">-- Select --</option>
                {categories.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Topic Name</label>
              <input
                type="text"
                value={formData.topic}
                onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                placeholder="e.g. Executive Coaching or Strategic Leadership"
                required
              />
            </div>
            <button type="submit" disabled={loading} className="add-btn">
              {loading ? "Saving..." : "Add Master Topic"}
            </button>
          </form>
        </div>

        <div className="card list-section">
          <div className="list-header">
            <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)}>
              <option value="All">All Categories</option>
              {categories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <table className="manager-table">
            <thead>
              <tr>
                <th>Category</th>
                <th>Topic</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {list.length > 0 ? (
                list.map((item) => (
                  <tr key={item._id}>
                    <td>
                      <span className={`badge badge-${item.category.toLowerCase().replace(/\s+/g, '-')}`}>
                        {item.category}
                      </span>
                    </td>
                    <td>{item.topic}</td>
                    <td>
                      <button className="del-btn" onClick={() => handleDelete(item._id)}>Delete</button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan="3" style={{textAlign: 'center', padding: '20px'}}>No topics found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}