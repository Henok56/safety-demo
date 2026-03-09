/* eslint-disable */
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../api";
import { 
  FiArrowLeft, FiMail, FiPhone, FiMapPin, FiBriefcase, 
  FiAward, FiActivity, FiTrendingUp, FiDownload 
} from "react-icons/fi";
import "../../styles/TalentDashboard.css"; // Re-using your main CSS for consistency

const EmployeeProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        // Replace with your actual single employee endpoint
        // const res = await api.get(`/employees/${id}`);
        // setEmployee(res.data.data);
        
        // Mock data for display purposes (Remove this when API is ready)
        setTimeout(() => {
          setEmployee({
            _id: id,
            firstName: "Sarah",
            lastName: "Connor",
            jobTitle: "Senior Analyst",
            department: "Operations",
            email: "sarah.c@company.com",
            phone: "+251 911 234 567",
            location: "Addis Ababa, HQ",
            regNo: "EMP-2024-098",
            bio: "High-performing analyst with a focus on operational efficiency. Currently undergoing leadership training track.",
            skills: ["Data Analysis", "React", "Project Management", "Strategic Planning"],
            history: [
              { year: "2023", role: "Senior Analyst", event: "Promotion" },
              { year: "2021", role: "Junior Analyst", event: "Hired" }
            ]
          });
          setLoading(false);
        }, 800);
      } catch (err) {
        console.error("Failed to load profile", err);
        setLoading(false);
      }
    };
    fetchProfile();
  }, [id]);

  if (loading) return <div className="shimmer-loader full-page">Loading Personnel File...</div>;
  if (!employee) return <div className="error-state">Employee not found.</div>;

  return (
    <div className="talent-dashboard-container" style={{ overflowY: 'auto' }}>
      {/* Navigation Header */}
      <header className="command-header">
        <div className="header-main">
          <div className="brand-group cursor-pointer" onClick={() => navigate(-1)}>
            <div className="util-btn" style={{ background: 'rgba(255,255,255,0.1)', color: 'white', border: 'none' }}>
              <FiArrowLeft />
            </div>
            <div>
              <h1 style={{ fontSize: '1.2rem' }}>Back to Matrix</h1>
              <p>Return to Dashboard</p>
            </div>
          </div>
          <div className="header-metrics">
             <button className="gold-action-btn" style={{ height: '40px' }}>
                <FiDownload /> Export Profile
             </button>
          </div>
        </div>
      </header>

      <div className="dashboard-body profile-layout">
        
        {/* Left Column: ID Card */}
        <div className="profile-sidebar">
          <div className="table-card" style={{ padding: '2rem', textAlign: 'center' }}>
            <div className="avatar-box" style={{ width: '120px', height: '120px', fontSize: '3rem', margin: '0 auto 1.5rem' }}>
              {employee.firstName[0]}
            </div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', margin: '0' }}>
              {employee.firstName} {employee.lastName}
            </h2>
            <p style={{ color: '#64748b', marginBottom: '1.5rem' }}>{employee.jobTitle}</p>
            
            <div className="divider-line" style={{ height: '1px', background: '#e2e8f0', margin: '1.5rem 0' }}></div>

            <div className="contact-list" style={{ textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="info-row">
                <FiMail className="text-slate-400" /> <span>{employee.email}</span>
              </div>
              <div className="info-row">
                <FiPhone className="text-slate-400" /> <span>{employee.phone}</span>
              </div>
              <div className="info-row">
                <FiMapPin className="text-slate-400" /> <span>{employee.location}</span>
              </div>
              <div className="info-row">
                <FiBriefcase className="text-slate-400" /> <span>{employee.department}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Detailed Tabs */}
        <div className="profile-main">
          <div className="table-card" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            
            {/* Tabs */}
            <div className="profile-tabs" style={{ borderBottom: '1px solid #e2e8f0', padding: '0 1.5rem', display: 'flex', gap: '2rem' }}>
              {['overview', 'training', 'performance'].map(tab => (
                <button 
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  style={{ 
                    padding: '1.5rem 0', 
                    background: 'none', 
                    border: 'none', 
                    borderBottom: activeTab === tab ? '3px solid #0f172a' : '3px solid transparent',
                    color: activeTab === tab ? '#0f172a' : '#64748b',
                    fontWeight: '600',
                    cursor: 'pointer',
                    textTransform: 'capitalize'
                  }}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Content Area */}
            <div className="tab-content" style={{ padding: '2rem' }}>
              
              {activeTab === 'overview' && (
                <div className="fade-in">
                  <h3 className="section-title">Professional Summary</h3>
                  <p style={{ lineHeight: '1.6', color: '#475569', marginBottom: '2rem' }}>
                    {employee.bio}
                  </p>

                  <h3 className="section-title">Skills & Competencies</h3>
                  <div className="skills-cloud" style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    {employee.skills.map(skill => (
                      <span key={skill} style={{ background: '#f1f5f9', padding: '6px 12px', borderRadius: '20px', fontSize: '0.9rem', color: '#334155' }}>
                        {skill}
                      </span>
                    ))}
                  </div>

                  <h3 className="section-title" style={{ marginTop: '2rem' }}>Career Timeline</h3>
                  <div className="timeline-simple">
                    {employee.history.map((h, i) => (
                      <div key={i} style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
                        <span style={{ fontWeight: 'bold', color: '#0f172a', width: '60px' }}>{h.year}</span>
                        <div style={{ flex: 1, paddingLeft: '1rem', borderLeft: '2px solid #e2e8f0' }}>
                          <strong>{h.role}</strong>
                          <p style={{ fontSize: '0.85rem', color: '#64748b', margin: 0 }}>{h.event}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'training' && (
                <div className="empty-state">
                  <FiActivity size={40} color="#cbd5e1" />
                  <p>Training history data visualization would go here.</p>
                </div>
              )}

              {activeTab === 'performance' && (
                <div className="empty-state">
                  <FiTrendingUp size={40} color="#cbd5e1" />
                  <p>Performance review matrix would go here.</p>
                </div>
              )}

            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default EmployeeProfile;