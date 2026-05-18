import { NavLink } from "react-router-dom";
import "../styles/HomeNav.css";

export default function Nav() {
  return (
    <header className="home-nav">
      <nav className="nav-left">
        <NavLink to="/" className="nav-btn">🏠 Back to Home</NavLink>
        <NavLink to="/about" className="nav-btn">About</NavLink>
        <NavLink to="/sla" className="nav-btn">SLA</NavLink>
        <NavLink to="/contacts" className="nav-btn">Contacts</NavLink>
      </nav>

      <h1 className="home-title">Ethiopian Airlines Flight Ops Safety Office</h1>

      <div className="nav-right">
        <NavLink to="/login" className="nav-btn">Login</NavLink>
      </div>
    </header>
  );
}
