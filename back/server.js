// ===============================
// CORE IMPORTS
// ===============================
require("dotenv").config();

const path = require("path");
const fs = require("fs");
const crypto = require("crypto");

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const helmet = require("helmet");
const compression = require("compression");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");
const mongoSanitize = require("express-mongo-sanitize");

const app = express();

// ===============================
// ENV CHECK
// ===============================
console.log("\n📋 Environment Configuration:");
console.log(`NODE_ENV: ${process.env.NODE_ENV || "development"}`);
console.log(`PORT: ${process.env.PORT || 4000}`);
console.log(`MONGO_URI: ${process.env.MONGO_URI ? "✓ Set" : "✗ Missing"}`);
console.log(`JWT_SECRET: ${process.env.JWT_SECRET ? "✓ Set" : "✗ Missing"}`);
console.log(`ADMIN_EMAIL: ${process.env.ADMIN_EMAIL || "Not set"}`);

// ===============================
// REQUEST ID
// ===============================
app.use((req, res, next) => {
  req.id = crypto.randomUUID();
  res.setHeader("X-Request-ID", req.id);
  next();
});

// ===============================
// SECURITY
// ===============================
app.disable("x-powered-by");

app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginOpenerPolicy: false,
  })
);

app.use(compression());
app.use(express.json({ limit: "5mb" }));
app.use(express.urlencoded({ extended: true, limit: "5mb" }));

app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));

app.use(mongoSanitize());

// ===============================
// RATE LIMIT
// ===============================
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: process.env.NODE_ENV === "production" ? 100 : 500,
    message: "Too many requests, please try again later.",
  })
);

// ===============================
// CORS (FIXED - PRODUCTION SAFE)
// ===============================
const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "http://127.0.0.1:3000",

  // ✅ YOUR FRONTEND (IMPORTANT)
  "https://startling-pithivier-8781be.netlify.app",

  // optional old deployments
  "https://safety-demo.vercel.app",
  "https://front-96mk8y1gu-henok56s-projects.vercel.app",
  "https://front-j0to7fwwd-henok56s-projects.vercel.app",
];

app.use(
  cors({
    origin: function (origin, callback) {
      // allow server-to-server, curl, postman
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      console.log("❌ Blocked CORS request from:", origin);
      return callback(new Error("Not allowed by CORS"), false);
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Request-ID"],
  })
);

// ===============================
// ROUTES
// ===============================
const routes = [
  ["auth", "./routes/authRoutes"],
  ["occurrences", "./routes/occurrenceRoutes"],
  ["admin", "./routes/userRoutes"],
  ["schedules", "./routes/scheduleRoutes"],
  ["admin/audit", "./routes/auditRoutes"],
  ["employees", "./routes/employee.routes"],
  ["trainings", "./routes/training.routes"],
  ["career", "./routes/careerDevelopment.routes"],
  ["recurrent-training", "./routes/recurrentTraining.routes"],
  ["leadership", "./routes/leadershipDevelopment.routes"],
  ["coaching", "./routes/coaching.routes"],
  ["succession", "./routes/successionPlanning.routes"],
  ["talents", "./routes/talentRoutes"],
  ["unproductive-time", "./routes/unproductiveTimeRoutes"],
  ["fleet-assignments", "./routes/fleetAssignmentRoutes"],
  ["culture-compliance", "./routes/cultureComplianceRoutes"],
  ["fdm", "./routes/fdmRoutes"],
  ["hazard-tracking", "./routes/hazardTrackingRoutes"],
];

console.log("\n📦 Loading Routes:");

routes.forEach(([name, file]) => {
  try {
    const router = require(file);
    app.use(`/api/${name}`, router);
    console.log(`✔ /api/${name}`);
  } catch (err) {
    console.error(`✖ /api/${name} FAILED → ${err.message}`);
  }
});

// ===============================
// STATIC FILES
// ===============================
const uploads = path.join(__dirname, "uploads");

if (!fs.existsSync(uploads)) {
  fs.mkdirSync(uploads, { recursive: true });
}

app.use("/uploads", express.static(uploads));

// ===============================
// HEALTH
// ===============================
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    mongodb:
      mongoose.connection.readyState === 1 ? "connected" : "disconnected",
    time: new Date().toISOString(),
  });
});

// ===============================
// ROOT
// ===============================
app.get("/", (req, res) => {
  res.json({
    name: "Safety Office API",
    status: "running",
  });
});

// ===============================
// ERROR HANDLERS
// ===============================
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

app.use((err, req, res, next) => {
  console.error("🔥 ERROR:", err.message);
  res.status(500).json({
    message: err.message || "Server error",
  });
});

// ===============================
// DATABASE
// ===============================
const connectDB = async () => {
  if (!process.env.MONGO_URI) {
    console.error("❌ Missing MONGO_URI");
    process.exit(1);
  }

  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("🍃 MongoDB connected");
  } catch (err) {
    console.error("❌ MongoDB error:", err.message);
    process.exit(1);
  }
};

// ===============================
// SERVER START
// ===============================
const PORT = process.env.PORT || 4000;

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
  });
});

// Export (Vercel support)
module.exports = app;