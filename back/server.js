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
console.log(`   NODE_ENV: ${process.env.NODE_ENV || "development"}`);
console.log(`   PORT: ${process.env.PORT || 4000}`);
console.log(`   MONGO_URI: ${process.env.MONGO_URI ? "✓ Set" : "✗ Missing"}`);
console.log(`   JWT_SECRET: ${process.env.JWT_SECRET ? "✓ Set" : "✗ Missing"}`);
console.log(`   ADMIN_EMAIL: ${process.env.ADMIN_EMAIL || "Not set"}`);

if (!process.env.MONGO_URI) {
  console.warn("⚠️ Missing MONGO_URI in .env file");
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
// SECURITY MIDDLEWARE
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
const morganFormat = process.env.NODE_ENV === "production" ? "combined" : "dev";
app.use(morgan(morganFormat));

app.use(mongoSanitize());

// ===============================
// RATE LIMIT
// ===============================
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === "production" ? 100 : 500,
  message: "Too many requests from this IP, please try again later.",
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

// ===============================
// CORS CONFIGURATION (FULLY FIXED)
// ===============================
const allowedOrigins = [
  // Local development
  "http://localhost:3000",
  "http://localhost:5173",
  "http://127.0.0.1:3000",
  "http://127.0.0.1:5173",
  
  // Netlify deployments
  "https://startling-pithivier-8781be.netlify.app",
  "https://safety-demo.netlify.app",
  "https://safetydemo.netlify.app",
  
  // Vercel deployments
  "https://safety-demo.vercel.app",
  "https://safety-frontend.vercel.app",
  
  // Custom domain (add yours if any)
  process.env.FRONTEND_URL,
].filter(Boolean);

// CORS middleware
app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (Postman, curl, server-to-server)
      if (!origin) {
        return callback(null, true);
      }
      
      // Check if origin is allowed
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      
      // In development, allow any origin for easier testing
      if (process.env.NODE_ENV !== "production") {
        return callback(null, true);
      }
      
      console.log(`❌ CORS blocked origin: ${origin}`);
      return callback(new Error("CORS not allowed"), false);
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Request-ID", "x-auth-token"],
    exposedHeaders: ["X-Request-ID"],
  })
);

// Handle preflight requests explicitly
app.options("*", cors());

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
// HEALTH CHECK
// ===============================
app.get("/api/health", async (req, res) => {
  const health = {
    status: "ok",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development",
    mongodb: "unknown",
    uptime: process.uptime(),
  };

  try {
    health.mongodb = mongoose.connection.readyState === 1 ? "connected" : "disconnected";
    if (health.mongodb === "connected") {
      health.database = mongoose.connection.name;
    }
  } catch (err) {
    health.mongodb = "error";
  }

  res.json(health);
});

// Simple ping endpoint
app.get("/api/ping", (req, res) => {
  res.json({
    success: true,
    message: "pong",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
  });
});

// ===============================
// ROOT ENDPOINT
// ===============================
app.get("/", (req, res) => {
  res.json({
    name: "Safety Office API",
    version: "1.0.0",
    status: "running",
    environment: process.env.NODE_ENV,
    endpoints: {
      health: "/api/health",
      ping: "/api/ping",
      auth: "/api/auth",
      hazards: "/api/hazard-tracking",
    },
  });
});

// ===============================
// 404 HANDLER
// ===============================
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.originalUrl}`,
    timestamp: new Date().toISOString(),
  });
});

// ===============================
// GLOBAL ERROR HANDLER
// ===============================
app.use((err, req, res, next) => {
  console.error("🔥 ERROR:", err.message);
  console.error(err.stack);

  const errorResponse = {
    success: false,
    message: err.message || "Internal server error",
    timestamp: new Date().toISOString(),
  };

  if (process.env.NODE_ENV !== "production") {
    errorResponse.stack = err.stack;
  }

  res.status(500).json(errorResponse);
});

// ===============================
// DATABASE CONNECTION
// ===============================
const connectDB = async () => {
  console.log("\n🔌 Connecting to MongoDB...");

  if (!process.env.MONGO_URI) {
    console.error("❌ MONGO_URI is not defined in .env file");
    console.log("\n💡 Please add to your .env file:");
    console.log("   MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/database");
    process.exit(1);
  }

  try {
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
// GRACEFUL SHUTDOWN
// ===============================
const shutdown = async () => {
  console.log("\n🛑 Shutting down gracefully...");
  try {
    await mongoose.connection.close();
    console.log("📦 MongoDB connection closed");
    process.exit(0);
  } catch (err) {
    console.error("Error during shutdown:", err);
    process.exit(1);
  }
};

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);

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
    console.log(`🌍 Environment: ${process.env.NODE_ENV || "development"}`);
    console.log(`📧 Admin Email: ${process.env.ADMIN_EMAIL}`);
    console.log(`🕐 Started: ${new Date().toLocaleString()}`);
    console.log("================================\n");
  });
});

// Export for Vercel serverless deployment
module.exports = app;