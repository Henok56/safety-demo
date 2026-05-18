/*const { Pool } = require("pg");

const pool = new Pool({
  host: process.env.DB_HOST || "eth.cassiopee.studio",
  user: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD || undefined,
  database: process.env.DB_NAME,
  port: parseInt(process.env.DB_PORT || "5435", 10),

  ssl: {
    rejectUnauthorized: false,
  },

  // Pool tuning
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
});

// ==============================
// SINGLE STARTUP TEST
// ==============================
const testConnection = async () => {
  try {
    const res = await pool.query("SELECT NOW()");
    console.log("✅ PostgreSQL connection successful");
    console.log("   Server time:", res.rows[0].now);
  } catch (err) {
    console.error("❌ PostgreSQL connection failed:", err.message);
    console.error("   Host:", process.env.DB_HOST);
    console.error("   Port:", process.env.DB_PORT);
    console.error("   Database:", process.env.DB_NAME);
    console.error("   User:", process.env.DB_USERNAME);
  }
};

testConnection();

// ==============================
// ERROR HANDLING
// ==============================
pool.on("error", (err) => {
  console.error("❌ Unexpected PostgreSQL pool error:", err.message);
});

module.exports = pool;
*/