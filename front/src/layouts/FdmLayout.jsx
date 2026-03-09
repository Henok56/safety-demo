import React from 'react';
import { Outlet } from "react-router-dom";
import FdmNav from "../components/fdmNav";
import "../styles/fdmNav.css"; // Ensure navigation styling is loaded

/**
 * FDM Layout Wrapper
 * This ensures the specialized FDM Navigation is persistent
 * while the Outlet renders either fdmDshboard or fdmForm.
 */
const FdmLayout = () => {
  return (
    <div className="fdm-layout-wrapper" style={{ minHeight: '100vh', backgroundColor: '#f8fafc' }}>
      {/* 1. Specialized FDM Navigation Bar */}
      <FdmNav />

      {/* 2. Main Content Area */}
      <main className="fdm-main-content" style={{ padding: '2rem' }}>
        <div className="container mx-auto">
          {/* Outlet is where the child routes (fdmDshboard or fdmForm) will appear */}
          <Outlet />
        </div>
      </main>

      {/* 3. Optional: Module Footer */}
      <footer style={{ 
        textAlign: 'center', 
        padding: '2rem', 
        color: '#94a3b8', 
        fontSize: '0.8rem' 
      }}>
       
      </footer>
    </div>
  );
};

export default FdmLayout;