require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
const helmet = require("helmet");
const compression = require("compression");

const app = express();

/* ===============================
    1️⃣ Middleware & Performance
================================ */
app.disable("x-powered-by");
app.use(compression());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/* ===============================
    2️⃣ Security & CORS
================================ */
if (process.env.NODE_ENV === "production") {
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'", "'unsafe-inline'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          imgSrc: ["'self'", "data:", "blob:"], // Added blob for file previews
          // ✅ Allows connections to your own domain and Vercel subdomains
          connectSrc: ["'self'", "https://*.vercel.app"], 
        },
      },
      crossOriginResourcePolicy: { policy: "cross-origin" }
    })
  );
}

// ✅ Dynamic CORS: Supports local dev and your colleagues in the office
const allowedOrigins = [
  "http://localhost:5173", 
  "http://localhost:5174",
  "https://safetyoffice-yqn3.vercel.app" // Add your specific Vercel URL here
];

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) !== -1 || origin.includes("vercel.app")) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));

/* ===============================
    3️⃣ API Routes
================================ */
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

/* ===============================
    4️⃣ Static Assets & Frontend
================================ */
// Serves images/files uploaded to the server
// We use path.resolve for better reliability in Vercel environments
const uploadsPath = path.resolve(process.cwd(), "back", "uploads");
app.use("/uploads", express.static(uploadsPath));

// ✅ Serving React 'dist' folder
const distPath = path.resolve(process.cwd(), "front", "dist");
app.use(express.static(distPath));

// ✅ The Catch-all: Fixes 404 on refresh for colleagues
app.get("*", (req, res) => {
  // If the request starts with /api but doesn't match a route, it's a 404
  if (req.originalUrl.startsWith("/api")) {
    return res.status(404).json({ success: false, message: "API route not found" });
  }
  
  // For all other routes (like /login or /dashboard), serve index.html
  const indexPath = path.join(distPath, "index.html");
  res.sendFile(indexPath, (err) => {
    if (err) {
      res.status(500).send("Error loading frontend. Ensure 'npm run build' was successful.");
    }
  });
});

/* ===============================
    5️⃣ Database & Export
================================ */
mongoose.set('strictQuery', false); // Best practice for Mongoose 6/7+
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ CLOUD RADAR: MongoDB Connected"))
  .catch(err => console.error("❌ MongoDB Connection Error:", err.message));

// Vercel handles the port; app.listen is for your local machine ONLY
if (process.env.NODE_ENV !== "production") {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`🚀 Flight Ops OMS Live: http://localhost:${PORT}`);
    console.log(`📂 Serving static files from: ${distPath}`);
  });
}

// CRITICAL: Vercel needs this export
module.exports = app;