/**
 * verifyRoles.js
 * Flexible Role-Based Access Control (RBAC) with Case Insensitivity
 */

const verifyRoles = (allowedRoles = []) => {
  return (req, res, next) => {
    // 1. Ensure authMiddleware has already attached req.user
    if (!req.user) {
      return res.status(401).json({ 
        success: false, 
        message: "Unauthenticated: No user identity found." 
      });
    }

    // Standardize the role to lowercase and trim whitespace
    const role = req.user.role ? String(req.user.role).toLowerCase().trim() : "";
    const userid = req.user.userid;

    // 2. The Superadmin / User Bypass: allow user and superadmin everywhere
    if (role === "superadmin" || role === "user") {
      console.log(`👑 Elevated Access Granted: [${userid}] (${role})`);
      return next();
    }

    // 3. Logic: Role check for other staff
    const normalizedAllowedRoles = allowedRoles.map(r => String(r).toLowerCase().trim());
    const isAuthorized = normalizedAllowedRoles.includes(role);

    if (!isAuthorized) {
      console.warn(`🚫 Access Denied: [${userid}] with role [${role}] attempted to access ${req.originalUrl}`);
      
      return res.status(403).json({ 
        success: false, 
        message: `Forbidden: Access restricted for ${role} users.` 
      });
    }

    // 4. Success for authorized roles (manager, team_leader, etc.)
    console.log(`✅ Access Granted: [${userid}] (${role})`);
    next();
  };
};

module.exports = verifyRoles;