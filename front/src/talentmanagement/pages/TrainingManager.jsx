/* eslint-disable */
import React, { useState, useEffect, useCallback } from "react";
import api from "../../api";
import { 
  FiPlus, FiTrash2, FiFilter, FiSearch, FiBookOpen, 
  FiAward, FiTrendingUp, FiUsers, FiCheckCircle,
  FiXCircle, FiRefreshCw, FiEdit2, FiSave, FiAlertCircle
} from "react-icons/fi";
import "../../styles/TrainingManager.css";

export default function TrainingManager() {
  const [formData, setFormData] = useState({ category: "", topic: "" });
  const [list, setList] = useState([]);
  const [filterCategory, setFilterCategory] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editTopic, setEditTopic] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  // Updated categories list with icons
  const categories = [
    { name: "Recurrent Training", icon: "🔄", color: "#10b981" },
    { name: "Career Development", icon: "📈", color: "#3b82f6" },
    { name: "Coaching", icon: "🎯", color: "#8b5cf6" },
    { name: "Leadership Development", icon: "👑", color: "#f59e0b" }
  ];

  // Statistics calculation
  const stats = {
    total: list.length,
    byCategory: categories.map(cat => ({
      ...cat,
      count: list.filter(item => item.category === cat.name).length
    }))
  };

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
      console.error("Error fetching training list:", err);
      setErrorMessage("Failed to load training topics");
      setTimeout(() => setErrorMessage(""), 3000);
    }
  }, [filterCategory]);

  useEffect(() => {
    fetchTrainings();
  }, [fetchTrainings]);

  const handleDelete = async (id, topicName) => {
    if (window.confirm(`Are you sure you want to remove "${topicName}"?`)) {
      try {
        const res = await api.delete(`/trainings/${id}`);
        if (res.data.success) {
          setList(prev => prev.filter(item => item._id !== id));
          setSuccessMessage(`"${topicName}" has been removed`);
          setTimeout(() => setSuccessMessage(""), 3000);
        }
      } catch (err) {
        setErrorMessage(err.response?.data?.message || "Failed to delete topic.");
        setTimeout(() => setErrorMessage(""), 3000);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.category || !formData.topic.trim()) {
      setErrorMessage("Please select a category and enter a topic");
      setTimeout(() => setErrorMessage(""), 3000);
      return;
    }
    
    setLoading(true);
    try {
      await api.post("/trainings", formData);
      setFormData({ ...formData, topic: "" }); 
      setSuccessMessage(`"${formData.topic}" has been added successfully`);
      setTimeout(() => setSuccessMessage(""), 3000);
      await fetchTrainings();
    } catch (err) {
      setErrorMessage(err.response?.data?.message || "Error saving record.");
      setTimeout(() => setErrorMessage(""), 3000);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (id, currentTopic) => {
    setEditingId(id);
    setEditTopic(currentTopic);
  };

  const handleSaveEdit = async (id) => {
    if (!editTopic.trim()) {
      setErrorMessage("Topic cannot be empty");
      return;
    }
    
    try {
      const res = await api.put(`/trainings/${id}`, { topic: editTopic });
      if (res.data.success) {
        setList(prev => prev.map(item => 
          item._id === id ? { ...item, topic: editTopic } : item
        ));
        setEditingId(null);
        setEditTopic("");
        setSuccessMessage("Topic updated successfully");
        setTimeout(() => setSuccessMessage(""), 3000);
      }
    } catch (err) {
      setErrorMessage(err.response?.data?.message || "Failed to update topic");
      setTimeout(() => setErrorMessage(""), 3000);
    }
  };

  const filteredList = list.filter(item => 
    item.topic.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="training-manager-container">
      {/* Header Section */}
      <div className="training-header">
        <div className="header-content">
          <div className="header-icon">📚</div>
          <div>
            <h1>Training & Development Master List</h1>
            <p>Manage and organize all learning initiatives across talent modules</p>
          </div>
        </div>
        <button className="refresh-btn" onClick={fetchTrainings}>
          <FiRefreshCw /> Refresh
        </button>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#e0f2fe' }}><FiBookOpen /></div>
          <div className="stat-info">
            <span className="stat-value">{stats.total}</span>
            <span className="stat-label">Total Topics</span>
          </div>
        </div>
        {stats.byCategory.map(cat => (
          <div key={cat.name} className="stat-card mini">
            <div className="stat-icon small" style={{ background: `${cat.color}20`, color: cat.color }}>
              {cat.icon}
            </div>
            <div className="stat-info">
              <span className="stat-value small">{cat.count}</span>
              <span className="stat-label">{cat.name}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Alert Messages */}
      {successMessage && (
        <div className="alert success">
          <FiCheckCircle />
          <span>{successMessage}</span>
          <button onClick={() => setSuccessMessage("")}><FiXCircle /></button>
        </div>
      )}
      {errorMessage && (
        <div className="alert error">
          <FiAlertCircle />
          <span>{errorMessage}</span>
          <button onClick={() => setErrorMessage("")}><FiXCircle /></button>
        </div>
      )}

      {/* Main Grid */}
      <div className="manager-grid">
        {/* Add Form Card */}
        <div className="card add-card">
          <div className="card-header">
            <FiPlus />
            <h3>Add New Training Topic</h3>
          </div>
          <form className="training-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Training Category</label>
              <div className="category-select-wrapper">
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  required
                >
                  <option value="">-- Select Category --</option>
                  {categories.map(c => (
                    <option key={c.name} value={c.name}>
                      {c.icon} {c.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            
            <div className="form-group">
              <label>Topic Name</label>
              <input
                type="text"
                value={formData.topic}
                onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                placeholder="e.g., Executive Coaching, Strategic Leadership, Agile Fundamentals..."
                required
              />
            </div>
            
            <button type="submit" disabled={loading} className="submit-btn">
              {loading ? (
                <>
                  <div className="spinner-small"></div>
                  Saving...
                </>
              ) : (
                <>
                  <FiSave /> Add Master Topic
                </>
              )}
            </button>
          </form>
        </div>

        {/* List Card */}
        <div className="card list-card">
          <div className="list-toolbar">
            <div className="filter-section">
              <FiFilter className="filter-icon" />
              <select 
                value={filterCategory} 
                onChange={(e) => setFilterCategory(e.target.value)}
                className="category-filter"
              >
                <option value="All">📊 All Categories</option>
                {categories.map(c => (
                  <option key={c.name} value={c.name}>
                    {c.icon} {c.name}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="search-section">
              <FiSearch className="search-icon" />
              <input
                type="text"
                placeholder="Search topics..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="table-wrapper">
            <table className="topics-table">
              <thead>
                <tr>
                  <th>Category</th>
                  <th>Topic / Initiative</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredList.length > 0 ? (
                  filteredList.map((item) => {
                    const category = categories.find(c => c.name === item.category);
                    return (
                      <tr key={item._id}>
                        <td className="category-cell">
                          <span 
                            className="category-badge"
                            style={{ 
                              background: `${category?.color || '#6b7280'}15`,
                              color: category?.color || '#6b7280'
                            }}
                          >
                            {category?.icon} {item.category}
                          </span>
                        </td>
                        <td className="topic-cell">
                          {editingId === item._id ? (
                            <div className="inline-edit">
                              <input
                                type="text"
                                value={editTopic}
                                onChange={(e) => setEditTopic(e.target.value)}
                                autoFocus
                                onKeyPress={(e) => e.key === 'Enter' && handleSaveEdit(item._id)}
                              />
                              <button 
                                className="save-edit-btn"
                                onClick={() => handleSaveEdit(item._id)}
                              >
                                <FiSave />
                              </button>
                              <button 
                                className="cancel-edit-btn"
                                onClick={() => setEditingId(null)}
                              >
                                <FiXCircle />
                              </button>
                            </div>
                          ) : (
                            <span className="topic-name">{item.topic}</span>
                          )}
                        </td>
                        <td className="actions-cell">
                          {editingId !== item._id ? (
                            <>
                              <button 
                                className="action-btn edit-btn"
                                onClick={() => handleEdit(item._id, item.topic)}
                                title="Edit topic"
                              >
                                <FiEdit2 />
                              </button>
                              <button 
                                className="action-btn delete-btn"
                                onClick={() => handleDelete(item._id, item.topic)}
                                title="Delete topic"
                              >
                                <FiTrash2 />
                              </button>
                            </>
                          ) : null}
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="3" className="empty-state">
                      <div className="empty-content">
                        <FiBookOpen size={48} />
                        <p>No training topics found</p>
                        <span>Add your first topic using the form</span>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          
          {filteredList.length > 0 && (
            <div className="list-footer">
              <span className="record-count">
                Showing {filteredList.length} of {list.length} topics
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}