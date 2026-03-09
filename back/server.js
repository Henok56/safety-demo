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
    2️⃣ Security Middleware (Helmet)
================================ */
if (process.env.NODE_ENV === "production") {
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          fontSrc: ["'self'"],
          imgSrc: ["'self'", "data:"],
          connectSrc: [
            "'self'",
            "https://safetyoffice-yqn3.vercel.app", // ✅ Added Production Frontend
            "http://localhost:5000",
          ],
        },
      },
    })
  );
} else {
  app.use(helmet({ contentSecurityPolicy: false }));
}

/* ===============================
    3️⃣ CORS Configuration
================================ */
const corsOptions = {
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);

    const allowedOrigins = [
      "http://localhost:5173",
      "http://localhost:5174",
      "http://localhost:5000",
      "https://safetyoffice-yqn3.vercel.app", // ✅ Added Vercel Production URL
    ];

    // Regular expression to allow local network IPs and localhost
    const isLocalNetwork = /^http:\/\/(10|172|192)\./.test(origin) || origin.includes("localhost");

    if (allowedOrigins.includes(origin) || isLocalNetwork) {
      callback(null, true);
    } else {
      console.warn(`✈️ SECURITY: Blocked origin: ${origin}`);
      callback(new Error("Not allowed by CORS"));
    }
  },
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
};

app.use(cors(corsOptions));

/* ===============================
    4️⃣ Static Assets (Uploads)
================================ */
app.use(
  "/uploads",
  (req, res, next) => {
    try {
      req.url = decodeURIComponent(req.url);
      next();
    } catch (e) {
      res.status(400).send("Invalid URL encoding");
    }
  },
  express.static(path.join(__dirname, "uploads"))
);

/* ===============================
    5️⃣ API Routes
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

/* ================================
    6️⃣ Serve React Frontend (Production)
================================ */
if (process.env.NODE_ENV === "production") {
  // Use absolute path for safety in different environments
  const distPath = path.resolve(__dirname, "../front/dist");
  app.use(express.static(distPath));

  app.get(/.*/, (req, res) => {
    if (req.originalUrl.startsWith("/api")) {
      return res.status(404).json({ success: false, message: "API route not found" });
    }
    res.sendFile(path.join(distPath, "index.html"));
  });
}

/* ===============================
    7️⃣ Global Error Handler
================================ */
app.use((err, req, res, next) => {
  console.error("💥 SYSTEM ERROR:", err.stack);
  res.status(500).json({
    success: false,
    message: "Internal Flight System Error",
    error: process.env.NODE_ENV === "development" ? err.message : undefined,
  });
});

/* ===============================
    8️⃣ MongoDB Connection & Server Start
================================ */
const PORT = process.env.PORT || 5000;
let server;

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ CLOUD RADAR CONNECTED: MongoDB Atlas Link Established");

    // Listen on 0.0.0.0 to accept external connections if not on Vercel
    server = app.listen(PORT, "0.0.0.0", () => {
      console.log(`🚀 FLTOPS OMS Live on Port: ${PORT}`);
      console.log(`📡 Production Mode: ${process.env.NODE_ENV === "production" ? "YES" : "NO"}`);
    });
  })
  .catch((err) => {
    console.error("❌ CLOUD RADAR FAILED:", err.message);
    process.exit(1);
  });

/* ===============================
    9️⃣ Graceful Shutdown
================================ */
const shutdown = async () => {
  console.log("🛑 Shutting down gracefully...");
  if (server) {
    server.close(() => console.log("HTTP server closed."));
  }
  await mongoose.connection.close(false);
  console.log("MongoDB connection closed.");
  process.exit(0);
};

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);