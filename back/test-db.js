require("dotenv").config();
const pool = require("./config/postgres");

const test = async () => {
  try {
    const result = await pool.query(`
      SELECT
        current_database() AS db,
        current_user AS user,
        inet_server_addr() AS server_ip,
        inet_server_port() AS port,
        version()
    `);

    console.log("✅ DATABASE CONNECTED SUCCESSFULLY");
    console.log(result.rows[0]);
  } catch (err) {
    console.error("❌ DB CONNECTION FAILED:");
    console.error(err.message);
  } finally {
    process.exit();
  }
};

test();