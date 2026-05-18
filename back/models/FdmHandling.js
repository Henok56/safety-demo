const mongoose = require("mongoose");

const fdmHandlingSchema = new mongoose.Schema(
  {
    recordId: { type: String, required: true, unique: true, index: true },
    user: {
      userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", index: true },
      fullName: String,
    },
    employeeId: { type: mongoose.Schema.Types.ObjectId, ref: "Employee", default: null, index: true },
    fleetAssignmentId: { type: mongoose.Schema.Types.ObjectId, ref: "FleetAssignment", default: null, index: true },
    
  fleetFamily: {
  type: String,
  default: null,
  index: true,
},

    event: {
      eventId: String, // Kept for drill-down details
      eventName: String,
      acType: { type: String, required: true, index: true },
    },

    aircraftTail: { type: String, index: true },
    eventStatus: {
      type: String,
      enum: ["NotChecked", "ForReview", "Invalid", "Valid"],
      default: "NotChecked",
      index: true,
    },

    severity: {
      type: String,
      enum: ["LOW", "MEDIUM", "HIGH"],
      default: "LOW",
      index: true,
    },

    flightDate: { type: Date, index: true }, // Kept for detailed sorting
    qarDataIngestionDate: { type: Date, required: true, index: true },
    completedAt: { type: Date, default: null },

    // --- NEW PERFORMANCE TRACKING FIELDS ---
    performanceStatus: {
      type: String,
      enum: ["Above", "Below", "Goal Achieved"],
      default: null,
    },
    performanceReason: {
      type: String, // Populated if status is "Below"
      default: "",
    },
    // ----------------------------------------

    discussions: [
      {
        message: String,
        author: String,
        createdAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true, collection: "fdmhandling" }
);

// Optimized compound index for the dashboard aggregation
fdmHandlingSchema.index({ fleetFamily: 1, eventStatus: 1, severity: 1 });

module.exports = mongoose.model("FdmHandling", fdmHandlingSchema);