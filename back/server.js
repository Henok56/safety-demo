require("dotenv").config({ path: require("path").resolve(__dirname, ".env") });

const fs = require("fs");
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
const helmet = require("helmet");
const compression = require("compression");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");

const { sendCrashAlert } = require("./emailrelated/mailer");

const app = express();

/* ===============================
   BASIC MIDDLEWARE
================================ */

app.disable("x-powered-by");
app.use(compression());
app.use(express.json({ limit: "5mb" }));
app.use(express.urlencoded({ extended: true, limit: "5mb" }));

if (process.env.NODE_ENV === "production") {
  app.use(morgan("combined"));
} else {
  app.use(morgan("dev"));
}

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 500,
  message: "Too many requests from this IP. Please try again later."
});

app.use("/api", apiLimiter);

if (process.env.NODE_ENV === "production") {
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          imgSrc: ["'self'", "data:"],
          connectSrc: ["'self'", "https://api.yourdomain.com", "wss://api.yourdomain.com"]
        }
      }
    })
  );
} else {
  app.use(helmet({ contentSecurityPolicy: false }));
}

const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5174",
  "http://localhost:5000",
  "http://localhost:80",
  "http://localhost",
  "https://www.yourdomain.com",
  "https://api.yourdomain.com"
];

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    const isLocal =
      origin.includes("localhost") ||
      /^http:\/\/(10|172|192)\./.test(origin);

    if (allowedOrigins.includes(origin) || isLocal) {
      callback(null, true);
    } else {
      console.warn(`🚨 Blocked CORS request from: ${origin}`);
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
};

app.use(cors(corsOptions));

/* ===============================
   STATIC FILES
================================ */

app.use(
  "/uploads",
  (req, res, next) => {
    try {
      req.url = decodeURIComponent(req.url);
      next();
    } catch {
      res.status(400).send("Invalid URL encoding");
    }
  },
  express.static(path.join(__dirname, "uploads"))
);

/* ===============================
   HEALTH CHECK (BEFORE MONGO)
================================ */

app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    uptime: process.uptime(),
    mongoState: mongoose.connection.readyState,
    env: process.env.NODE_ENV || "development"
  });
});

/* ===============================
   MONGODB CONNECTION & STARTUP
================================ */

const PORT = process.env.PORT || 4000;

const getMongoUri = () => {
  if (process.env.MONGO_URI) return process.env.MONGO_URI;

  const secretPath = "/run/secrets/mongo_uri";

  try {
    if (fs.existsSync(secretPath)) {
      const secret = fs.readFileSync(secretPath, "utf8").trim();
      if (secret) return secret;
    }
  } catch (e) {
    console.warn("Could not read mongo secret:", e.message);
  }

  return null;
};

const mongoUri = getMongoUri();

if (!mongoUri) {
  console.error("❌ MongoDB connection string missing.");
  process.exit(1);
}

let server;

