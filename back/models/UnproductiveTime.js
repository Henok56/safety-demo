const mongoose = require("mongoose");

const unproductiveTimeSchema = new mongoose.Schema(
  {
    // 👤 AUTH USER
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    // 👷 TARGET EMPLOYEE
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      required: true,
      index: true,
    },

    type: {
      type: String,
      enum: ["medical leave", "morning leave", "negligence","maternity","vacation", "other"],
      required: true,
      index: true,
    },

    reason: {
      type: String,
      trim: true,
      maxlength: 500,
    },

    startTime: {
      type: Date,
      required: true,
    },

    endTime: {
      type: Date,
      default: null,
    },

    rawHoursLost: {
      type: Number,
      default: 0,
      min: 0,
    },

    finalHoursLost: {
      type: Number,
      default: 0,
      min: 0,
    },

    status: {
      type: String,
      enum: ["pending", "approved", "rejected", "auto_stopped", "stopped"],
      default: "pending",
      index: true,
    },

    recordedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      required: true,
    },

    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
    },

    rejectionReason: {
      type: String,
      trim: true,
      maxlength: 500,
    },

    attachmentUrl: String,

    isManuallyEdited: {
      type: Boolean,
      default: false,
    },

    // 🗑 SOFT DELETE
    isDeleted: {
      type: Boolean,
      default: false,
      index: true,
    },

    deletedAt: Date,

    deletedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    editHistory: [
      {
        editedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        editedAt: Date,
        changes: Object,
        editReason: String,
      },
    ],
  },
  { timestamps: true }
);

// 🔥 PREVENT INVALID TIME RANGE
unproductiveTimeSchema.pre("save", function () {
  if (this.endTime && this.endTime <= this.startTime) {
    throw new Error("End time must be after start time");
  }
});

// 🔥 COMPOUND INDEX (PERFORMANCE + SAFETY)
unproductiveTimeSchema.index({
  employee: 1,
  status: 1,
  isDeleted: 1,
});

// 🔥 PREVENT MULTIPLE ACTIVE TIMERS (PARTIAL INDEX)
unproductiveTimeSchema.index(
  { employee: 1, endTime: 1 },
  {
    unique: true,
    partialFilterExpression: { endTime: null, isDeleted: false },
  }
);

module.exports = mongoose.model("UnproductiveTime", unproductiveTimeSchema);
