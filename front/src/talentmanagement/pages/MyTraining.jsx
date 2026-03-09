import React, { useEffect, useState, useMemo } from "react";
import api from "../../api";
import {
  Award,
  Repeat,
  Users,
  ClipboardList,
  Star,
  ShieldCheck,
  Calendar,
  Clock,
  CheckCircle2,
  Loader2,
  Briefcase,
  Zap,
  ExternalLink
} from "lucide-react";
import "../../styles/MyTraining.css";

const MyTraining = () => {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMyAuthorizedSummary();
  }, []);

  const fetchMyAuthorizedSummary = async () => {
    try {
      const res = await api.get("/talents/my-summary");
      if (res.data.success) {
        setSummary(res.data);
      }
    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateValue) => {
    if (!dateValue) return "TBD";
    const date = new Date(dateValue);
    return isNaN(date.getTime())
      ? dateValue
      : date.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        });
  };

  const sections = useMemo(() => {
    if (!summary?.data) return [];
    const { career, coaching, leadership, recurrentTraining, succession } = summary.data;

    return [
      {
        title: "Career Development",
        icon: <Award className="icon-career" />,
        items: career || [],
        mapFields: (item) => ({
          topic: item.topic, // Matches careerSchema
          primaryDate: item.tentativeScheduleMonth || "Not Scheduled", // Matches careerSchema
          label: "Tentative Month",
        }),
      },
      {
        title: "Coaching & Mentorship",
        icon: <Users className="icon-coaching" />,
        items: coaching || [],
        mapFields: (item) => ({
          topic: `Level: ${item.proposedPLLevel}`, // Matches coachingSchema
          primaryDate: `${formatDate(item.coachingScheduleStartMonth)} - ${formatDate(item.coachingScheduleEndMonth)}`, // Matches coachingSchema
          label: "Duration",
          extra: item.trainingType?.title || "Professional Coaching",
        }),
      },
      {
        title: "Leadership Program",
        icon: <Star className="icon-leadership" />,
        items: leadership || [],
        mapFields: (item) => ({
          topic: `Grooming for: ${item.groomedForPosition}`, // Matches leadershipSchema
          primaryDate: formatDate(item.preferredSchedule), // Matches leadershipSchema
          label: "Preferred Schedule",
          extra: item.trainingType?.title || "Leadership Module",
        }),
      },
      {
        title: "Recurrent Training",
        icon: <Repeat className="icon-recurrent" />,
        items: recurrentTraining || [],
        mapFields: (item) => ({
          topic: item.trainingType?.title || "Mandatory Certification",
          primaryDate: formatDate(item.tentativeScheduleDate), // Matches recurrentSchema
          label: "Next Due Date",
        }),
      },
      {
        title: "Succession Planning",
        icon: <ClipboardList className="icon-succession" />,
        items: succession || [],
        renderCustomSuccession: (item) => (
          <div className="succession-special-card">
            <p className="training-topic">Grooming for: {item.groomedForPosition}</p> {/* Matches successionSchema */}
            <div className="succession-sub-grid">
              {item.actingAssignment?.detail && (
                <div className="sub-item">
                  <Briefcase size={12} /> 
                  <span>
                    <strong>Acting:</strong> {item.actingAssignment.detail} ({formatDate(item.actingAssignment.scheduleMonth)})
                  </span>
                </div>
              )}
              {item.projectAssignments?.detail && (
                <div className="sub-item">
                  <Zap size={12} /> 
                  <span>
                    <strong>Project:</strong> {item.projectAssignments.detail} ({formatDate(item.projectAssignments.scheduleMonth)})
                  </span>
                </div>
              )}
              {item.exposureOpportunities?.detail && (
                <div className="sub-item">
                  <ExternalLink size={12} /> 
                  <span>
                    <strong>Exposure:</strong> {item.exposureOpportunities.detail} ({formatDate(item.exposureOpportunities.scheduleMonth)})
                  </span>
                </div>
              )}
            </div>
          </div>
        ),
      },
    ];
  }, [summary]);

  const visibleSections = sections.filter((sec) => sec.items.length > 0);

  if (loading) {
    return (
      <div className="loading-wrapper">
        <Loader2 className="spinner" size={40} />
        <p>Syncing your developmental roadmap...</p>
      </div>
    );
  }

  return (
    <div className="my-training-container">
      <header className="roadmap-header">
        <div className="header-left">
          <div className="profile-hex">
            <ShieldCheck size={32} />
          </div>
          <div>
            <h1>My Training Roadmap</h1>
            <p className="user-subtitle">
              {summary?.profile?.name}{" "}
              <span className="id-tag">ID: {summary?.profile?.id}</span>
            </p>
          </div>
        </div>
        <div className="stat-card">
          <span className="stat-label">Pending Tasks</span>
          <span className="stat-value">{summary?.totalPending || 0}</span>
        </div>
      </header>

      {visibleSections.length > 0 ? (
        <div className="roadmap-grid">
          {visibleSections.map((section) => (
            <div key={section.title} className="training-card">
              <div className="card-head">
                {section.icon}
                <h3>{section.title}</h3>
              </div>
              <div className="card-body">
                {section.items.map((item, idx) => (
                  <div key={item._id || idx} className="training-row">
                    {section.renderCustomSuccession ? (
                      section.renderCustomSuccession(item)
                    ) : (
                      <div className="info-main">
                        <CheckCircle2 size={18} className="check-icon" />
                        <div className="text-group">
                          <p className="training-topic">
                            {section.mapFields(item).topic}
                          </p>
                          {section.mapFields(item).extra && (
                            <p className="training-extra">
                              {section.mapFields(item).extra}
                            </p>
                          )}
                          <div className="training-meta">
                            <span className="meta-item">
                              <Calendar size={12} />{" "}
                              <strong>{section.mapFields(item).label}:</strong>{" "}
                              {section.mapFields(item).primaryDate}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
                    <div className="row-actions">
                      <span className="badge-pending">Pending</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="empty-roadmap">
          <CheckCircle2 size={64} color="#cbd5e1" />
          <h2>All Caught Up!</h2>
          <p>You have no pending training tasks assigned at this time.</p>
        </div>
      )}
    </div>
  );
};

export default MyTraining;