// Connect to MongoDB first
mongoose
  .connect(mongoUri)
  .then(() => {
    console.log("✅ MongoDB Connected");

    // THEN load routes
    console.log("📦 Loading routes...");

    try {
      app.use("/api/auth", require("./routes/authRoutes"));
      console.log("  ✅ Auth routes loaded");
    } catch (err) {
      console.error("  ❌ Auth routes failed:", err.message);
    }

    try {
      app.use("/api/occurrences", require("./routes/occurrenceRoutes"));
      console.log("  ✅ Occurrence routes loaded");
    } catch (err) {
      console.error("  ❌ Occurrence routes failed:", err.message);
    }

    try {
      app.use("/api/admin", require("./routes/adminRoutes"));
      console.log("  ✅ Admin routes loaded");
    } catch (err) {
      console.error("  ❌ Admin routes failed:", err.message);
    }

    try {
      app.use("/api/schedules", require("./routes/scheduleRoutes"));
      console.log("  ✅ Schedule routes loaded");
    } catch (err) {
      console.error("  ❌ Schedule routes failed:", err.message);
    }

    try {
      app.use("/api/admin/audit", require("./routes/auditRoutes"));
      console.log("  ✅ Audit routes loaded");
    } catch (err) {
      console.error("  ❌ Audit routes failed:", err.message);
    }

    try {
      app.use("/api/fdm", require("./routes/fdmRoutes"));
      console.log("  ✅ FDM routes loaded");
    } catch (err) {
      console.error("  ❌ FDM routes failed:", err.message);
    }

    try {
      app.use("/api/employees", require("./routes/employee.routes"));
      console.log("  ✅ Employee routes loaded");
    } catch (err) {
      console.error("  ❌ Employee routes failed:", err.message);
    }

    try {
      app.use("/api/trainings", require("./routes/training.routes"));
      console.log("  ✅ Training routes loaded");
    } catch (err) {
      console.error("  ❌ Training routes failed:", err.message);
    }

    try {
      app.use("/api/career", require("./routes/careerDevelopment.routes"));
      console.log("  ✅ Career routes loaded");
    } catch (err) {
      console.error("  ❌ Career routes failed:", err.message);
    }

    try {
      app.use("/api/recurrent-training", require("./routes/recurrentTraining.routes"));
      console.log("  ✅ Recurrent training routes loaded");
    } catch (err) {
      console.error("  ❌ Recurrent training routes failed:", err.message);
    }

    try {
      app.use("/api/leadership", require("./routes/leadershipDevelopment.routes"));
      console.log("  ✅ Leadership routes loaded");
    } catch (err) {
      console.error("  ❌ Leadership routes failed:", err.message);
    }

    try {
      app.use("/api/coaching", require("./routes/coaching.routes"));
      console.log("  ✅ Coaching routes loaded");
    } catch (err) {
      console.error("  ❌ Coaching routes failed:", err.message);
    }

    try {
      app.use("/api/succession", require("./routes/successionPlanning.routes"));
      console.log("  ✅ Succession routes loaded");
    } catch (err) {
      console.error("  ❌ Succession routes failed:", err.message);
    }

    try {
      app.use("/api/talents", require("./routes/talentRoutes"));
      console.log("  ✅ Talent routes loaded");
    } catch (err) {
      console.error("  ❌ Talent routes failed:", err.message);
    }

    // Load backup safely
    try {
      require("./emailrelated/backup");
      console.log("  ✅ Backup scheduler loaded");
    } catch (err) {
      console.error("  ⚠️  Backup scheduler failed:", err.message);
    }

    console.log("📦 All routes loaded!");

    /* ===============================
       404 HANDLER (AFTER ALL ROUTES)
    ================================ */
    app.use("/api/*path", (req, res) => {
      res.status(404).json({
        success: false,
        message: "API route not found"
      });
    });

    /* ===============================
       ERROR HANDLER
    ================================ */
    app.use((err, req, res, next) => {
      console.error("💥 SYSTEM ERROR:", err.stack || err);

      res.status(500).json({
        success: false,
        message: "Internal Flight System Error",
        error: process.env.NODE_ENV === "development" ? err.message : undefined
      });
    });

    // THEN start the server
    server = app.listen(PORT, "0.0.0.0", () => {
      console.log(`\n🚀 Server running: http://0.0.0.0:${PORT}`);
      console.log(`📡 Mode: ${process.env.NODE_ENV}`);
      console.log(`✨ System is LIVE!\n`);
    });
  })
  .catch((err) => {
    console.error("❌ MongoDB connection failed:", err.message);
    process.exit(1);
  });

/* ===============================
   GRACEFUL SHUTDOWN
================================ */

const shutdown = async () => {
  console.log("🛑 Graceful shutdown initiated...");

  if (server) {
    server.close(() => console.log("HTTP server closed."));
  }

  try {
    await mongoose.connection.close(false);
    console.log("MongoDB closed.");
  } catch (e) {
    console.warn("Mongo shutdown error:", e.message);
  }

  process.exit(0);
};

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);

/* ===============================
   CRASH MONITORING
================================ */

process.on("uncaughtException", async (err) => {
  console.error("💥 Uncaught Exception:", err);

  try {
    await sendCrashAlert({ error: err.stack || err.message });
  } catch (e) {
    console.error("Crash alert email failed:", e.message);
  }

  process.exit(1);
});

process.on("unhandledRejection", async (reason) => {
  console.error("💥 Unhandled Rejection:", reason);

  try {
    await sendCrashAlert({ error: String(reason) });
  } catch (e) {
    console.error("Crash alert email failed:", e.message);
  }
});