// C:\Users\HenokGs\Desktop\office_projects\front\src\components\unproductiveTimeComp.jsx

import React, { useState } from "react";
import UnproductiveTimeDashboard from "../kpi/unproductiveTime/UnproductiveTimeDashboard";
import UnproductiveTimeTimer from "../kpi/unproductiveTime/UnproductiveTimeTimer";
import UnproductiveTimeList from "../kpi/unproductiveTime/UnproductiveTimeList";
import UnproductiveTimeApproval from "../kpi/unproductiveTime/UnproductiveTimeApproval";
import "../styles/unproductiveTimeComp.css";

const UnproductiveTimeComp = () => {
  const [view, setView] = useState("dashboard");
  const [refreshKey, setRefreshKey] = useState(0);

  // 🔄 trigger reload for child components
  const triggerRefresh = () => {
    setRefreshKey((prev) => prev + 1);
  };

  // 🎯 after creating entry → go to list
  const handleCreated = () => {
    triggerRefresh();
  };

  return (
    <div className="ut-wrapper">

      {/* ================= NAVIGATION ================= */}
      <div className="ut-nav">
        <button
          onClick={() => setView("dashboard")}
          className={view === "dashboard" ? "active" : ""}
        >
          📊 Dashboard
        </button>

        <button
          onClick={() => setView("timer")}
          className={view === "timer" ? "active" : ""}
        >
          ⏱ Start Timer
        </button>

        <button
          onClick={() => setView("list")}
          className={view === "list" ? "active" : ""}
        >
          📋 Records
        </button>

        <button
          onClick={() => setView("approval")}
          className={view === "approval" ? "active" : ""}
        >
          ✅ Approval
        </button>
      </div>

      {/* ================= CONTENT ================= */}
      <div className="ut-content">

        {view === "dashboard" && (
          <UnproductiveTimeDashboard
            refreshKey={refreshKey}
            onNavigate={setView}
            showNav={false}
          />
        )}

        {view === "timer" && (
          <UnproductiveTimeTimer
            onSuccess={handleCreated}
            showNav={false}
          />
        )}

        {view === "list" && (
          <UnproductiveTimeList
            refreshKey={refreshKey}
            showNav={false}
          />
        )}

        {view === "approval" && (
          <UnproductiveTimeApproval
            refreshKey={refreshKey}
            showNav={false}
          />
        )}

      </div>
    </div>
  );
};

export default UnproductiveTimeComp;
