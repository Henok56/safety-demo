import { NavLink } from "react-router-dom";
import "../styles/fdmNav.css";
export default function FdmNav() {
  return (
    <header className="home-nav">
      <nav className="nav-left">
        {/* Link back to the main management portal */}
        <NavLink to="/admin" className="talent-link">
          Admin Home Page
        </NavLink>

        {/* Link to the FDM Table/Stats Dashboard */}
        <NavLink 
          to="/fdm" 
          end 
          className={({ isActive }) => isActive ? "nav-btn active" : "nav-btn"}
        >
          FDM Dashboard
        </NavLink>

        {/* Link to the Data Entry Form (updated from 'Contacts') */}
        <NavLink 
          to="/fdm/fdmform" 
          className={({ isActive }) => isActive ? "nav-btn active" : "nav-btn"}
        >
          New Safety Entry
        </NavLink>
      </nav>
      
      <div className="nav-right">
        <span className="system-status">✈️ Operational</span>
      </div>
    </header>
  );
}