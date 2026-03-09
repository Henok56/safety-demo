require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
const helmet = require("helmet");
const compression = require("compression");

const app = express();

app.disable("x-powered-by");
app.use(compression());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Security & CORS
if (process.env.NODE_ENV === "production") {
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", "data:"],
        connectSrc: ["'self'", "https://*.vercel.app"],
      },
    },
  }));
}

app.use(cors({
  origin: true, // Allows your Vercel domains to connect
  credentials: true,
}));

// API Routes
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/occurrences", require("./routes/occurrenceRoutes"));
app.use("/api/admin", require("./routes/adminRoutes"));
app.use("/api/schedules", require("./routes/scheduleRoutes"));
app.use("/api/admin/audit", require("./routes/auditRoutes"));
app.use("/api/fdm", require("./routes/fdmRoutes"));
app.use("/api/employees", require("./routes/employee.routes"));
app.use("/api/trainings", require("./routes/training.routes"));
app.use("/api/career", require("./routes/careerDevelopment.routes"));
app.use("/api/recurrent-training", require("./routes/recurrentTraining.routes"));
app.use("/api/leadership", require("./routes/leadershipDevelopment.routes"));
app.use("/api/coaching", require("./routes/coaching.routes"));
app.use("/api/succession", require("./routes/successionPlanning.routes"));
app.use("/api/talents", require("./routes/talentRoutes"));

// Serve Frontend Static Files
const distPath = path.join(process.cwd(), "front", "dist");
app.use(express.static(distPath));

// The "Catch-all" handler: Send index.html for any non-API route
app.get("*", (req, res) => {
  if (req.originalUrl.startsWith("/api")) {
    return res.status(404).json({ success: false, message: "API route not found" });
  }
  res.sendFile(path.join(distPath, "index.html"));
});

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch(err => console.error("❌ MongoDB Error:", err));

// Export for Vercel (Do not use app.listen in production)
if (process.env.NODE_ENV !== "production") {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => console.log(`🚀 Local Server: http://localhost:${PORT}`));
}

module.exports = app;