const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ChangeHistorySchema = new Schema(
  {
    action: { type: String }, // Added to track CREATE vs UPDATE
    changedBy: { type: String, required: true },
    changedAt: { type: Date, default: Date.now },
    changes: Schema.Types.Mixed
  },
  { _id: false }
);

const ScheduleSchema = new Schema(
  {
    activity: { type: String, required: true },
    startdate: { type: Date, required: true },
    duedate: { type: Date, required: true },
    // Changed from String to ObjectId reference
    assignedTo: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "User",
      default: null 
    },
    status: { 
      type: String, 
      enum: ["Pending", "In Progress", "Completed"], // Optional: enforce status types
      default: "Pending" 
    },
    notes: { type: String, default: "Follow the schedule as per assigned dates" },
    createdBy: { type: String, required: true },
    changeHistory: [ChangeHistorySchema]
  },
  { timestamps: true }
);

module.exports = mongoose.models.Schedule || mongoose.model("Schedule", ScheduleSchema);