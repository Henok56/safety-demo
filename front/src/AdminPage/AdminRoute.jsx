import { Navigate, useLocation } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import PropTypes from "prop-types";

export default function AdminRoute({ children }) {
  const token = localStorage.getItem("accessToken");
  const location = useLocation();

  if (!token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  try {
    const decoded = jwtDecode(token);

    // 1. Check expiration (Safety first)
    if (decoded.exp * 1000 < Date.now()) {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("user");
      return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // 2. Logic: Define the "Staff" barrier
    // This allows: superadmin, manager, team_leader, fdm_officer, scheduler
    // This blocks: user
    const role = decoded.role?.toLowerCase();

    if (!role || role === "user") {
      console.warn(`🚫 Admin Access Denied: Role [${role}] is unauthorized for this section.`);
      return <Navigate to="/dashboard" replace />;
    }

    // 3. Access granted for all staff/management roles
    return children;
    
  } catch (err) {
    console.error("AdminRoute Validation Error:", err);
    localStorage.removeItem("accessToken");
    localStorage.removeItem("user");
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
}

AdminRoute.propTypes = {
  children: PropTypes.node.isRequired,
};