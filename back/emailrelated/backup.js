require("dotenv").config({ path: require("path").resolve(__dirname, "../.env") });

const cron = require("node-cron");
const fs = require("fs");
const path = require("path");
const archiver = require("archiver");

const { sendBackupEmail } = require("./mailer");

const backupDir = path.join(__dirname, "../../backup");

if (!fs.existsSync(backupDir)) {
  fs.mkdirSync(backupDir, { recursive: true });
}

// ====================================
// SCHEDULE BACKUP WITH ERROR HANDLING
// ====================================
try {
  cron.schedule("0 2 * * *", () => {
    try {
      const date = new Date().toISOString().split("T")[0];
      const outputPath = path.join(backupDir, `backup-${date}.zip`);

      const output = fs.createWriteStream(outputPath);
      const archive = archiver("zip", { zlib: { level: 9 } });

      output.on("close", async () => {
        try {
          const size = archive.pointer();

          console.log(`✅ Backup created: ${outputPath} (${(size / 1024).toFixed(2)} KB)`);

          // Send email notification
          try {
            await sendBackupEmail({ date, size });
            console.log("✅ Backup email sent");
          } catch (emailErr) {
            console.error("⚠️  Backup email failed:", emailErr.message);
            // Don't crash if email fails
          }

          // Cleanup old backups
          try {
            const files = fs
              .readdirSync(backupDir)
              .filter(f => f.endsWith(".zip"))
              .sort();

            while (files.length > 7) {
              const old = files.shift();
              const oldPath = path.join(backupDir, old);
              fs.unlinkSync(oldPath);
              console.log(`🗑️  Deleted old backup: ${old}`);
            }
          } catch (cleanupErr) {
            console.error("⚠️  Cleanup error:", cleanupErr.message);
          }
        } catch (err) {
          console.error("❌ Backup completion error:", err.message);
        }
      });

      // Handle archive errors
      archive.on("error", (err) => {
        console.error("❌ Archive error:", err.message);
      });

      // Handle output stream errors
      output.on("error", (err) => {
        console.error("❌ Output stream error:", err.message);
      });

      archive.pipe(output);

      const uploads = path.join(__dirname, "../uploads");

      if (fs.existsSync(uploads)) {
        try {
          archive.directory(uploads, "uploads");
        } catch (err) {
          console.warn("⚠️  Could not add uploads to backup:", err.message);
        }
      } else {
        console.warn("⚠️  Uploads directory not found");
      }

      archive.finalize();
    } catch (err) {
      console.error("❌ Backup scheduler error:", err.message);
    }
  });

  console.log("⏰ Backup scheduler running daily at 2:00 AM");
} catch (err) {
  console.error("❌ Failed to initialize backup scheduler:", err.message);
}