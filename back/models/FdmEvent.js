const mongoose = require("mongoose");

const DiscussionSchema = new mongoose.Schema(
  {
    message: { type: String, required: true },
    createdBy: { type: String, default: "system" },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const FdmEventSchema = new mongoose.Schema(
  {
    flightNumber: String,
    eventType: String,
    severity: String,
    description: String,

    occurrenceDate: {
      type: Date,
      default: Date.now,
    },

    status: {
      type: String,
      enum: ["open", "in_review", "closed"],
      default: "open",
    },

    discussionHistory: [DiscussionSchema],
  },
  { timestamps: true }
);

module.exports = mongoose.model("FdmEvent", FdmEventSchema);