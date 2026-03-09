const mongoose = require("mongoose");

const fdmSchema = new mongoose.Schema({
  syncTag: {
    type: String,
    unique: true,
    sparse: true 
  },
  // 🚩 Defaults allow the email to sync even if the body is "Hello there"
  fleetType: { type: String, default: 'TBD' },
  tailNumber: { type: String, default: 'TBD' },
  occurrenceDate: { type: Date, default: Date.now },
  departureAirport: { type: String, uppercase: true, default: 'HAAB' },
  arrivalAirport: { type: String, uppercase: true, default: 'TBD' },
  eventName: { type: String, default: 'New Email Sync' },
  flightPhase: { type: String, default: 'TBD' },
  spi: { type: String, default: 'TBD' },
  status: {
    type: String,
    enum: ["Pending", "Closed: Briefing", "Closed: Training", "AUTO-SYNCED"],
    default: "AUTO-SYNCED" // 🚩 Must be this for the frontend table to see it
  },
  discussionHistory: [{
    subject: String,
    body: String,
    sender: String,
    date: { type: Date, default: Date.now }
  }],
  remarks: { type: String },
  attachments: [{
    fileName: String,
    filePath: String,
    uploadDate: { type: Date, default: Date.now },
    isArchived: { type: Boolean, default: false }
  }]
}, { timestamps: true });

module.exports = mongoose.model("FdmEvent", fdmSchema);