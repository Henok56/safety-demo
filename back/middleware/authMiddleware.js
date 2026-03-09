const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      success: false,
      message: "Access Denied: No token provided",
    });
  }

  try {
    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 🚩 SECURITY VALIDATION
    // Ensure the token isn't just valid, but contains the identity 
    // fields our controllers now require for auditing and role-checks.
    if (!decoded.role || !decoded.userid) {
      return res.status(403).json({
        success: false,
        message: "Malformed Token: Missing role or identity information",
      });
    }

    // Attaches { id, role, userid } to the request object
    // Used by controllers for auditing: req.user.userid
    // Used by controllers for permissions: req.user.role
    req.user = decoded; 
    
    next();
  } catch (err) {
    console.error("🔒 Auth Middleware Error:", err.message);
    
    // Check for expired specifically to give the frontend a hint to logout/refresh
    const message = err.name === "TokenExpiredError" 
      ? "Session expired, please login again" 
      : "Invalid security token";

    return res.status(401).json({
      success: false,
      message
    });
  }
};