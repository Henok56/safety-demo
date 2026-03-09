import React from "react";
import { Outlet } from "react-router-dom";
// 🚩 ADD THIS IMPORT LINE:
import TalentComponent from "../components/TalentComponent"; 

import Nav from "../components/Nav"; // Assuming you use the main Nav too

export default function TalentLayout() {
  return (
    <div className="talent-layout">
     
      
      {/* This is your sub-navigation bar for the Talent module */}
      <TalentComponent /> 
      
      <div className="talent-content">
        {/* This renders the specific page (Dashboard, List, etc.) */}
        <Outlet /> 
      </div>
    </div>
  );
}