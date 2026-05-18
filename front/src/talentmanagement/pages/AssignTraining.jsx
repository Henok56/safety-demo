import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../api";
import "../../styles/AssignTraining.css";
/* ===== Import Tabs ===== */
import CareerDevelopmentTab from "../tabs/CareerDevelopmentTab";
import RecurrentTrainingTab from "../tabs/RecurrentTrainingTab";
import LeadershipDevelopmentTab from "../tabs/LeadershipDevelopmentTab";
import CoachingTab from "../tabs/CoachingTab";
import SuccessionPlanningTab from "../tabs/SuccessionPlanningTab";

/* ===== CSS ===== */
import "../../styles/AssignTraining.css";

export default function AssignTraining() {
  const [selectedTraining, setSelectedTraining] = useState("career");

  const renderTab = () => {
    switch (selectedTraining) {
      case "career":
        return <CareerDevelopmentTab />;
      case "recurrent":
        return <RecurrentTrainingTab />;
      case "leadership":
        return <LeadershipDevelopmentTab />;
      case "coaching":
        return <CoachingTab />;
      case "succession":
        return <SuccessionPlanningTab />;
      default:
        return null;
    }
  };

  return (
    <div className="assign-training-container">
  

      <div className="training-select">
        <label htmlFor="trainingType">Select Training Type or Growth Initiatives:</label>
        <select
          id="trainingType"
          value={selectedTraining}
          onChange={(e) => setSelectedTraining(e.target.value)}
        >
          <option value="career">Career Development</option>
          <option value="recurrent">Recurrent Training</option>
          <option value="leadership">Leadership Development</option>
          <option value="coaching">Coaching</option>
          <option value="succession">Succession Planning</option>
        </select>
      </div>

      <div className="training-tab-container">{renderTab()}</div>
    </div>
  );
}
