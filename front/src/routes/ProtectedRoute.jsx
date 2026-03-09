import { Navigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import PropTypes from "prop-types";

export default function ProtectedRoute({ children, allowedRoles = [] }) {
  const token = localStorage.getItem("accessToken");

  // 1. Check if token exists
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  try {
    const decoded = jwtDecode(token);

    // 2. Check expiration
    if (decoded.exp * 1000 < Date.now()) {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("user");
      return <Navigate to="/login" replace />;
    }

    // 3. Role-Based Access Control (RBAC)
    // If allowedRoles is empty, it's a basic protected route.
    // Otherwise, check if user's role matches.
    if (allowedRoles.length > 0) {
      const userRole = decoded.role; // Assumes your JWT payload has a 'role' field
      
      // Superadmin usually bypasses all role restrictions
      const hasAccess = userRole === "superadmin" || allowedRoles.includes(userRole);

      if (!hasAccess) {
        console.warn(`Access denied for role: ${userRole}`);
        // Redirect to dashboard or a "Forbidden" page instead of Login
        return <Navigate to="/dashboard" replace />; 
      }
    }

    // 4. Valid token and Authorized role
    return children;
  } catch (err) {
    console.error("Invalid token process:", err);
    localStorage.removeItem("accessToken");
    localStorage.removeItem("user");
    return <Navigate to="/login" replace />;
  }
}

ProtectedRoute.propTypes = {
  children: PropTypes.node.isRequired,
  allowedRoles: PropTypes.arrayOf(PropTypes.string),
};