const mongoose = require("mongoose");

const employeeSchema = new mongoose.Schema(
  {
regNo: {
  type: String,
  unique: true,
  required: false,
  trim: true,
  uppercase: true,
  default: null,
  validate: {
    validator: function (v) {
      return !v || /^[A-Z0-9-]+$/.test(v);
    },
    message: "Invalid registration number format",
  },
},

    userAccount: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      unique: true,
      sparse: true,
      index: true,
    },

    costCenter: {
      type: String,
      trim: true,
    },

    currentPosition: {
      type: String,
      trim: true,
    },

    department: {
      type: String,
      trim: true,
      index: true,
    },

    dateOfJoining: {
      type: Date,
    },

    onboardedBy: {
      type: String,
      trim: true,
    },

    lastUpdatedBy: {
      type: String,
      trim: true,
    },

    status: {
      type: String,
      enum: ["active", "inactive", "suspended"],
      default: "active",
      index: true,
    },

    totalLostHours: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  { timestamps: true }
);

// 🔥 INDEX FOR PERFORMANCE
employeeSchema.index({ department: 1, status: 1 });

module.exports = mongoose.model("Employee", employeeSchema);