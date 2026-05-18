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
if (!process.env.MONGO_URI) {
  console.warn("⚠️ Missing MONGO_URI in .env file");
  console.warn("Please add: MONGO_URI=mongodb://localhost:27017/your_database");
}

// ===============================
// REQUEST ID
// ===============================
app.use((req, res, next) => {
  req.id = crypto.randomUUID();
  res.setHeader("X-Request-ID", req.id);
  next();
});

// ===============================
// SECURITY & MIDDLEWARE
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

// Morgan logging
app.use(
  morgan((tokens, req, res) =>
    [
      tokens.method(req, res),
      tokens.url(req, res),
      tokens.status(req, res),
      tokens["response-time"](req, res),
      "ms",
      "| ID:",
      req.id,
    ].join(" ")
  )
);

app.use(mongoSanitize());

// Rate limiting
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 500, // limit each IP to 500 requests per windowMs
    message: "Too many requests from this IP, please try again later.",
  })
);

// ===============================
// CORS
// ===============================
app.use(
  cors({
    origin: true,
    credentials: true,
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

    if (!router) throw new Error("Router undefined");

    app.use(`/api/${name}`, router);

    console.log(`  ✔ /api/${name}`);
  } catch (err) {
    console.error(`  ✖ /api/${name} FAILED → ${err.message}`);
  }
});

// ===============================
// STATIC FILES
// ===============================
const uploads = path.join(__dirname, "uploads");

if (!fs.existsSync(uploads)) {
  fs.mkdirSync(uploads, { recursive: true });
  console.log("📁 Uploads directory created");
}

app.use("/uploads", express.static(uploads));

// ===============================
// HEALTH CHECK (MongoDB Only)
// ===============================
app.get("/api/health", async (req, res) => {
  const health = {
    status: "ok",
    timestamp: new Date().toISOString(),
    mongodb: "unknown",
  };

  try {
    health.mongodb =
      mongoose.connection.readyState === 1 ? "connected" : "disconnected";
  } catch (err) {
    health.mongodb = "error";
  }

  res.json(health);
});

// Simple ping endpoint
app.get("/api/ping", (req, res) => {
  res.json({ success: true, message: "pong", timestamp: new Date().toISOString() });
});

// ===============================
// 404 HANDLER
// ===============================
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.originalUrl}`,
  });
});

// ===============================
// GLOBAL ERROR HANDLER
// ===============================
app.use((err, req, res, next) => {
  console.error("🔥 ERROR:", err.message);
  console.error(err.stack);

  res.status(500).json({
    success: false,
    message: err.message || "Internal server error",
  });
});

// ===============================
// DATABASE CONNECT (Original MongoDB Connection)
// ===============================
const connectDB = async () => {
  console.log("\n🔌 Connecting to MongoDB...");

  if (!process.env.MONGO_URI) {
    console.error("❌ MONGO_URI is not defined in .env file");
    console.log("\n💡 Please add to your .env file:");
    console.log("   MONGO_URI=mongodb://localhost:27017/your_database_name");
    process.exit(1);
  }

  try {
    // Original connection without deprecated options
    await mongoose.connect(process.env.MONGO_URI);
    console.log("🍃 MongoDB connected successfully");
    console.log(`   Database: ${mongoose.connection.name}`);
    console.log(`   Host: ${mongoose.connection.host}`);
  } catch (err) {
    console.error("❌ MongoDB connection failed:", err.message);
    process.exit(1);
  }
};

// ===============================
// START SERVER
// ===============================
const PORT = process.env.PORT || 4000;
const HOST = process.env.HOST || "0.0.0.0";

connectDB().then(() => {
  app.listen(PORT, HOST, () => {
    console.log("\n================================");
    console.log(`🚀 Server is running!`);
    console.log(`📍 URL: http://${HOST}:${PORT}`);
    console.log(`🕐 Started: ${new Date().toLocaleString()}`);
    console.log("================================\n");
  });
});